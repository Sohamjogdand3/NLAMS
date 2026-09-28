import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.db.seed import seed_database
from app.core.security import create_access_token
from app.models.user import User
from app.models.jurisdiction import Jurisdiction, JurisdictionType
from app.models.project_proposal import ProjectProposal, WorkflowStage
from app.models.proposal_geography import ProposalGeographyMapping
from app.core.workflow_engine import WorkflowEngine
from app.services.proposal_service import ProposalService
from app.services.national_simulation_service import NationalSimulationService


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


def get_token_for_user(email: str, db: Session) -> str:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ValueError(f"User {email} not found")
    return create_access_token({"sub": str(user.id), "email": user.email})


# ==============================================================================
# WORKFLOW ENGINE & RELATIONAL GEOGRAPHY TESTS
# ==============================================================================

def test_relational_geography_mapping(client: TestClient, db: Session):
    """
    Validates that creating a proposal populates normalized relational
    ProposalGeographyMapping rows linking Proposal -> State -> District -> Taluka -> Villages.
    """
    token = get_token_for_user("officer.nhai@nlams.gov.demo", db)
    headers = {"Authorization": f"Bearer {token}"}

    pune_dist = db.query(Jurisdiction).filter(Jurisdiction.name == "Pune", Jurisdiction.type == JurisdictionType.DISTRICT).first()
    assert pune_dist is not None

    payload = {
        "project_title": "Samruddhi Expressway Corridor Expansion (Package 8)",
        "requiring_agency": "NHAI",
        "ministry": "Ministry of Road Transport and Highways (MoRTH)",
        "public_purpose": "National Freight Corridor Expansion",
        "estimated_budget_inr": 8000000000.0,
        "required_area_ha": 60.0,
        "target_district_id": pune_dist.id,
    }

    res = client.post("/api/v1/proposals", json=payload, headers=headers)
    assert res.status_code == 201, res.text
    prop_data = res.json()
    proposal_id = prop_data["id"]

    # Verify relational geography mapping rows in DB
    mappings = db.query(ProposalGeographyMapping).filter(ProposalGeographyMapping.proposal_id == proposal_id).all()
    assert len(mappings) >= 1
    
    primary = [m for m in mappings if m.is_primary][0]
    assert primary.state_id is not None
    assert primary.district_id == pune_dist.id


