import json
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.db.seed import seed_database
from app.core.security import create_access_token
from app.models.user import User
from app.models.jurisdiction import Jurisdiction, JurisdictionType
from app.models.project_proposal import ProjectProposal, WorkflowStage
from app.models.land_parcel import LandParcel
from app.models.section15_objection import Section15Objection
from app.models.citizen_claim import CitizenClaim
from app.models.statutory_award import StatutoryAward
from app.services.proposal_service import ProposalService
from app.services.statutory_valuation_engine import StatutoryValuationEngine


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


def get_token(email: str, db: Session) -> str:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ValueError(f"User {email} not found")
    return create_access_token({"sub": str(user.id), "email": user.email})


# ==============================================================================
# PHASE 3 CALA STATUTORY ADJUDICATION & MODULAR VALUATION TESTS
# ==============================================================================

def test_modular_statutory_valuation_engine_and_citations():
    """
    Validates that StatutoryValuationEngine produces separate, auditable
    computation modules with explicit statutory citations.
    """
    sec11_date = datetime.utcnow() - timedelta(days=180) # 6 months ago
    award_date = datetime.utcnow()

    breakdown = StatutoryValuationEngine.compute_full_statutory_award(
        survey_number="104/2",
        affected_area_ha=2.5,
        land_category="BAGAYAT_IRRIGATED",
        circle_rate_inr_per_ha=4000000.0, # ₹40 Lakh/ha
        avg_top_sale_deeds_rate_inr_per_ha=5000000.0, # ₹50 Lakh/ha (Higher)
        is_rural=True,
        distance_from_urban_boundary_km=15.0, # Multiplier = 1.5x
        structures_pwd_dsr_inr=500000.0,
        trees_horticulture_inr=150000.0,
        standing_crops_inr=50000.0,
        sec11_published_at=sec11_date,
        award_declaration_date=award_date,
    )

    # 1. Base Market Value Check (Higher of circle vs sale deeds: ₹50 Lakh * 2.5 ha = ₹1.25 Cr)
    assert breakdown.base_land_value_inr == 12500000.0
    mv_comp = breakdown.market_value_component
    assert mv_comp.parameters_applied["selected_criterion"] == "sale_deeds_avg"
    assert "Section 26(1)" in mv_comp.statutory_citation.section

    # 2. Multiplier Check (₹1.25 Cr * 1.5 = ₹1.875 Cr)
    assert breakdown.multiplied_land_value_inr == 18750000.0
    mult_comp = breakdown.multiplier_component
    assert mult_comp.parameters_applied["multiplier_factor"] == 1.50
    assert "Section 26(2)" in mult_comp.statutory_citation.section

    # 3. Assets Valuation (₹5L + ₹1.5L + ₹50k = ₹7 Lakh)
    assert breakdown.total_assets_valuation_inr == 700000.0
    asset_comp = breakdown.assets_valuation_component
    assert "Section 29" in asset_comp.statutory_citation.section

    # 4. Solatium 100% (100% of Land ₹1.875 Cr + Assets ₹7L = ₹1.945 Cr)
    assert breakdown.total_solatium_inr == 19450000.0
    sol_comp = breakdown.solatium_component
    assert "Section 30(1)" in sol_comp.statutory_citation.section

    # 5. Additional Market Value (12% p.a. on ₹1.25 Cr for ~0.493 years = ~₹73,921)
    assert breakdown.total_additional_market_value_inr > 70000.0
    sec30_3_comp = breakdown.additional_market_value_component
    assert "Section 30(3)" in sec30_3_comp.statutory_citation.section

    # 6. Grand Total Sum
    expected_total = (
        breakdown.multiplied_land_value_inr
        + breakdown.total_solatium_inr
        + breakdown.total_assets_valuation_inr
        + breakdown.total_additional_market_value_inr
    )
    assert breakdown.grand_total_award_inr == round(expected_total, 2)


