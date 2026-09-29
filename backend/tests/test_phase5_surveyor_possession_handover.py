import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.db.seed import seed_database
from app.core.security import create_access_token
from app.models.user import User
from app.models.project_proposal import ProjectProposal, WorkflowStage
from app.models.land_parcel import LandParcel
from app.models.escrow_account import EscrowAccount
from app.models.statutory_award import StatutoryAward
from app.models.payment_disbursal import LandCompensationDisbursal
from app.models.field_survey import FieldParcelSurvey
from app.models.possession import (
    DigitalPanchnama,
    PossessionCertificate,
    DigitalMutationRecord,
    PiaHandoverCertificate,
    ProjectCompletionArchival,
)

client = TestClient(app)


def get_token(email: str) -> str:
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    db.close()
    if not user:
        raise ValueError(f"User {email} not found")
    return create_access_token({"sub": str(user.id), "email": user.email})


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    seed_database()
    yield


@pytest.fixture
def setup_phase5_proposal():
    db = SessionLocal()
    proposal = db.query(ProjectProposal).filter(ProjectProposal.proposal_code == "PROP-P5-EXPRESS-2026").first()
    if not proposal:
        proposal = ProjectProposal(
            proposal_code="PROP-P5-EXPRESS-2026",
            project_title="Phase 5 Samruddhi Expressway Spur Line",
            requiring_agency="NHAI",
            ministry="Ministry of Road Transport and Highways",
            public_purpose="Expressway Connectivity & Logistics Park",
            description="Phase 5 corridor testing mobile surveys, possession, simulated mutation, PIA handover, and archival",
            status="APPROVED",
            current_stage=WorkflowStage.STAGE_11_COMPENSATION_DISBURSED,
            created_by_user_id=1,
            estimated_budget_inr=80000000.0,
            required_area_ha=15.0,
        )
        db.add(proposal)
        db.commit()
        db.refresh(proposal)
    else:
        db.query(ProjectCompletionArchival).filter(ProjectCompletionArchival.proposal_id == proposal.id).delete()
        db.query(PiaHandoverCertificate).filter(PiaHandoverCertificate.proposal_id == proposal.id).delete()
        db.query(PossessionCertificate).filter(PossessionCertificate.proposal_id == proposal.id).delete()
        db.query(DigitalPanchnama).filter(DigitalPanchnama.proposal_id == proposal.id).delete()
        db.query(DigitalMutationRecord).filter(DigitalMutationRecord.proposal_id == proposal.id).delete()
        proposal.current_stage = WorkflowStage.STAGE_11_COMPENSATION_DISBURSED
        db.commit()

    # Create test parcels
    parcel1 = db.query(LandParcel).filter(LandParcel.proposal_id == proposal.id, LandParcel.survey_number == "101/1").first()
    if not parcel1:
        parcel1 = LandParcel(
            proposal_id=proposal.id,
            survey_number="101/1",
            gut_number="GUT-101",
            village_name="Wagholi",
            taluka_name="Haveli",
            district_name="Pune",
            land_category="DRY_CROP",
            total_area_ha=2.5,
            affected_area_ha=2.0,
            owner_name="Santosh Tukaram Shinde",
            is_frozen=True,
        )
        db.add(parcel1)

    parcel2 = db.query(LandParcel).filter(LandParcel.proposal_id == proposal.id, LandParcel.survey_number == "101/2").first()
    if not parcel2:
        parcel2 = LandParcel(
            proposal_id=proposal.id,
            survey_number="101/2",
            gut_number="GUT-101",
            village_name="Wagholi",
            taluka_name="Haveli",
            district_name="Pune",
            land_category="BAGAYAT_IRRIGATED",
            total_area_ha=3.0,
            affected_area_ha=2.8,
            owner_name="Dnyaneshwar Mahadu Gaikwad",
            is_frozen=True,
        )
        db.add(parcel2)
    db.commit()

    # Ensure funded escrow
    escrow = db.query(EscrowAccount).filter(EscrowAccount.proposal_id == proposal.id).first()
    if not escrow:
        escrow = EscrowAccount(
            proposal_id=proposal.id,
            account_number="ESCROW-P5-EXP-8899",
            bank_name="State Bank of India",
            ifsc_code="SBIN0000454",
            total_sanctioned_amount=80000000.0,
            deposited_amount=80000000.0,
            balance_amount=80000000.0,
            disbursed_amount=0.0,
            status="ACTIVE",
        )
        db.add(escrow)
        db.commit()

    # Ensure statutory award & land compensation disbursal
    award = db.query(StatutoryAward).filter(StatutoryAward.proposal_id == proposal.id).first()
    if not award:
        award = StatutoryAward(
            proposal_id=proposal.id,
            parcel_id=parcel1.id,
            award_order_no="AWARD-P5-2026-001",
            survey_number="101/1",
            village_name="Wagholi",
            primary_khatedar_name="Santosh Tukaram Shinde",
            affected_area_ha=2.0,
            valuation_breakdown_json='{"market_rate": 5000000.0, "multiplier": 1.0, "solatium": 10000000.0}',
            base_market_value_inr=10000000.0,
            multiplied_land_value_inr=10000000.0,
            solatium_100_pct_inr=10000000.0,
            structural_assets_inr=2000000.0,
            total_statutory_award_inr=22500000.0,
            is_pronounced=True,
            award_declared_at=datetime.utcnow(),
            pronounced_by_collector_id=1,
            disbursal_status="SETTLED_PFMS_DISBURSED",
        )
        db.add(award)
        db.commit()
        db.refresh(award)

    disbursal = db.query(LandCompensationDisbursal).filter(LandCompensationDisbursal.proposal_id == proposal.id).first()
    if not disbursal:
        disbursal = LandCompensationDisbursal(
            proposal_id=proposal.id,
            award_id=award.id,
            escrow_account_id=escrow.id,
            disbursal_batch_ref="BATCH-P5-DISB-001",
            beneficiary_name="Santosh Tukaram Shinde",
            survey_number="101/1",
            bank_account_no="9988223311",
            bank_ifsc_code="SBIN0000454",
            bank_name="State Bank of India",
            amount_inr=22500000.0,
            pfms_transaction_ref="PFMS-P5-TXN-001",
            payment_status="PROCESSED_SIMULATED",
            authorized_by_user_id=1,
        )
        db.add(disbursal)
        db.commit()

    db.close()
    return proposal.id