def test_hardened_workflow_state_machine_with_separated_steps_and_pia_acceptance(db: Session):
    """
    Validates end-to-end statutory progression:
    - Requisition (Stage 1) -> State Scrutiny (Stage 2) -> CALA Appointed (Stage 3) ->
      Expert Committee Gate (Stage 5) -> Sec 11 (Stage 6) -> Sec 15 (Stage 7) ->
      Sec 19 (Stage 8) -> Valuation Computed (Stage 9 - Separated!) ->
      Award Pronounced (Stage 10 - Separated!) -> Compensation Disbursed (Stage 11) ->
      Possession & Mutation (Stage 12) -> PIA Handover Accepted (Stage 13 - Required!) ->
      Completed (Stage 14).
    """
    nhai_user = db.query(User).filter(User.email == "officer.nhai@nlams.gov.demo").first()
    state_user = db.query(User).filter(User.email == "state.maharashtra@nlams.gov.demo").first()
    collector_user = db.query(User).filter(User.email == "collector.pune@nlams.gov.demo").first()
    citizen_user = db.query(User).filter(User.email == "citizen@example.com").first()

    assert nhai_user and state_user and collector_user and citizen_user

    # 1. Create Proposal (Stage 1)
    proposal = ProposalService.create_proposal(
        db=db,
        user=nhai_user,
        project_title="Western Dedicated Freight Corridor (Pune Spur)",
        requiring_agency="NHAI",
        ministry="Ministry of Railways",
        public_purpose="Dedicated Freight Rail Line",
        estimated_budget_inr=12000000000.0,
        required_area_ha=85.0,
    )
    assert proposal.current_stage == WorkflowStage.STAGE_1_REQUISITION

    # Security check: Citizen or Collector cannot submit proposal to state (Only PIA)
    with pytest.raises(ValueError, match="Access Denied"):
        WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_2_STATE_SCRUTINY, citizen_user)

    # 2. Submit to State Scrutiny (Stage 2)
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_2_STATE_SCRUTINY, nhai_user)
    assert proposal.current_stage == WorkflowStage.STAGE_2_STATE_SCRUTINY

    # 3. State Appoints CALA (Stage 3)
    proposal = WorkflowEngine.execute_transition(
        db, proposal, WorkflowStage.STAGE_3_CALA_APPOINTED, state_user, action_metadata={"order_no": "CALA-ORD-001"}
    )
    assert proposal.current_stage == WorkflowStage.STAGE_3_CALA_APPOINTED

    # 4. Expert Committee Gate (Stage 5)
    proposal = WorkflowEngine.execute_transition(
        db, proposal, WorkflowStage.STAGE_5_EXPERT_COMMITTEE_GATE, state_user
    )
    assert proposal.current_stage == WorkflowStage.STAGE_5_EXPERT_COMMITTEE_GATE

    # 5. Publish Sec 11 Notification (Stage 6)
    proposal = WorkflowEngine.execute_transition(
        db, proposal, WorkflowStage.STAGE_6_SEC11_PRELIMINARY_NOTIF, collector_user
    )
    assert proposal.current_stage == WorkflowStage.STAGE_6_SEC11_PRELIMINARY_NOTIF
    assert proposal.sec11_published_at is not None

    # 6. Objection Hearings (Stage 7)
    proposal = WorkflowEngine.execute_transition(
        db, proposal, WorkflowStage.STAGE_7_SEC15_OBJECTIONS, collector_user
    )
    assert proposal.current_stage == WorkflowStage.STAGE_7_SEC15_OBJECTIONS

    # 7. Sec 19 Final Declaration (Stage 8)
    proposal = WorkflowEngine.execute_transition(
        db, proposal, WorkflowStage.STAGE_8_SEC19_FINAL_DECLARATION, collector_user
    )
    assert proposal.current_stage == WorkflowStage.STAGE_8_SEC19_FINAL_DECLARATION
    assert proposal.sec19_published_at is not None

    # 8. Separate Step 9: Compute Valuation
    proposal = ProposalService.compute_valuation(
        db=db,
        proposal_id=proposal.id,
        user=collector_user,
        valuation_total_inr=11500000000.0,
    )
    assert proposal.current_stage == WorkflowStage.STAGE_9_VALUATION_COMPUTED
    assert proposal.valuation_total_inr == 11500000000.0
    assert proposal.valuation_computed_at is not None

    # 9. Separate Step 10: Pronounce Statutory Award
    proposal = ProposalService.pronounce_award(
        db=db,
        proposal_id=proposal.id,
        collector_user=collector_user,
        award_order_no="AWARD-RFCTLARR-2026-PUN-0044",
    )
    assert proposal.current_stage == WorkflowStage.STAGE_10_AWARD_PRONOUNCED
    assert proposal.award_order_no == "AWARD-RFCTLARR-2026-PUN-0044"
    assert proposal.award_declaration_date is not None

    # 10. Disburse Compensation (Stage 11)
    proposal = WorkflowEngine.execute_transition(
        db, proposal, WorkflowStage.STAGE_11_COMPENSATION_DISBURSED, collector_user, action_metadata={"total_disbursed_inr": 11500000000.0}
    )
    assert proposal.current_stage == WorkflowStage.STAGE_11_COMPENSATION_DISBURSED

    # 11. Possession Handover & Digital Mutation (Stage 12)
    proposal = ProposalService.execute_possession_and_mutation(
        db=db,
        proposal_id=proposal.id,
        user=collector_user,
        possession_certificate_no="POSS-CERT-MHA-2026-091",
    )
    assert proposal.current_stage == WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION
    assert proposal.possession_certificate_no == "POSS-CERT-MHA-2026-091"

    # Security check: Project cannot jump directly from Possession to Completed without PIA Acceptance!
    with pytest.raises(ValueError, match="Invalid statutory transition"):
        WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_14_COMPLETED, collector_user)

    # 12. Required Step 13: PIA Handover Acceptance
    proposal = ProposalService.accept_pia_handover(
        db=db,
        proposal_id=proposal.id,
        pia_user=nhai_user,
        acceptance_notes="Physical corridor inspected; boundary stones verified and mutation in revenue ledger acknowledged.",
    )
    assert proposal.current_stage == WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED
    assert proposal.pia_accepted_at is not None

    # 13. Final Stage 14: Completed
    proposal = WorkflowEngine.execute_transition(
        db, proposal, WorkflowStage.STAGE_14_COMPLETED, nhai_user
    )
    assert proposal.current_stage == WorkflowStage.STAGE_14_COMPLETED
    assert proposal.status == "COMPLETED"


def test_national_simulation_dataset_hierarchy(db: Session):
    """
    Validates the National Simulation Dataset architecture:
    India -> States -> Districts -> Talukas -> Villages -> Synthetic Parcels.
    """
    states = NationalSimulationService.get_states(db)
    state_names = [s.name for s in states]
    assert "Maharashtra" in state_names
    assert "Gujarat" in state_names
    assert "Uttar Pradesh" in state_names
    assert "Karnataka" in state_names

    # Test query cascade
    gujarat = [s for s in states if s.name == "Gujarat"][0]
    districts = NationalSimulationService.get_districts(db, state_id=gujarat.id)
    dist_names = [d.name for d in districts]
    assert "Ahmedabad" in dist_names or "Surat" in dist_names

    ahmedabad = [d for d in districts if d.name == "Ahmedabad"][0]
    talukas = NationalSimulationService.get_talukas(db, district_id=ahmedabad.id)
    taluka_names = [t.name for t in talukas]
    assert "Sanand" in taluka_names or "Dholera" in taluka_names

    # Test synthetic parcel generator
    parcels = NationalSimulationService.generate_synthetic_parcels(
        village_name="Dholera SIR Phase 1",
        taluka_name="Dholera",
        district_name="Ahmedabad",
        count=5,
    )
    assert len(parcels) == 5
    first = parcels[0]
    assert first["village_name"] == "Dholera SIR Phase 1"
    assert first["district_name"] == "Ahmedabad"
    assert "UID-VAULT" in first["aadhaar_vault_ref"]
    assert first["total_area_ha"] > 0