def test_section11_publish_and_nlams_simulated_restriction_layer(client: TestClient, db: Session):
    """
    Validates Section 11 preliminary notification issuance, 60-day timer,
    and the NLAMS Registry Restriction Layer.
    """
    token_collector = get_token("collector.pune@nlams.gov.demo", db)
    token_nhai = get_token("officer.nhai@nlams.gov.demo", db)
    headers_collector = {"Authorization": f"Bearer {token_collector}"}
    headers_nhai = {"Authorization": f"Bearer {token_nhai}"}

    # 1. Create a Proposal & attach GIS corridor
    pune_dist = db.query(Jurisdiction).filter(Jurisdiction.name == "Pune", Jurisdiction.type == JurisdictionType.DISTRICT).first()
    nhai_user = db.query(User).filter(User.email == "officer.nhai@nlams.gov.demo").first()
    
    proposal = ProposalService.create_proposal(
        db=db,
        user=nhai_user,
        project_title="Phase 3 Adjudication Verification Expressway",
        requiring_agency="NHAI",
        ministry="MoRTH",
        public_purpose="Greenfield Corridor",
        estimated_budget_inr=2000000000.0,
        required_area_ha=30.0,
        target_district_id=pune_dist.id if pune_dist else 2,
    )
    proposal_id = proposal.id

    gis_payload = {
        "geojson_data": {
            "type": "FeatureCollection",
            "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[73.85, 18.52], [73.86, 18.53], [73.87, 18.51], [73.85, 18.52]]]}}]
        },
        "bounding_box": "73.85,18.51,73.87,18.53",
    }
    client.post(f"/api/v1/proposals/{proposal_id}/gis-corridor", json=gis_payload, headers=headers_nhai)

    # 2. Advance proposal to Expert Committee Gate
    proposal.current_stage = WorkflowStage.STAGE_5_EXPERT_COMMITTEE_GATE
    db.commit()

    # 3. Collector publishes Section 11 Preliminary Notification
    sec11_payload = {
        "gazette_notification_no": "MAH-REV-GAZ-2026/PUN-EXP-11-088",
        "public_notice_summary": "Preliminary notification for acquisition of 30.0 ha in Haveli Tehsil.",
    }
    res_sec11 = client.post(
        f"/api/v1/adjudication/proposals/{proposal_id}/publish-sec11",
        json=sec11_payload,
        headers=headers_collector,
    )
    assert res_sec11.status_code == 200, res_sec11.text
    sec11_data = res_sec11.json()

    assert sec11_data["sec11_notification_no"] == "MAH-REV-GAZ-2026/PUN-EXP-11-088"
    assert sec11_data["current_stage"] == WorkflowStage.STAGE_6_SEC11_PRELIMINARY_NOTIF
    assert sec11_data["remaining_objection_days"] >= 59
    assert sec11_data["is_objection_window_open"] is True

    # Check NLAMS Registry Restriction Layer
    restriction = sec11_data["registry_restriction_layer"]
    assert restriction["status"] == "ACTIVE"
    assert restriction["restriction_layer"] == "NLAMS_SIMULATION_GATEWAY"
    assert restriction["sale_subdivision_locked"] is True
    assert restriction["title_transfer_locked"] is True
    assert restriction["mutation_mortgage_locked"] is True
    assert restriction["restricted_parcels_count"] >= 4


def test_section15_objections_and_hearing_disposal(client: TestClient, db: Session):
    """
    Validates citizen Section 15 objection submission, LAO hearing scheduling,
    and formal disposal orders.
    """
    token_citizen = get_token("citizen@example.com", db)
    token_lao = get_token("lao.pune@nlams.gov.demo", db)
    token_collector = get_token("collector.pune@nlams.gov.demo", db)

    headers_citizen = {"Authorization": f"Bearer {token_citizen}"}
    headers_lao = {"Authorization": f"Bearer {token_lao}"}
    headers_collector = {"Authorization": f"Bearer {token_collector}"}

    proposal = db.query(ProjectProposal).filter(ProjectProposal.project_title.like("%Phase 3 Adjudication%")).first()
    assert proposal is not None
    proposal_id = proposal.id

    # 1. Citizen files Section 15 objection
    obj_payload = {
        "survey_number": "101/1",
        "village_name": "Wagholi",
        "objector_name": "Rajesh Patil",
        "objection_category": "AREA_DISCREPANCY",
        "description": "Recorded area in RoR is 3.5 ha; proposed acquisition corridor encroaches on unacquired well.",
    }
    res_obj = client.post(
        f"/api/v1/adjudication/proposals/{proposal_id}/objections",
        json=obj_payload,
        headers=headers_citizen,
    )
    assert res_obj.status_code == 201, res_obj.text
    obj_data = res_obj.json()
    objection_id = obj_data["id"]
    assert obj_data["disposal_status"] == "FILED"

    # 2. LAO schedules formal hearing
    lao_user = db.query(User).filter(User.email == "lao.pune@nlams.gov.demo").first()
    hearing_payload = {
        "hearing_date": (datetime.utcnow() + timedelta(days=14)).isoformat(),
        "hearing_location": "SLAO Court Room No 3, Pune Collectorate",
        "hearing_officer_user_id": lao_user.id,
    }
    res_sched = client.post(
        f"/api/v1/adjudication/objections/{objection_id}/schedule-hearing",
        json=hearing_payload,
        headers=headers_lao,
    )
    assert res_sched.status_code == 200, res_sched.text
    assert res_sched.json()["disposal_status"] == "HEARING_SCHEDULED"

    # 3. CALA / LAO issues formal disposal order
    disp_payload = {
        "disposal_status": "DISMISSED_WITH_ORDER",
        "disposal_order_no": "DISP-ORD-2026-PUN-HAVELI-0012",
        "disposal_order_summary": "Joint measurement survey verified well is outside corridor boundary. Objection dismissed.",
        "hearing_minutes": "Objector appeared with Talathi. Cadastral overlay confirmed zero encroachment on well structure.",
    }
    res_disp = client.post(
        f"/api/v1/adjudication/objections/{objection_id}/dispose",
        json=disp_payload,
        headers=headers_lao,
    )
    assert res_disp.status_code == 200, res_disp.text
    assert res_disp.json()["disposal_status"] == "DISMISSED_WITH_ORDER"
    assert res_disp.json()["disposal_order_no"] == "DISP-ORD-2026-PUN-HAVELI-0012"