# -----------------------------------------------------------------------------
# 1. Field Surveyor Mobile Toolkit Tests
# -----------------------------------------------------------------------------

def test_surveyor_tasks_and_boundary_walk_submission(setup_phase5_proposal):
    proposal_id = setup_phase5_proposal
    token = get_token("surveyor.pune@nlams.gov.demo")

    # 1. List survey tasks
    res = client.get(
        f"/api/v1/surveyor/tasks?proposal_id={proposal_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    tasks = res.json()
    assert len(tasks) >= 2
    task1 = tasks[0]
    task_id = task1["id"]

    # 2. Submit GPS Boundary Walk
    walk_payload = {
        "task_id": task_id,
        "gps_coordinates": [
            {"latitude": 18.5791, "longitude": 73.9841, "accuracy_meters": 2.1},
            {"latitude": 18.5795, "longitude": 73.9845, "accuracy_meters": 2.2},
            {"latitude": 18.5799, "longitude": 73.9841, "accuracy_meters": 2.0},
            {"latitude": 18.5791, "longitude": 73.9841, "accuracy_meters": 2.1},
        ],
        "measured_area_ha": 2.02,
        "gps_perimeter_meters": 580.4,
        "gps_accuracy_meters": 2.1,
        "land_use_type": "Agricultural",
        "occupant_name_on_site": "Santosh Tukaram Shinde",
        "occupant_type": "Self-Cultivating Owner",
        "road_access": "Direct Paved Village Road",
        "is_disputed_boundary": False,
        "surveyor_remarks": "On-ground boundary pillars verified with landowner present.",
    }
    walk_res = client.post(
        "/api/v1/surveyor/boundary-walk",
        json=walk_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert walk_res.status_code == 200
    data = walk_res.json()
    assert data["survey_status"] == "BOUNDARY_WALKED"
    assert data["measured_area_ha"] == 2.02
    assert data["variance_percentage"] is not None


def test_geotagged_asset_evidence_submission(setup_phase5_proposal):
    proposal_id = setup_phase5_proposal
    token = get_token("surveyor.pune@nlams.gov.demo")

    tasks_res = client.get(
        f"/api/v1/surveyor/tasks?proposal_id={proposal_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    task_id = tasks_res.json()[0]["id"]

    evidence_payload = {
        "survey_id": task_id,
        "category": "STRUCTURE",
        "caption": "Pucca farm house on boundary of survey 101/1",
        "latitude": 18.5793,
        "longitude": 73.9844,
        "accuracy_meters": 2.4,
        "file_url": "/storage/photos/farm_house_pune_101.jpg",
    }
    ev_res = client.post(
        "/api/v1/surveyor/evidence",
        json=evidence_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ev_res.status_code == 200
    ev_data = ev_res.json()
    assert ev_data["category"] == "STRUCTURE"
    assert ev_data["latitude"] == 18.5793


def test_offline_batch_synchronization(setup_phase5_proposal):
    proposal_id = setup_phase5_proposal
    token = get_token("surveyor.pune@nlams.gov.demo")

    tasks_res = client.get(
        f"/api/v1/surveyor/tasks?proposal_id={proposal_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    parcel2_id = tasks_res.json()[1]["parcel_id"]

    batch_payload = {
        "sync_batch_id": "SYNC-BATCH-OFFLINE-9921",
        "survey_items": [
            {
                "offline_client_uuid": "CLIENT-UUID-OFFLINE-002",
                "parcel_id": parcel2_id,
                "proposal_id": proposal_id,
                "measured_area_ha": 2.78,
                "gps_coordinates": [
                    {"latitude": 18.5810, "longitude": 73.9860, "accuracy_meters": 2.3},
                    {"latitude": 18.5815, "longitude": 73.9865, "accuracy_meters": 2.1},
                    {"latitude": 18.5810, "longitude": 73.9870, "accuracy_meters": 2.5},
                ],
                "crops": [
                    {
                        "cropName": "Sugarcane Co-86032",
                        "cultivatedAreaHa": 2.0,
                        "season": "Perennial",
                        "irrigationType": "Canal",
                    }
                ],
                "trees": [
                    {
                        "species": "Alphonso Mango",
                        "category": "Fruit-Bearing",
                        "quantity": 18,
                        "condition": "Good",
                        "isProductive": True,
                    }
                ],
                "structures": [
                    {
                        "type": "Cattle Shed",
                        "constructionType": "Semi-Pucca",
                        "plinthAreaSqM": 45.0,
                        "floors": 1,
                        "condition": "Good",
                    }
                ],
                "water_assets": [
                    {
                        "type": "Borewell",
                        "depthMeters": 140.0,
                        "operationalStatus": "Operational",
                    }
                ],
                "owner_signature_captured": True,
                "surveyor_remarks": "All crops, trees, and borewell cataloged offline.",
                "photos": [
                    {
                        "survey_id": tasks_res.json()[1]["id"],
                        "category": "CROP_TREES",
                        "caption": "Sugarcane plantation and borewell pump house",
                        "latitude": 18.5812,
                        "longitude": 73.9862,
                        "accuracy_meters": 2.3,
                        "file_url": "/storage/photos/sugarcane_101_2.jpg",
                    }
                ],
            }
        ],
    }

    sync_res = client.post(
        "/api/v1/surveyor/batch-sync",
        json=batch_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert sync_res.status_code == 200
    assert sync_res.json()["surveys_synced_count"] == 1
    assert sync_res.json()["photos_synced_count"] == 1


def test_survey_revenue_verification_and_summary(setup_phase5_proposal):
    proposal_id = setup_phase5_proposal
    talathi_token = get_token("talathi.haveli.pune@nlams.gov.demo")

    tasks_res = client.get(
        f"/api/v1/surveyor/tasks?proposal_id={proposal_id}",
        headers={"Authorization": f"Bearer {talathi_token}"},
    )
    task1_id = tasks_res.json()[0]["id"]

    # 1. Talathi verifies survey
    ver_res = client.post(
        "/api/v1/surveyor/verify",
        json={
            "survey_id": task1_id,
            "decision": "APPROVE",
            "verification_remarks": "7/12 extract and GPS boundaries match without dispute.",
        },
        headers={"Authorization": f"Bearer {talathi_token}"},
    )
    assert ver_res.status_code == 200
    assert ver_res.json()["survey_status"] == "VERIFIED_BY_TALATHI"

    # 2. Get proposal survey summary
    summary_res = client.get(
        f"/api/v1/surveyor/proposals/{proposal_id}/summary",
        headers={"Authorization": f"Bearer {talathi_token}"},
    )
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_parcels"] >= 2
    assert summary["surveys_completed_count"] >= 1


# -----------------------------------------------------------------------------
# 2. Possession & Panchnama Tests (Stage 11 -> Stage 12)
# -----------------------------------------------------------------------------

def test_possession_readiness_and_certificate_issuance(setup_phase5_proposal):
    proposal_id = setup_phase5_proposal
    collector_token = get_token("collector.pune@nlams.gov.demo")
    tehsildar_token = get_token("tehsildar.haveli.pune@nlams.gov.demo")

    # 1. Check readiness
    readiness_res = client.get(
        f"/api/v1/possession/proposals/{proposal_id}/readiness",
        headers={"Authorization": f"Bearer {collector_token}"},
    )
    assert readiness_res.status_code == 200
    assert readiness_res.json()["ready_for_possession"] is True

    # 2. Record Digital Panchnama
    panchnama_payload = {
        "proposal_id": proposal_id,
        "site_location_description": "Village Wagholi, Survey 101/1 and 101/2 along proposed Expressway bypass.",
        "circle_officer_name": "Shri P. K. Deshmukh",
        "talathi_name": "Smt. S. M. Kulkarni",
        "tehsildar_name": "Shri V. R. Joshi",
        "witnesses": [
            {
                "name": "Ramdas Patil",
                "address": "Wagholi Village, Haveli",
                "aadhaar_masked": "XXXX-XXXX-1122",
                "sign_confirmed": True,
            },
            {"name": "Anil Jadhav", "address": "Wagholi Village, Haveli", "aadhaar_masked": "XXXX-XXXX-3344", "sign_confirmed": True},
        ],
        "physical_encumbrances_cleared": True,
        "boundary_pillars_fixed": True,
        "standing_crops_harvested_or_compensated": True,
    }
    panch_res = client.post(
        "/api/v1/possession/panchnama",
        json=panchnama_payload,
        headers={"Authorization": f"Bearer {tehsildar_token}"},
    )
    assert panch_res.status_code == 200
    panch_id = panch_res.json()["id"]

    # 3. Issue Section 38/40 Possession Certificate -> Stage 12
    cert_payload = {
        "proposal_id": proposal_id,
        "panchnama_id": panch_id,
        "issuing_authority_title": "District Collector & CALA Pune",
        "certificate_doc_url": "/storage/certificates/possession_cert_sec38_pune.pdf",
    }
    cert_res = client.post(
        "/api/v1/possession/issue-certificate",
        json=cert_payload,
        headers={"Authorization": f"Bearer {collector_token}"},
    )
    assert cert_res.status_code == 200
    cert_data = cert_res.json()
    assert cert_data["status"] == "ISSUED_VESTED_IN_STATE"
    assert cert_data["certificate_number"].startswith("POSS-CERT-")

    # Verify Proposal advanced to STAGE_12_POSSESSION_AND_MUTATION
    db = SessionLocal()
    prop = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
    assert prop.current_stage == WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION
    db.close()


# -----------------------------------------------------------------------------
# 3. Digital Mutation Tests (Simulated 7/12 RoR Transfer & Lock Resolution)
# -----------------------------------------------------------------------------

def test_simulated_digital_mutation_and_lock_resolution(setup_phase5_proposal):
    proposal_id = setup_phase5_proposal
    collector_token = get_token("collector.pune@nlams.gov.demo")

    # Execute digital mutation
    mut_payload = {
        "proposal_id": proposal_id,
        "new_owner_name": "National Highways Authority of India (NHAI) / Govt of Maharashtra",
    }
    mut_res = client.post(
        "/api/v1/possession/execute-digital-mutation",
        json=mut_payload,
        headers={"Authorization": f"Bearer {collector_token}"},
    )
    assert mut_res.status_code == 200
    mutations = mut_res.json()
    assert len(mutations) >= 2
    for m in mutations:
        assert m["is_simulated"] is True
        assert "SIMULATED" in m["data_source"]
        assert m["e_ferfar_status"] == "VESTED_FREE_FROM_ENCUMBRANCES"
        assert m["previous_section11_restriction_status"] == "RESOLVED_AND_LIFTED"
        assert m["new_restriction_status"] == "VESTED_IN_REQUIRING_AGENCY_PERMANENT"
        assert "NHAI" in m["new_owner_name"]


# -----------------------------------------------------------------------------
# 4. PIA Handover Acceptance Gate Tests (Stage 12 -> Stage 13)
# -----------------------------------------------------------------------------

def test_pia_handover_rejection_and_acceptance(setup_phase5_proposal):
    proposal_id = setup_phase5_proposal
    pia_token = get_token("officer.nhai@nlams.gov.demo")
    collector_token = get_token("collector.pune@nlams.gov.demo")

    # Ensure possession certificate exists and proposal is at Stage 12
    db = SessionLocal()
    prop = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
    prop.current_stage = WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION
    possession_cert = db.query(PossessionCertificate).filter(PossessionCertificate.proposal_id == proposal_id).first()
    if not possession_cert:
        possession_cert = PossessionCertificate(
            proposal_id=proposal_id,
            certificate_number=f"POSS-CERT-{prop.proposal_code}-TEST",
            issuing_authority_title="District Collector & CALA Pune",
            issued_by_user_id=1,
            issued_to_requiring_agency=prop.requiring_agency,
            total_area_acquired_ha=4.8,
            certificate_doc_url="/storage/cert.pdf",
            status="ISSUED_VESTED_IN_STATE",
        )
        db.add(possession_cert)
    db.commit()
    db.close()

    # 1. PIA raises defect note (keeps Stage 12)
    defect_payload = {
        "proposal_id": proposal_id,
        "decision": "REJECT_DEFECT",
        "pia_representative_name": "Er. Rajesh Sharma",
        "pia_representative_designation": "Project Director NHAI PIU Pune",
        "dispute_reasons": "Boundary pillar at Chainage 14+200 needs physical re-alignment.",
    }
    defect_res = client.post(
        "/api/v1/possession/pia-handover-action",
        json=defect_payload,
        headers={"Authorization": f"Bearer {pia_token}"},
    )
    assert defect_res.status_code == 200
    assert defect_res.json()["verification_status"] == "REJECTED_DEFECT_NOTICED"

    db = SessionLocal()
    prop = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
    assert prop.current_stage == WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION
    db.close()

    # 2. PIA formally accepts handover -> advances to STAGE_13_PIA_HANDOVER_ACCEPTED
    accept_payload = {
        "proposal_id": proposal_id,
        "decision": "ACCEPT",
        "pia_representative_name": "Er. Rajesh Sharma",
        "pia_representative_designation": "Project Director NHAI PIU Pune",
        "corridor_length_km": 15.4,
        "acceptance_notes": "Corridor inspected on-site. All physical encumbrances cleared and boundary markers verified.",
    }
    accept_res = client.post(
        "/api/v1/possession/pia-handover-action",
        json=accept_payload,
        headers={"Authorization": f"Bearer {pia_token}"},
    )
    assert accept_res.status_code == 200
    assert accept_res.json()["verification_status"] == "ACCEPTED"

    db = SessionLocal()
    prop = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
    assert prop.current_stage == WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED
    db.close()


# -----------------------------------------------------------------------------
# 5. Project Completion & Archival Tests (Stage 13 -> Stage 14)
# -----------------------------------------------------------------------------

def test_escrow_reconciliation_and_stage14_archival_completion(setup_phase5_proposal):
    proposal_id = setup_phase5_proposal
    collector_token = get_token("collector.pune@nlams.gov.demo")

    # Ensure proposal is at Stage 13
    db = SessionLocal()
    prop = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
    prop.current_stage = WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED
    db.commit()
    db.close()

    completion_payload = {
        "proposal_id": proposal_id,
        "administrative_charges_inr": 250000.0,
    }
    comp_res = client.post(
        "/api/v1/possession/complete-project",
        json=completion_payload,
        headers={"Authorization": f"Bearer {collector_token}"},
    )
    assert comp_res.status_code == 200
    archival = comp_res.json()
    assert archival["archival_dossier_no"].startswith("ARCHIVAL-")
    assert archival["reconciliation_status"] == "RECONCILED_AND_SETTLED"
    assert archival["final_audit_hash"] is not None

    # Verify Proposal reached final STAGE_14_COMPLETED
    db = SessionLocal()
    prop = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
    assert prop.current_stage == WorkflowStage.STAGE_14_COMPLETED
    assert prop.status == "COMPLETED"
    db.close()

    # Retrieve archival dossier endpoint
    dossier_res = client.get(
        f"/api/v1/possession/proposals/{proposal_id}/archival-dossier",
        headers={"Authorization": f"Bearer {collector_token}"},
    )
    assert dossier_res.status_code == 200
    assert dossier_res.json()["archival_dossier_no"] == archival["archival_dossier_no"]


# -----------------------------------------------------------------------------
# 6. RBAC & Unauthorized Role Restrictions
# -----------------------------------------------------------------------------

def test_phase5_rbac_and_unauthorized_restrictions(setup_phase5_proposal):
    proposal_id = setup_phase5_proposal
    citizen_token = get_token("citizen@example.com")

    # 1. Citizen cannot submit boundary walks
    res1 = client.post(
        "/api/v1/surveyor/boundary-walk",
        json={
            "task_id": 1,
            "gps_coordinates": [
                {"latitude": 18.5, "longitude": 73.9},
                {"latitude": 18.6, "longitude": 73.9},
                {"latitude": 18.5, "longitude": 74.0},
            ],
            "measured_area_ha": 2.0,
        },
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert res1.status_code == 403

    # 2. Citizen cannot issue possession certificate
    res2 = client.post(
        "/api/v1/possession/issue-certificate",
        json={"proposal_id": proposal_id},
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert res2.status_code == 403

    # 3. Citizen cannot perform PIA handover action
    res3 = client.post(
        "/api/v1/possession/pia-handover-action",
        json={"proposal_id": proposal_id, "decision": "ACCEPT", "pia_representative_name": "Test"},
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert res3.status_code == 403
