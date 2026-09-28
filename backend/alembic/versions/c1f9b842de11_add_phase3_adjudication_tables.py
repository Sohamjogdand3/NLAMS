"""add phase3 adjudication tables

Revision ID: c1f9b842de11
Revises: a8d29f01bc43
Create Date: 2026-09-29 01:05:40.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision = 'c1f9b842de11'
down_revision = 'a8d29f01bc43'
branch_labels = None
depends_on = None


def table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    insp = Inspector.from_engine(bind)
    return table_name in insp.get_table_names()


def upgrade():
    # 1. Section 15 Objections Table
    if not table_exists("section15_objections"):
        op.create_table(
            "section15_objections",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("parcel_id", sa.Integer(), nullable=True),
            sa.Column("citizen_user_id", sa.Integer(), nullable=False),
            sa.Column("objection_case_no", sa.String(length=100), nullable=False),
            sa.Column("objector_name", sa.String(length=200), nullable=False),
            sa.Column("survey_number", sa.String(length=50), nullable=False),
            sa.Column("village_name", sa.String(length=100), nullable=False),
            sa.Column("objection_category", sa.String(length=100), nullable=False),
            sa.Column("description", sa.Text(), nullable=False),
            sa.Column("supporting_document_url", sa.String(length=255), nullable=True),
            sa.Column("hearing_date", sa.DateTime(), nullable=True),
            sa.Column("hearing_location", sa.String(length=255), nullable=True),
            sa.Column("hearing_officer_user_id", sa.Integer(), nullable=True),
            sa.Column("hearing_minutes", sa.Text(), nullable=True),
            sa.Column("disposal_status", sa.String(length=50), nullable=False, server_default="FILED"),
            sa.Column("disposal_order_no", sa.String(length=100), nullable=True),
            sa.Column("disposal_order_summary", sa.Text(), nullable=True),
            sa.Column("disposal_order_date", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["parcel_id"], ["land_parcels.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["citizen_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["hearing_officer_user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_section15_objections_id"), "section15_objections", ["id"], unique=False)
        op.create_index(op.f("ix_section15_objections_proposal_id"), "section15_objections", ["proposal_id"], unique=False)
        op.create_index(op.f("ix_section15_objections_objection_case_no"), "section15_objections", ["objection_case_no"], unique=True)
        op.create_index(op.f("ix_section15_objections_disposal_status"), "section15_objections", ["disposal_status"], unique=False)

    # 2. Citizen Claims Table (Dual-Pane Queue)
    if not table_exists("citizen_claims"):
        op.create_table(
            "citizen_claims",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("parcel_id", sa.Integer(), nullable=False),
            sa.Column("citizen_user_id", sa.Integer(), nullable=False),
            sa.Column("claim_reference_no", sa.String(length=100), nullable=False),
            sa.Column("claimant_name", sa.String(length=200), nullable=False),
            sa.Column("survey_number", sa.String(length=50), nullable=False),
            sa.Column("village_name", sa.String(length=100), nullable=False),
            sa.Column("uploaded_title_deed_url", sa.String(length=255), nullable=True),
            sa.Column("uploaded_7_12_extract_url", sa.String(length=255), nullable=True),
            sa.Column("aadhaar_vault_ref", sa.String(length=100), nullable=True),
            sa.Column("aadhaar_kyc_status", sa.String(length=50), nullable=False, server_default="VERIFIED_OTP"),
            sa.Column("bank_account_no", sa.String(length=50), nullable=True),
            sa.Column("bank_ifsc_code", sa.String(length=20), nullable=True),
            sa.Column("bank_name", sa.String(length=100), nullable=True),
            sa.Column("claimed_area_ha", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("claimed_share_fraction", sa.String(length=20), nullable=False, server_default="1/1"),
            sa.Column("adjudication_status", sa.String(length=50), nullable=False, server_default="PENDING_REVIEW"),
            sa.Column("discrepancy_flag", sa.Boolean(), nullable=False, server_default="0"),
            sa.Column("discrepancy_details", sa.Text(), nullable=True),
            sa.Column("adjudication_notes", sa.Text(), nullable=True),
            sa.Column("verified_by_user_id", sa.Integer(), nullable=True),
            sa.Column("verified_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["parcel_id"], ["land_parcels.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["citizen_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["verified_by_user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_citizen_claims_id"), "citizen_claims", ["id"], unique=False)
        op.create_index(op.f("ix_citizen_claims_proposal_id"), "citizen_claims", ["proposal_id"], unique=False)
        op.create_index(op.f("ix_citizen_claims_claim_reference_no"), "citizen_claims", ["claim_reference_no"], unique=True)
        op.create_index(op.f("ix_citizen_claims_adjudication_status"), "citizen_claims", ["adjudication_status"], unique=False)

    # 3. Statutory Awards Table
    if not table_exists("statutory_awards"):
        op.create_table(
            "statutory_awards",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("parcel_id", sa.Integer(), nullable=False),
            sa.Column("claim_id", sa.Integer(), nullable=True),
            sa.Column("award_order_no", sa.String(length=100), nullable=False),
            sa.Column("survey_number", sa.String(length=50), nullable=False),
            sa.Column("village_name", sa.String(length=100), nullable=False),
            sa.Column("primary_khatedar_name", sa.String(length=200), nullable=False),
            sa.Column("affected_area_ha", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("valuation_breakdown_json", sa.Text(), nullable=False),
            sa.Column("base_market_value_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("multiplied_land_value_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("solatium_100_pct_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("additional_market_value_12_pct_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("structural_assets_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("total_statutory_award_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("is_pronounced", sa.Boolean(), nullable=False, server_default="0"),
            sa.Column("award_declared_at", sa.DateTime(), nullable=True),
            sa.Column("pronounced_by_collector_id", sa.Integer(), nullable=True),
            sa.Column("disbursal_status", sa.String(length=50), nullable=False, server_default="AWAITING_PRONOUNCEMENT"),
            sa.Column("disbursed_at", sa.DateTime(), nullable=True),
            sa.Column("pfms_transaction_ref", sa.String(length=100), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["parcel_id"], ["land_parcels.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["claim_id"], ["citizen_claims.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["pronounced_by_collector_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_statutory_awards_id"), "statutory_awards", ["id"], unique=False)
        op.create_index(op.f("ix_statutory_awards_proposal_id"), "statutory_awards", ["proposal_id"], unique=False)
        op.create_index(op.f("ix_statutory_awards_award_order_no"), "statutory_awards", ["award_order_no"], unique=True)
        op.create_index(op.f("ix_statutory_awards_disbursal_status"), "statutory_awards", ["disbursal_status"], unique=False)


def downgrade():
    if table_exists("statutory_awards"):
        op.drop_table("statutory_awards")
    if table_exists("citizen_claims"):
        op.drop_table("citizen_claims")
    if table_exists("section15_objections"):
        op.drop_table("section15_objections")
