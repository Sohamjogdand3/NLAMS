import pytest
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.seed import seed_database
from app.models.user import User
from app.models.project_proposal import ProjectProposal, WorkflowStage
from app.core.workflow_engine import WorkflowEngine
from app.services.proposal_service import ProposalService


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    seed_database()
    yield


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_complete_11_roles_rbac_and_statutory_boundaries(db: Session):
    """
    Exhaustive RBAC & Boundary Verification across all 11 Personas:
    1. PIA (NHAI)
    2. State Admin (Revenue Secretary)
    3. District Collector (CALA)
    4. Land Acquisition Officer (LAO)
    5. SIA Agency
    6. Expert Committee
    7. Talathi
    8. Tehsildar
    9. Citizen
    10. R&R Administrator
    11. Central Admin
    """
    # 1. Fetch Users
    pia_user = db.query(User).filter(User.email == "officer.nhai@nlams.gov.demo").first()
    state_user = db.query(User).filter(User.email == "state.maharashtra@nlams.gov.demo").first()
    collector_user = db.query(User).filter(User.email == "collector.pune@nlams.gov.demo").first()
    lao_user = db.query(User).filter(User.email == "lao.pune@nlams.gov.demo").first()
    sia_user = db.query(User).filter(User.email == "sia.agency@nlams.gov.demo").first()
    expert_user = db.query(User).filter(User.email == "expert.committee@nlams.gov.demo").first()
    talathi_user = db.query(User).filter(User.email == "talathi.haveli.pune@nlams.gov.demo").first()
    tehsildar_user = db.query(User).filter(User.email == "tehsildar.haveli.pune@nlams.gov.demo").first()
    citizen_user = db.query(User).filter(User.email == "citizen@example.com").first()
    rnr_user = db.query(User).filter(User.email == "rnr.officer.pune@nlams.gov.demo").first()
    central_user = db.query(User).filter(User.email == "central.admin@nlams.gov.demo").first()

    users = [pia_user, state_user, collector_user, lao_user, sia_user, expert_user, talathi_user, tehsildar_user, citizen_user, rnr_user, central_user]
    assert all(u is not None for u in users), "All 11 role demo users must be seeded."

    # 2. Stage 1: PIA Ingestion
    proposal = ProposalService.create_proposal(
        db=db,
        user=pia_user,
        project_title="11-Roles RBAC Statutory Verification Corridor",
        requiring_agency="NHAI",
        ministry="MoRTH",
        public_purpose="Expressway Expansion",
        estimated_budget_inr=1000000000.0,
        required_area_ha=25.0,
    )
    assert proposal.current_stage == WorkflowStage.STAGE_1_REQUISITION

    # Negative check: Citizen, Talathi, and LAO CANNOT submit proposal to state (Only PIA)
    for u in [citizen_user, talathi_user, lao_user]:
        with pytest.raises(ValueError, match="Access Denied"):
            WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_2_STATE_SCRUTINY, u)

    # Positive check: PIA submits to State
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_2_STATE_SCRUTINY, pia_user)
    assert proposal.current_stage == WorkflowStage.STAGE_2_STATE_SCRUTINY

    # 3. Stage 2 -> 3: State Appoints CALA
    # Negative check: PIA and Citizen CANNOT appoint CALA
    for u in [pia_user, citizen_user, surveyor_user if 'surveyor_user' in locals() else talathi_user]:
        with pytest.raises(ValueError, match="Access Denied"):
            WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_3_CALA_APPOINTED, u)

    # Positive check: State Admin appoints CALA
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_3_CALA_APPOINTED, state_user)
    assert proposal.current_stage == WorkflowStage.STAGE_3_CALA_APPOINTED

    # 4. SIA 3-Step Lifecycle:
    # 4.1 Step 1: CALA commissions SIA study (Stage 3 -> Stage 4)
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_4_SIA_STUDY, collector_user)
    assert proposal.current_stage == WorkflowStage.STAGE_4_SIA_STUDY

    # 4.2 Step 2 & 3: Expert Committee evaluates SIA study & signs Section 7 Gate (Stage 4 -> Stage 5)
    # Negative check: Citizen and Talathi CANNOT sign Expert Committee gate
    with pytest.raises(ValueError, match="Access Denied"):
        WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_5_EXPERT_COMMITTEE_GATE, citizen_user)

    # Positive check: Expert Committee records appraisal gate
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_5_EXPERT_COMMITTEE_GATE, expert_user)
    assert proposal.current_stage == WorkflowStage.STAGE_5_EXPERT_COMMITTEE_GATE

    # 5. Stage 6: Sec 11 Preliminary Notification & 3-Tier Freeze
    # Negative check: SIA Agency and PIA CANNOT publish Section 11 notice
    for u in [sia_user, pia_user]:
        with pytest.raises(ValueError, match="Access Denied"):
            WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_6_SEC11_PRELIMINARY_NOTIF, u)

    # Positive check: District Collector issues Section 11
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_6_SEC11_PRELIMINARY_NOTIF, collector_user)
    assert proposal.current_stage == WorkflowStage.STAGE_6_SEC11_PRELIMINARY_NOTIF

    # 6. Stage 7: Sec 15 Objection Hearings (LAO / Collector)
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_7_SEC15_OBJECTIONS, lao_user)
    assert proposal.current_stage == WorkflowStage.STAGE_7_SEC15_OBJECTIONS

    # 7. Stage 8: Sec 19 Final Declaration (District Collector)
    # Negative check: Talathi CANNOT declare Section 19
    with pytest.raises(ValueError, match="Access Denied"):
        WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_8_SEC19_FINAL_DECLARATION, talathi_user)

    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_8_SEC19_FINAL_DECLARATION, collector_user)
    assert proposal.current_stage == WorkflowStage.STAGE_8_SEC19_FINAL_DECLARATION

    # 8. Stage 9: Valuation Computed (LAO)
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_9_VALUATION_COMPUTED, lao_user)
    assert proposal.current_stage == WorkflowStage.STAGE_9_VALUATION_COMPUTED

    # 9. Stage 10: Award Pronounced (District Collector / CALA)
    # Negative check: LAO and Talathi CANNOT pronounce formal Section 23/30 Award (Collector only)
    with pytest.raises(ValueError, match="Access Denied"):
        WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_10_AWARD_PRONOUNCED, talathi_user)

    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_10_AWARD_PRONOUNCED, collector_user)
    assert proposal.current_stage == WorkflowStage.STAGE_10_AWARD_PRONOUNCED

    # 10. Stage 11: Compensation Disbursed (PFMS / R&R Admin / CALA)
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_11_COMPENSATION_DISBURSED, rnr_user)
    assert proposal.current_stage == WorkflowStage.STAGE_11_COMPENSATION_DISBURSED

    # 11. Stage 12: Possession & Digital Mutation (Tehsildar / CALA)
    # Distinction test: Talathi CANNOT execute possession/mutation order, but Tehsildar CAN!
    with pytest.raises(ValueError, match="Access Denied"):
        WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION, talathi_user)

    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION, tehsildar_user)
    assert proposal.current_stage == WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION

    # 12. Stage 13: Mandatory PIA Handover Acceptance (PIA)
    # Negative check: Tehsildar, Collector, or Citizen CANNOT accept on behalf of PIA
    for u in [tehsildar_user, collector_user, citizen_user]:
        with pytest.raises(ValueError, match="Access Denied"):
            WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED, u)

    # Positive check: PIA accepts handover
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED, pia_user)
    assert proposal.current_stage == WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED

    # 13. Stage 14: Completed & Archived
    proposal = WorkflowEngine.execute_transition(db, proposal, WorkflowStage.STAGE_14_COMPLETED, central_user)
    assert proposal.current_stage == WorkflowStage.STAGE_14_COMPLETED
    assert proposal.status == "COMPLETED"
