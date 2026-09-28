"""add phase4 rnr and disbursal tables

Revision ID: d5e8a931ef22
Revises: c1f9b842de11
Create Date: 2026-09-29 01:25:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision = 'd5e8a931ef22'
down_revision = 'c1f9b842de11'
branch_labels = None
depends_on = None


def table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    insp = Inspector.from_engine(bind)
    return table_name in insp.get_table_names()


def upgrade():
    # 1. Affected Family Census
    if not table_exists("affected_family_census"):
        op.create_table(
            "affected_family_census",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("census_family_code", sa.String(length=100), nullable=False),
            sa.Column("family_head_name", sa.String(length=200), nullable=False),
            sa.Column("ration_card_no", sa.String(length=50), nullable=True),
            sa.Column("aadhaar_vault_ref", sa.String(length=100), nullable=True),
            sa.Column("village_name", sa.String(length=100), nullable=False),
            sa.Column("associated_survey_number", sa.String(length=50), nullable=True),
            sa.Column("category", sa.String(length=100), nullable=False, server_default="AGRICULTURAL_LABORER"),
            sa.Column("caste_category", sa.String(length=50), nullable=False, server_default="GENERAL"),
            sa.Column("is_scheduled_area_displacement", sa.Boolean(), nullable=False, server_default="0"),
            sa.Column("is_bpl", sa.Boolean(), nullable=False, server_default="0"),
            sa.Column("family_members_count", sa.Integer(), nullable=False, server_default="4"),
            sa.Column("primary_livelihood_source", sa.String(length=200), nullable=False),
            sa.Column("dependency_years", sa.Integer(), nullable=False, server_default="5"),
            sa.Column("verification_status", sa.String(length=50), nullable=False, server_default="SURVEYED"),
            sa.Column("verification_notes", sa.Text(), nullable=True),
            sa.Column("verified_by_user_id", sa.Integer(), nullable=True),
            sa.Column("verified_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["verified_by_user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_affected_family_census_id"), "affected_family_census", ["id"], unique=False)
        op.create_index(op.f("ix_affected_family_census_proposal_id"), "affected_family_census", ["proposal_id"], unique=False)
        op.create_index(op.f("ix_affected_family_census_census_family_code"), "affected_family_census", ["census_family_code"], unique=True)
        op.create_index(op.f("ix_affected_family_census_village_name"), "affected_family_census", ["village_name"], unique=False)
        op.create_index(op.f("ix_affected_family_census_verification_status"), "affected_family_census", ["verification_status"], unique=False)

    # 2. R&R Entitlement Packages
    if not table_exists("rnr_entitlement_packages"):
        op.create_table(
            "rnr_entitlement_packages",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("family_id", sa.Integer(), nullable=False),
            sa.Column("entitlement_package_code", sa.String(length=100), nullable=False),
            sa.Column("rule_config_version", sa.String(length=50), nullable=False, server_default="v2.4-MHA-RNR-2026"),
            sa.Column("pmay_housing_eligibility_status", sa.String(length=100), nullable=False, server_default="ELIGIBLE_PMAY_MATCHING"),
            sa.Column("pmay_matching_reference", sa.String(length=100), nullable=True),
            sa.Column("housing_plot_or_unit_details", sa.String(length=255), nullable=True),
            sa.Column("subsistence_allowance_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("resettlement_grant_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("livelihood_annuity_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("cattle_shed_petty_shop_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("artisan_transport_grant_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("sc_st_eligibility_criteria_met", sa.Boolean(), nullable=False, server_default="0"),
            sa.Column("sc_st_additional_grant_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("total_rnr_entitlement_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("breakdown_json", sa.Text(), nullable=False),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="DRAFT_ASSESSMENT"),
            sa.Column("approval_notes", sa.Text(), nullable=True),
            sa.Column("approved_by_user_id", sa.Integer(), nullable=True),
            sa.Column("approved_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["family_id"], ["affected_family_census.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["approved_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_rnr_entitlement_packages_id"), "rnr_entitlement_packages", ["id"], unique=False)
        op.create_index(op.f("ix_rnr_entitlement_packages_proposal_id"), "rnr_entitlement_packages", ["proposal_id"], unique=False)
        op.create_index(op.f("ix_rnr_entitlement_packages_family_id"), "rnr_entitlement_packages", ["family_id"], unique=True)
        op.create_index(op.f("ix_rnr_entitlement_packages_entitlement_package_code"), "rnr_entitlement_packages", ["entitlement_package_code"], unique=True)
        op.create_index(op.f("ix_rnr_entitlement_packages_status"), "rnr_entitlement_packages", ["status"], unique=False)

    # 3. Community Asset Losses
    if not table_exists("community_asset_losses"):
        op.create_table(
            "community_asset_losses",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("village_name", sa.String(length=100), nullable=False),
            sa.Column("asset_name", sa.String(length=200), nullable=False),
            sa.Column("asset_category", sa.String(length=100), nullable=False),
            sa.Column("survey_number", sa.String(length=50), nullable=True),
            sa.Column("affected_extent", sa.String(length=100), nullable=False),
            sa.Column("estimated_restoration_cost_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("pwd_valuation_ref", sa.String(length=100), nullable=True),
            sa.Column("statutory_amenity_code", sa.String(length=50), nullable=False, server_default="AMENITY_ITEM_1"),
            sa.Column("reconstruction_status", sa.String(length=50), nullable=False, server_default="IDENTIFIED"),
            sa.Column("reconstruction_site_details", sa.String(length=255), nullable=True),
            sa.Column("reconstruction_notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_community_asset_losses_id"), "community_asset_losses", ["id"], unique=False)
        op.create_index(op.f("ix_community_asset_losses_proposal_id"), "community_asset_losses", ["proposal_id"], unique=False)
        op.create_index(op.f("ix_community_asset_losses_village_name"), "community_asset_losses", ["village_name"], unique=False)
        op.create_index(op.f("ix_community_asset_losses_reconstruction_status"), "community_asset_losses", ["reconstruction_status"], unique=False)

    # 4. Land Compensation Disbursals
    if not table_exists("land_compensation_disbursals"):
        op.create_table(
            "land_compensation_disbursals",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("award_id", sa.Integer(), nullable=False),
            sa.Column("escrow_account_id", sa.Integer(), nullable=False),
            sa.Column("disbursal_batch_ref", sa.String(length=100), nullable=False),
            sa.Column("beneficiary_name", sa.String(length=200), nullable=False),
            sa.Column("survey_number", sa.String(length=50), nullable=False),
            sa.Column("bank_account_no", sa.String(length=50), nullable=False),
            sa.Column("bank_ifsc_code", sa.String(length=20), nullable=False),
            sa.Column("bank_name", sa.String(length=100), nullable=False),
            sa.Column("amount_inr", sa.Float(), nullable=False),
            sa.Column("pfms_transaction_ref", sa.String(length=100), nullable=False),
            sa.Column("data_source", sa.String(length=50), nullable=False, server_default="SIMULATED_PFMS_GATEWAY_ADAPTER"),
            sa.Column("is_simulated", sa.Boolean(), nullable=False, server_default="1"),
            sa.Column("disclaimer", sa.String(length=255), nullable=False),
            sa.Column("payment_status", sa.String(length=50), nullable=False, server_default="PROCESSED_SIMULATED"),
            sa.Column("disbursed_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("authorized_by_user_id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["award_id"], ["statutory_awards.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["escrow_account_id"], ["escrow_accounts.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["authorized_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_land_compensation_disbursals_id"), "land_compensation_disbursals", ["id"], unique=False)
        op.create_index(op.f("ix_land_compensation_disbursals_proposal_id"), "land_compensation_disbursals", ["proposal_id"], unique=False)
        op.create_index(op.f("ix_land_compensation_disbursals_award_id"), "land_compensation_disbursals", ["award_id"], unique=False)
        op.create_index(op.f("ix_land_compensation_disbursals_escrow_account_id"), "land_compensation_disbursals", ["escrow_account_id"], unique=False)
        op.create_index(op.f("ix_land_compensation_disbursals_disbursal_batch_ref"), "land_compensation_disbursals", ["disbursal_batch_ref"], unique=False)
        op.create_index(op.f("ix_land_compensation_disbursals_pfms_transaction_ref"), "land_compensation_disbursals", ["pfms_transaction_ref"], unique=True)
        op.create_index(op.f("ix_land_compensation_disbursals_payment_status"), "land_compensation_disbursals", ["payment_status"], unique=False)

    # 5. R&R Benefit Disbursals
    if not table_exists("rnr_benefit_disbursals"):
        op.create_table(
            "rnr_benefit_disbursals",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("entitlement_package_id", sa.Integer(), nullable=False),
            sa.Column("family_id", sa.Integer(), nullable=False),
            sa.Column("escrow_account_id", sa.Integer(), nullable=False),
            sa.Column("disbursal_batch_ref", sa.String(length=100), nullable=False),
            sa.Column("beneficiary_name", sa.String(length=200), nullable=False),
            sa.Column("family_code", sa.String(length=100), nullable=False),
            sa.Column("bank_account_no", sa.String(length=50), nullable=False),
            sa.Column("bank_ifsc_code", sa.String(length=20), nullable=False),
            sa.Column("bank_name", sa.String(length=100), nullable=False),
            sa.Column("amount_inr", sa.Float(), nullable=False),
            sa.Column("pfms_transaction_ref", sa.String(length=100), nullable=False),
            sa.Column("data_source", sa.String(length=50), nullable=False, server_default="SIMULATED_PFMS_GATEWAY_ADAPTER"),
            sa.Column("is_simulated", sa.Boolean(), nullable=False, server_default="1"),
            sa.Column("disclaimer", sa.String(length=255), nullable=False),
            sa.Column("payment_status", sa.String(length=50), nullable=False, server_default="PROCESSED_SIMULATED"),
            sa.Column("disbursed_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("authorized_by_user_id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["entitlement_package_id"], ["rnr_entitlement_packages.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["family_id"], ["affected_family_census.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["escrow_account_id"], ["escrow_accounts.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["authorized_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_rnr_benefit_disbursals_id"), "rnr_benefit_disbursals", ["id"], unique=False)
        op.create_index(op.f("ix_rnr_benefit_disbursals_proposal_id"), "rnr_benefit_disbursals", ["proposal_id"], unique=False)
        op.create_index(op.f("ix_rnr_benefit_disbursals_entitlement_package_id"), "rnr_benefit_disbursals", ["entitlement_package_id"], unique=False)
        op.create_index(op.f("ix_rnr_benefit_disbursals_family_id"), "rnr_benefit_disbursals", ["family_id"], unique=False)
        op.create_index(op.f("ix_rnr_benefit_disbursals_escrow_account_id"), "rnr_benefit_disbursals", ["escrow_account_id"], unique=False)
        op.create_index(op.f("ix_rnr_benefit_disbursals_disbursal_batch_ref"), "rnr_benefit_disbursals", ["disbursal_batch_ref"], unique=False)
        op.create_index(op.f("ix_rnr_benefit_disbursals_pfms_transaction_ref"), "rnr_benefit_disbursals", ["pfms_transaction_ref"], unique=True)
        op.create_index(op.f("ix_rnr_benefit_disbursals_payment_status"), "rnr_benefit_disbursals", ["payment_status"], unique=False)


def downgrade():
    if table_exists("rnr_benefit_disbursals"):
        op.drop_table("rnr_benefit_disbursals")
    if table_exists("land_compensation_disbursals"):
        op.drop_table("land_compensation_disbursals")
    if table_exists("community_asset_losses"):
        op.drop_table("community_asset_losses")
    if table_exists("rnr_entitlement_packages"):
        op.drop_table("rnr_entitlement_packages")
    if table_exists("affected_family_census"):
        op.drop_table("affected_family_census")