def test_dual_pane_claim_verification_and_statutory_award(client: TestClient, db: Session):
    """
    Validates Dual-Pane Claim Verification Queue ("Approve/Verify Claim for Award Processing"),
    modular parcel valuation (Stage 9), and Section 23/30 Statutory Award pronouncement (Stage 10).
    """
    token_citizen = get_token("citizen@example.com", db)
    token_lao = get_token("lao.pune@nlams.gov.demo", db)
    token_collector = get_token("collector.pune@nlams.gov.demo", db)

    headers_citizen = {"Authorization": f"Bearer {token_citizen}"}
    headers_lao = {"Authorization": f"Bearer {token_lao}"}
    headers_collector = {"Authorization": f"Bearer {token_collector}"}

    proposal = db.query(ProjectProposal).filter(ProjectProposal.project_title.like("%Phase 3 Adjudication%")).first()
    assert proposal is not None
    proposal_id = proposal.id

    parcels = db.query(LandParcel).filter(LandParcel.proposal_id == proposal_id).all()
    first_parcel = parcels[0]

    # 1. Citizen submits claim for dual-pane review
    claim_payload = {
        "parcel_id": first_parcel.id,
        "claimant_name": "Rajesh Patil",
        "survey_number": first_parcel.survey_number,
        "village_name": first_parcel.village_name,
        "uploaded_title_deed_url": "/uploads/claims/patil_deed_reg_2018.pdf",
        "uploaded_7_12_extract_url": "/uploads/claims/patil_7_12_extract.pdf",
        "bank_account_no": "987654321099",
        "bank_ifsc_code": "SBIN0001234",
        "bank_name": "State Bank of India (Pune Main)",
        "claimed_area_ha": first_parcel.affected_area_ha or 1.25,
        "claimed_share_fraction": "1/1",
    }
    res_claim = client.post(
        f"/api/v1/adjudication/proposals/{proposal_id}/claims",
        json=claim_payload,
        headers=headers_citizen,
    )
    assert res_claim.status_code == 201, res_claim.text
    claim_id = res_claim.json()["id"]

    # 2. LAO reviews claim: "Approve/Verify Claim for Award Processing" (Decoupled from payment!)
    adj_payload = {
        "adjudication_status": "VERIFIED_FOR_AWARD",
        "discrepancy_flag": False,
        "adjudication_notes": "Title deed registered with Sub-Registrar Haveli verified. 7/12 RoR unencumbered. Verified for Award.",
    }
    res_adj = client.post(
        f"/api/v1/adjudication/claims/{claim_id}/adjudicate",
        json=adj_payload,
        headers=headers_lao,
    )
    assert res_adj.status_code == 200, res_adj.text
    assert res_adj.json()["adjudication_status"] == "VERIFIED_FOR_AWARD"

    # 3. Stage 9: LAO computes modular statutory valuation per parcel
    val_payload = {
        "parcel_id": first_parcel.id,
        "circle_rate_inr_per_ha": 4500000.0,
        "avg_top_sale_deeds_rate_inr_per_ha": 5500000.0,
        "is_rural": True,
        "distance_from_urban_boundary_km": 14.0,
        "structures_pwd_dsr_inr": 350000.0,
        "trees_horticulture_inr": 80000.0,
        "standing_crops_inr": 20000.0,
    }
    res_val = client.post(
        f"/api/v1/adjudication/proposals/{proposal_id}/valuation",
        json=val_payload,
        headers=headers_lao,
    )
    assert res_val.status_code == 200, res_val.text
    award_data = res_val.json()
    award_id = award_data["id"]
    assert award_data["total_statutory_award_inr"] > 0
    assert award_data["is_pronounced"] is False

    # Check breakdown JSON citations
    breakdown_obj = json.loads(award_data["valuation_breakdown_json"])
    assert breakdown_obj["market_value_component"]["statutory_citation"]["section"] == "Section 26(1)(a)/(b)/(c)"
    assert breakdown_obj["solatium_component"]["statutory_citation"]["section"] == "Section 30(1) read with First Schedule (Item 5)"

    # 4. Stage 10: District Collector pronounces formal Section 23/30 Statutory Award
    pronounce_payload = {
        "award_order_no": award_data["award_order_no"],
        "declaration_notes": "Statutory Award signed in public enquiry under Section 23 & 30 of RFCTLARR 2013.",
    }
    res_pron = client.post(
        f"/api/v1/adjudication/awards/{award_id}/pronounce",
        json=pronounce_payload,
        headers=headers_collector,
    )
    assert res_pron.status_code == 200, res_pron.text
    pronounced = res_pron.json()
    assert pronounced["is_pronounced"] is True
    assert pronounced["disbursal_status"] == "AWAITING_PFMS_DISBURSAL"
    assert pronounced["award_declared_at"] is not None
