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
from app.models.rnr_census import AffectedFamilyCensus
from app.models.rnr_entitlement import RnREntitlementPackage
from app.models.community_asset_loss import CommunityAssetLoss
from app.models.payment_disbursal import LandCompensationDisbursal, RnRBenefitDisbursal

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
def setup_phase4_fixtures():
    db = SessionLocal()
    # Find or create a proposal at STAGE_10_AWARD_PRONOUNCED with funded escrow
    proposal = db.query(ProjectProposal).filter(ProjectProposal.proposal_code == "PROP-P4-PUNE-2026").first()
    if not proposal:
        proposal = ProjectProposal(
            proposal_code="PROP-P4-PUNE-2026",
            project_title="Phase 4 Pune Ring Road Welfare Section",
            requiring_agency="NHAI",
            ministry="Ministry of Road Transport and Highways",
            public_purpose="National Highway Widening & Social Welfare",
            description="Phase 4 project testing R&R census, rule engine, CPR, and separate DBT workflows",
            status="APPROVED",
            current_stage=WorkflowStage.STAGE_10_AWARD_PRONOUNCED,
            created_by_user_id=1,
            estimated_budget_inr=50000000.0,
            required_area_ha=12.5,
        )
        db.add(proposal)
        db.commit()
        db.refresh(proposal)
    else:
        proposal.current_stage = WorkflowStage.STAGE_10_AWARD_PRONOUNCED
        db.commit()

    # Ensure escrow account exists
    escrow = db.query(EscrowAccount).filter(EscrowAccount.proposal_id == proposal.id).first()
    if not escrow:
        acc_num = f"ESCROW-P4-{proposal.id:04d}"
        escrow = db.query(EscrowAccount).filter(EscrowAccount.account_number == acc_num).first()
        if not escrow:
            escrow = EscrowAccount(
                proposal_id=proposal.id,
                account_number=acc_num,
                bank_name="State Bank of India (PFMS Dedicated)",
                ifsc_code="SBIN0000454",
                total_sanctioned_amount=50000000.0,
                deposited_amount=20000000.0,
                disbursed_amount=0.0,
                balance_amount=20000000.0,
                status="ACTIVE",
            )
            db.add(escrow)
            db.commit()
        else:
            escrow.proposal_id = proposal.id
            escrow.deposited_amount = 20000000.0
            escrow.disbursed_amount = 0.0
            escrow.balance_amount = 20000000.0
            db.commit()
    else:
        escrow.deposited_amount = 20000000.0
        escrow.disbursed_amount = 0.0
        escrow.balance_amount = 20000000.0
        db.commit()

    # Ensure land parcel exists
    parcel = db.query(LandParcel).filter(LandParcel.proposal_id == proposal.id).first()
    if not parcel:
        parcel = LandParcel(
            proposal_id=proposal.id,
            survey_number="104/1A",
            sub_division="1",
            village_name="Uruli Devachi",
            taluka_name="Haveli",
            district_name="Pune",
            total_area_ha=1.5,
            affected_area_ha=1.5,
            land_category="BAGAYAT_IRRIGATED",
            owner_name="Pandurang Vitthal Shinde",
        )
        db.add(parcel)
        db.commit()
        db.refresh(parcel)

    # Ensure statutory award exists
    award = db.query(StatutoryAward).filter(StatutoryAward.proposal_id == proposal.id).first()
    awd_no = f"AWD-P4-{proposal.id:04d}-{parcel.id:04d}"
    if not award:
        award = db.query(StatutoryAward).filter(StatutoryAward.award_order_no == awd_no).first()
        if not award:
            award = StatutoryAward(
                proposal_id=proposal.id,
                parcel_id=parcel.id,
                award_order_no=awd_no,
                survey_number="104/1A",
                village_name="Uruli Devachi",
                primary_khatedar_name="Pandurang Vitthal Shinde",
                affected_area_ha=1.5,
                valuation_breakdown_json='{"market_value": 3000000.0, "solatium_100_pct": 3000000.0, "total": 6000000.0}',
                base_market_value_inr=3000000.0,
                multiplied_land_value_inr=3000000.0,
                solatium_100_pct_inr=3000000.0,
                additional_market_value_12_pct_inr=0.0,
                structural_assets_inr=0.0,
                total_statutory_award_inr=6000000.0,
                is_pronounced=True,
                disbursal_status="AWAITING_DISBURSAL",
            )
            db.add(award)
            db.commit()
            db.refresh(award)
        else:
            award.proposal_id = proposal.id
            award.parcel_id = parcel.id
            award.is_pronounced = True
            award.disbursal_status = "AWAITING_DISBURSAL"
            db.commit()
    else:
        award.is_pronounced = True
        award.disbursal_status = "AWAITING_DISBURSAL"
        db.commit()

    prop_id = proposal.id
    awd_id = award.id
    db.close()
    return {"proposal_id": prop_id, "award_id": awd_id}


