import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.db.seed import seed_database
from app.core.security import hash_password, create_access_token
from app.models.user import User
from app.models.role import Role
from app.models.jurisdiction import Jurisdiction, JurisdictionType
from app.models.user_role_jurisdiction import UserRoleJurisdiction
from app.models.audit_log import AuditLog
from app.models.project_proposal import ProjectProposal, WorkflowStage
from app.models.project_dpr import ProjectDpr
from app.models.project_gis_corridor import ProjectGisCorridor
from app.models.land_parcel import LandParcel
from app.models.escrow_account import EscrowAccount
from app.models.cala_appointment import CalaAppointment
from app.models.expert_committee_appraisal import ExpertCommitteeAppraisal


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    seed_database()
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_auth_token(email: str, db: Session) -> str:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ValueError(f"User {email} not found in database")
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return token


# ==============================================================================
# PHASE 2 WORKFLOW & STATE MACHINE INTEGRATION TESTS
# ==============================================================================

def test_full_phase2_proposal_and_state_gateway_flow(client: TestClient, db: Session):
    """
    Workflow-Ready Integration Test for Phase 2:
    1. NHAI creates Proposal (STAGE_1_REQUISITION).
    2. Attaches DPR document.
    3. Ingests GIS corridor polygon -> triggers MahaBhulekh simulator parcel extraction.
       - Validates data_source="SIMULATED_MAHABHULEKH_ADAPTER" and api_version="v2.4-sim".
       - Validates estimated_affected_parcels_count and estimated_affected_families_count.
    4. Inspects & Tops up Escrow account.
    5. Submits proposal to State Gateway -> Transitions to STAGE_2_STATE_SCRUTINY.
    6. State Revenue Nodal scrutinizes proposal (conflict check + multiplier compliance).
    7. State Revenue Nodal appoints District Collector as CALA -> Transitions to STAGE_3_CALA_APPOINTED.
    8. Expert Committee records appraisal gate -> Advances to STAGE_5_EXPERT_COMMITTEE_GATE.
    9. Verifies Cross-Platform Security Audit Trail records.
    """
    # Clean previous test proposal runs
    db.query(ProjectProposal).filter(ProjectProposal.project_title.like("%Pune Ring Road%")).delete()
    db.commit()

    token_nhai = get_auth_token("officer.nhai@nlams.gov.demo", db)
    token_state = get_auth_token("state.maharashtra@nlams.gov.demo", db)
    headers_nhai = {"Authorization": f"Bearer {token_nhai}"}
    headers_state = {"Authorization": f"Bearer {token_state}"}

    # 1. Create Proposal (STAGE_1_REQUISITION)
    pune_dist = db.query(Jurisdiction).filter(Jurisdiction.name == "Pune", Jurisdiction.type == JurisdictionType.DISTRICT).first()
    district_id = pune_dist.id if pune_dist else 2

    proposal_payload = {
        "project_title": "Pune Ring Road (East Corridor) Greenfield Expressway",
        "requiring_agency": "NHAI",
        "ministry": "Ministry of Road Transport and Highways (MoRTH)",
        "public_purpose": "Decongestion of Pune Metropolitan Region & Greenfield Logistics Bypass",
        "description": "8-lane access-controlled greenfield expressway connecting Theur to Uruli Kanchan.",
        "estimated_budget_inr": 5500000000.0,
        "required_area_ha": 42.5,
        "target_district_id": district_id,
        "target_taluka_ids": "1,2",
    }
    res_prop = client.post("/api/v1/proposals", json=proposal_payload, headers=headers_nhai)
    assert res_prop.status_code == 201, res_prop.text
    prop_data = res_prop.json()
    proposal_id = prop_data["id"]
    assert prop_data["current_stage"] == WorkflowStage.STAGE_1_REQUISITION
    assert prop_data["status"] == "DRAFT"
    assert "PROP-2026-MHA-NHAI" in prop_data["proposal_code"]

    # 2. Upload DPR Document
    res_dpr = client.post(
        f"/api/v1/proposals/{proposal_id}/dpr?document_name=DPR_Final_Alignment_Rev2.pdf&document_type=DPR&file_path=/uploads/dpr/pune_ring_road_dpr.pdf",
        headers=headers_nhai,
    )
    assert res_dpr.status_code == 200, res_dpr.text
    assert res_dpr.json()["document_name"] == "DPR_Final_Alignment_Rev2.pdf"

    # 3. Ingest Interactive GIS Corridor & Auto-Populate Land Registry Parcels
    gis_payload = {
        "geojson_data": {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [[73.8500, 18.5200], [73.8700, 18.5300], [73.8900, 18.5100], [73.8500, 18.5200]]
                        ]
                    },
                    "properties": {"alignment_section": "Package 3 - Haveli"}
                }
            ]
        },
        "bounding_box": "73.85,18.51,73.89,18.53",
        "corridor_length_km": 32.4,
        "corridor_width_meters": 70.0,
    }
    res_gis = client.post(f"/api/v1/proposals/{proposal_id}/gis-corridor", json=gis_payload, headers=headers_nhai)
    assert res_gis.status_code == 200, res_gis.text

    # Verify auto-extracted parcels & adapter provenance
    res_parcels = client.get(f"/api/v1/proposals/{proposal_id}/parcels", headers=headers_nhai)
    assert res_parcels.status_code == 200, res_parcels.text
    parcels = res_parcels.json()
    assert len(parcels) >= 4
    first_parcel = parcels[0]
    assert first_parcel["village_name"] in ["Wagholi", "Manjari Khurd", "Kharadi", "Loni Kalbhor", "Uruli Kanchan"]
    assert first_parcel["owner_name"] is not None
    assert first_parcel["data_source"] == "SIMULATED_MAHABHULEKH_ADAPTER"
    assert first_parcel["api_version"] == "v2.4-sim"

    # Check updated proposal counts
    res_prop_updated = client.get(f"/api/v1/proposals/{proposal_id}", headers=headers_nhai)
    assert res_prop_updated.json()["estimated_affected_parcels_count"] == len(parcels)
    assert res_prop_updated.json()["estimated_affected_families_count"] >= len(parcels)

    # 4. Inspect & Deposit Escrow Funds
    res_escrow = client.get(f"/api/v1/escrow/{proposal_id}", headers=headers_nhai)
    assert res_escrow.status_code == 200, res_escrow.text
    escrow_data = res_escrow.json()
    assert escrow_data["total_sanctioned_inr"] == 5500000000.0
    assert escrow_data["balance_inr"] > 0

    res_deposit = client.post(
        f"/api/v1/escrow/{proposal_id}/deposit",
        json={"amount": 1000000000.0},
        headers=headers_nhai,
    )
    assert res_deposit.status_code == 200, res_deposit.text
    assert res_deposit.json()["balance_inr"] > escrow_data["balance_inr"]

    # 5. Submit Proposal to State Gateway -> STAGE_2_STATE_SCRUTINY
    res_submit = client.post(f"/api/v1/proposals/{proposal_id}/submit", headers=headers_nhai)
    assert res_submit.status_code == 200, res_submit.text
    assert res_submit.json()["current_stage"] == WorkflowStage.STAGE_2_STATE_SCRUTINY

    # 6. State Revenue Nodal Scrutiny
    res_state_list = client.get("/api/v1/state-gateway/proposals", headers=headers_state)
    assert res_state_list.status_code == 200, res_state_list.text
    assert any(p["id"] == proposal_id for p in res_state_list.json())

    scrutiny_payload = {
        "conflict_status": "NO_CONFLICT",
        "conflict_notes": "Corridor vetted against Maharashtra Eco-Sensitive Zones; no forest land involved.",
        "multiplier_verified": True,
        "approved": True,
    }
    res_scrutiny = client.post(
        f"/api/v1/state-gateway/proposals/{proposal_id}/scrutinize",
        json=scrutiny_payload,
        headers=headers_state,
    )
    assert res_scrutiny.status_code == 200, res_scrutiny.text
    assert res_scrutiny.json()["multiplier_compliance_verified"] is True

    # 7. State Revenue Nodal Appoints District Collector as CALA -> STAGE_3_CALA_APPOINTED
    collector_user = db.query(User).filter(User.email == "collector.pune@nlams.gov.demo").first()
    assert collector_user is not None

    cala_payload = {
        "district_id": district_id,
        "collector_user_id": collector_user.id,
        "gazette_notification_ref": "MAH-GOV-GAZ-2026/PUN-RINGROAD-CALA-042",
    }
    res_cala = client.post(
        f"/api/v1/state-gateway/proposals/{proposal_id}/appoint-cala",
        json=cala_payload,
        headers=headers_state,
    )
    assert res_cala.status_code == 200, res_cala.text
    cala_data = res_cala.json()
    assert cala_data["collector_user_id"] == collector_user.id

    # Verify stage transition to STAGE_3_CALA_APPOINTED
    res_cala_stage = client.get(f"/api/v1/proposals/{proposal_id}", headers=headers_nhai)
    assert res_cala_stage.json()["current_stage"] == WorkflowStage.STAGE_3_CALA_APPOINTED

    # 8. Expert Committee Records Statutory Appraisal Gate -> STAGE_5_EXPERT_COMMITTEE_GATE
    expert_payload = {
        "committee_chairperson": "Dr. V. M. Gadgil, Chairman (SIA Expert Panel)",
        "recommendation_status": "RECOMMENDED_FOR_ACQUISITION",
        "clearance_remarks": "SIA study demonstrates legitimate public purpose and minimal displacement of agricultural landowners.",
        "public_purpose_verified": True,
        "minimal_land_verified": True,
        "simp_feasibility_verified": True,
        "signed_by_expert_ids": ["Dr. Gadgil", "Prof. Deshpande", "Panchayat Rep Shri Patil"],
    }
    res_expert = client.post(
        f"/api/v1/state-gateway/proposals/{proposal_id}/expert-appraisal",
        json=expert_payload,
        headers=headers_state,
    )
    assert res_expert.status_code == 200, res_expert.text
    assert res_expert.json()["recommendation_status"] == "RECOMMENDED_FOR_ACQUISITION"

    # Verify proposal state machine reached STAGE_5_EXPERT_COMMITTEE_GATE
    res_expert_stage = client.get(f"/api/v1/proposals/{proposal_id}", headers=headers_nhai)
    assert res_expert_stage.json()["current_stage"] == WorkflowStage.STAGE_5_EXPERT_COMMITTEE_GATE
    assert res_expert_stage.json()["status"] == "SIA_CLEARED_BY_EXPERT_COMMITTEE"

    # 9. Verify Cross-Platform Security Audit Trail Logging
    audit_events = db.query(AuditLog).all()
    event_types = [a.event_type for a in audit_events]
    assert "PROPOSAL_CREATED" in event_types
    assert "DPR_DOCUMENT_UPLOADED" in event_types
    assert "GIS_CORRIDOR_INGESTED" in event_types
    assert "PROPOSAL_SUBMITTED_TO_STATE" in event_types
    assert "PROPOSAL_SCRUTINY_COMPLETED" in event_types
    assert "CALA_APPOINTED_BY_STATE" in event_types
    assert "EXPERT_COMMITTEE_APPRAISAL_RECORDED" in event_types