def test_affected_family_census_registration(setup_phase4_fixtures):
    """Test registering a non-owner tenant/agricultural laborer affected family census."""
    fixtures = setup_phase4_fixtures
    prop_id = fixtures["proposal_id"]
    token = get_token("tehsildar.haveli.pune@nlams.gov.demo")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "family_head_name": "Tukaram Genba Gaikwad",
        "village_name": "Uruli Devachi",
        "category": "AGRICULTURAL_LABORER",
        "primary_livelihood_source": "Agricultural farm labor on acquired parcels",
        "caste_category": "SC",
        "is_scheduled_area_displacement": True,
        "is_bpl": True,
        "family_members_count": 5,
        "dependency_years": 8,
        "ration_card_no": "RC-MH-PUN-099881",
        "associated_survey_number": "104/1A",
    }

    response = client.post(f"/api/v1/rnr/proposals/{prop_id}/census", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["family_head_name"] == "Tukaram Genba Gaikwad"
    assert data["caste_category"] == "SC"
    assert data["category"] == "AGRICULTURAL_LABORER"
    assert data["census_family_code"].startswith("CENSUS-FAM-")
    assert data["verification_status"] == "SURVEYED"


def test_versioned_rnr_entitlement_calculation_sc_st_rules(setup_phase4_fixtures):
    """Test versioned Second Schedule evaluation & Section 41/42 rule-based SC/ST calculation."""
    fixtures = setup_phase4_fixtures
    prop_id = fixtures["proposal_id"]
    token = get_token("rnr.officer.pune@nlams.gov.demo")
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch recorded census
    list_res = client.get(f"/api/v1/rnr/proposals/{prop_id}/census", headers=headers)
    assert list_res.status_code == 200
    census_list = list_res.json()
    sc_census = [c for c in census_list if c["caste_category"] == "SC"][0]

    # Evaluate entitlement package
    eval_payload = {
        "family_id": sc_census["id"],
        "is_rural": True,
    }
    response = client.post(f"/api/v1/rnr/proposals/{prop_id}/entitlements/evaluate", json=eval_payload, headers=headers)
    assert response.status_code == 200, response.text
    pkg = response.json()
    assert pkg["rule_config_version"] == "v2.4-MHA-RNR-2026"
    assert pkg["subsistence_allowance_inr"] > 0
    assert pkg["resettlement_grant_inr"] > 0
    assert pkg["livelihood_annuity_inr"] > 0
    assert pkg["sc_st_eligibility_criteria_met"] is True
    assert pkg["sc_st_additional_grant_inr"] == 50000.0  # Section 41(4) additional grant
    assert "ELIGIBLE_PMAY" in pkg["pmay_housing_eligibility_status"]
    assert pkg["total_rnr_entitlement_inr"] > 0

    # Approve entitlement package
    pkg_id = pkg["id"]
    app_res = client.post(
        f"/api/v1/rnr/entitlements/{pkg_id}/approve",
        json={"approval_notes": "Second Schedule Welfare Package Formally Approved with Section 41 SC/ST provisions"},
        headers=headers,
    )
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "APPROVED_BY_RNR_ADMIN"


def test_community_asset_loss_third_schedule(setup_phase4_fixtures):
    """Test recording Third Schedule Common Property Resource (CPR) community asset loss."""
    fixtures = setup_phase4_fixtures
    prop_id = fixtures["proposal_id"]
    token = get_token("tehsildar.haveli.pune@nlams.gov.demo")
    headers = {"Authorization": f"Bearer {token}"}

    cpr_payload = {
        "village_name": "Uruli Devachi",
        "asset_name": "Community Drinking Well No. 3",
        "asset_category": "DRINKING_WATER_WELL",
        "survey_number": "104/1A",
        "affected_extent": "1 deep tube-well and submersible pump set",
        "estimated_restoration_cost_inr": 850000.0,
        "pwd_valuation_ref": "PWD-VAL-PUN-2026-09",
        "statutory_amenity_code": "AMENITY_ITEM_4",
        "reconstruction_site_details": "Gram Panchayat Plot No. 42 (North Gate)",
    }
    response = client.post(f"/api/v1/rnr/proposals/{prop_id}/community-assets", json=cpr_payload, headers=headers)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["asset_name"] == "Community Drinking Well No. 3"
    assert data["estimated_restoration_cost_inr"] == 850000.0
    assert data["reconstruction_status"] == "IDENTIFIED"


def test_separate_land_compensation_disbursal_pfms(setup_phase4_fixtures):
    """Test separate Land Compensation DBT payment workflow (StatutoryAward -> LandCompensationDisbursal)."""
    fixtures = setup_phase4_fixtures
    prop_id = fixtures["proposal_id"]
    awd_id = fixtures["award_id"]
    token = get_token("collector.pune@nlams.gov.demo")
    headers = {"Authorization": f"Bearer {token}"}

    disbursal_payload = {
        "bank_account_no": "987654321012",
        "bank_ifsc_code": "SBIN0000454",
        "bank_name": "State Bank of India",
    }
    response = client.post(f"/api/v1/rnr/proposals/{prop_id}/disburse-award/{awd_id}", json=disbursal_payload, headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["is_simulated"] is True
    assert data["payment_status"] == "PROCESSED_SIMULATED"
    assert data["pfms_transaction_ref"].startswith("SIM-LAND-")
    assert data["amount_inr"] == 6000000.0
    assert "Simulated" in data["disclaimer"]

    # Verify Escrow was debited
    db = SessionLocal()
    escrow = db.query(EscrowAccount).filter(EscrowAccount.proposal_id == prop_id).first()
    assert escrow.disbursed_amount >= 6000000.0
    assert escrow.balance_amount <= 14000000.0

    # Verify Award status was updated
    award = db.query(StatutoryAward).filter(StatutoryAward.id == awd_id).first()
    assert award.disbursal_status == "SETTLED_SIMULATED"

    # Verify Land Compensation Disbursal specifically ADVANCES Proposal to STAGE_11_COMPENSATION_DISBURSED
    proposal = db.query(ProjectProposal).filter(ProjectProposal.id == prop_id).first()
    assert proposal.current_stage == WorkflowStage.STAGE_11_COMPENSATION_DISBURSED
    db.close()


def test_separate_rnr_benefit_disbursal_pfms(setup_phase4_fixtures):
    """Test separate R&R Benefit DBT payment workflow (RnREntitlementPackage -> RnRBenefitDisbursal)."""
    fixtures = setup_phase4_fixtures
    prop_id = fixtures["proposal_id"]
    token = get_token("collector.pune@nlams.gov.demo")
    headers = {"Authorization": f"Bearer {token}"}

    # Ensure proposal is at STAGE_10_AWARD_PRONOUNCED before R&R payout
    db = SessionLocal()
    proposal = db.query(ProjectProposal).filter(ProjectProposal.id == prop_id).first()
    proposal.current_stage = WorkflowStage.STAGE_10_AWARD_PRONOUNCED
    db.commit()
    db.close()

    # Retrieve approved R&R package
    rnr_res = client.get(f"/api/v1/rnr/proposals/{prop_id}/entitlements", headers=headers)
    assert rnr_res.status_code == 200
    pkgs = rnr_res.json()
    approved_pkg = [p for p in pkgs if p["status"] == "APPROVED_BY_RNR_ADMIN"][0]

    disbursal_payload = {
        "bank_account_no": "918273645501",
        "bank_ifsc_code": "SBIN0000454",
        "bank_name": "State Bank of India",
    }
    response = client.post(f"/api/v1/rnr/proposals/{prop_id}/disburse-rnr/{approved_pkg['id']}", json=disbursal_payload, headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["is_simulated"] is True
    assert data["payment_status"] == "PROCESSED_SIMULATED"
    assert data["pfms_transaction_ref"].startswith("SIM-RNR-")
    assert data["amount_inr"] == approved_pkg["total_rnr_entitlement_inr"]
    assert "Simulated" in data["disclaimer"]

    # Verify Proposal has NOT been advanced to STAGE_11 merely because an R&R benefit was disbursed
    db = SessionLocal()
    proposal = db.query(ProjectProposal).filter(ProjectProposal.id == prop_id).first()
    assert proposal.current_stage == WorkflowStage.STAGE_10_AWARD_PRONOUNCED

    # Verify R&R package disbursal status is independently tracked
    pkg = db.query(RnREntitlementPackage).filter(RnREntitlementPackage.id == approved_pkg["id"]).first()
    assert pkg.status == "DISBURSED"
    db.close()


def test_citizen_and_unauthorized_role_restrictions(setup_phase4_fixtures):
    """Test RBAC restrictions on R&R and DBT payout endpoints."""
    fixtures = setup_phase4_fixtures
    prop_id = fixtures["proposal_id"]
    awd_id = fixtures["award_id"]
    citizen_token = get_token("citizen@example.com")
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    # Citizen trying to authorize land compensation payout -> Forbidden 403
    disbursal_payload = {
        "bank_account_no": "987654321012",
        "bank_ifsc_code": "SBIN0000454",
        "bank_name": "State Bank of India",
    }
    forbidden_res = client.post(f"/api/v1/rnr/proposals/{prop_id}/disburse-award/{awd_id}", json=disbursal_payload, headers=citizen_headers)
    assert forbidden_res.status_code == 403

    # Citizen can view CPR losses -> Allowed 200
    cpr_res = client.get(f"/api/v1/rnr/proposals/{prop_id}/community-assets", headers=citizen_headers)
    assert cpr_res.status_code == 200
