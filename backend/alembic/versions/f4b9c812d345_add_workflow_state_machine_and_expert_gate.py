"""add_workflow_state_machine_and_expert_gate

Revision ID: f4b9c812d345
Revises: e3c8b419a712
Create Date: 2026-09-29 00:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = 'f4b9c812d345'
down_revision: Union[str, None] = 'e3c8b419a712'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def column_exists(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade() -> None:
    # 1. Add Workflow State Machine & Milestone fields to project_proposals
    if table_exists("project_proposals"):
        if not column_exists("project_proposals", "current_stage"):
            op.add_column("project_proposals", sa.Column("current_stage", sa.String(length=50), nullable=False, server_default="STAGE_1_REQUISITION"))
            op.create_index(op.f("ix_project_proposals_current_stage"), "project_proposals", ["current_stage"], unique=False)
        
        if not column_exists("project_proposals", "impacted_districts_json"):
            op.add_column("project_proposals", sa.Column("impacted_districts_json", sa.Text(), nullable=True))
        if not column_exists("project_proposals", "impacted_talukas_json"):
            op.add_column("project_proposals", sa.Column("impacted_talukas_json", sa.Text(), nullable=True))
        if not column_exists("project_proposals", "impacted_villages_json"):
            op.add_column("project_proposals", sa.Column("impacted_villages_json", sa.Text(), nullable=True))
        if not column_exists("project_proposals", "estimated_affected_parcels_count"):
            op.add_column("project_proposals", sa.Column("estimated_affected_parcels_count", sa.Integer(), nullable=False, server_default="0"))
        if not column_exists("project_proposals", "estimated_affected_families_count"):
            op.add_column("project_proposals", sa.Column("estimated_affected_families_count", sa.Integer(), nullable=False, server_default="0"))

        if not column_exists("project_proposals", "sec11_notification_no"):
            op.add_column("project_proposals", sa.Column("sec11_notification_no", sa.String(length=100), nullable=True))
        if not column_exists("project_proposals", "sec11_published_at"):
            op.add_column("project_proposals", sa.Column("sec11_published_at", sa.DateTime(), nullable=True))
        if not column_exists("project_proposals", "sec11_objection_deadline"):
            op.add_column("project_proposals", sa.Column("sec11_objection_deadline", sa.DateTime(), nullable=True))

        if not column_exists("project_proposals", "sec19_declaration_no"):
            op.add_column("project_proposals", sa.Column("sec19_declaration_no", sa.String(length=100), nullable=True))
        if not column_exists("project_proposals", "sec19_published_at"):
            op.add_column("project_proposals", sa.Column("sec19_published_at", sa.DateTime(), nullable=True))

        if not column_exists("project_proposals", "award_declaration_date"):
            op.add_column("project_proposals", sa.Column("award_declaration_date", sa.DateTime(), nullable=True))
        if not column_exists("project_proposals", "possession_certificate_no"):
            op.add_column("project_proposals", sa.Column("possession_certificate_no", sa.String(length=100), nullable=True))
        if not column_exists("project_proposals", "possession_handed_over_at"):
            op.add_column("project_proposals", sa.Column("possession_handed_over_at", sa.DateTime(), nullable=True))

    # 2. Add Source Metadata to land_parcels
    if table_exists("land_parcels"):
        if not column_exists("land_parcels", "data_source"):
            op.add_column("land_parcels", sa.Column("data_source", sa.String(length=50), nullable=False, server_default="SIMULATED_MAHABHULEKH_ADAPTER"))
        if not column_exists("land_parcels", "api_version"):
            op.add_column("land_parcels", sa.Column("api_version", sa.String(length=20), nullable=False, server_default="v2.4-sim"))

    # 3. Create Expert Committee Appraisals Table
    if not table_exists("expert_committee_appraisals"):
        op.create_table(
            "expert_committee_appraisals",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("committee_chairperson", sa.String(length=150), nullable=False),
            sa.Column("appraisal_date", sa.DateTime(), nullable=False),
            sa.Column("recommendation_status", sa.String(length=50), nullable=False, server_default="RECOMMENDED_FOR_ACQUISITION"),
            sa.Column("clearance_remarks", sa.Text(), nullable=False),
            sa.Column("public_purpose_verified", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("minimal_land_verified", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("simp_feasibility_verified", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("signed_by_expert_ids_json", sa.Text(), nullable=True),
            sa.Column("submitted_by_user_id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["submitted_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("proposal_id"),
        )
        op.create_index(op.f("ix_expert_committee_appraisals_id"), "expert_committee_appraisals", ["id"], unique=False)
        op.create_index(op.f("ix_expert_committee_appraisals_proposal_id"), "expert_committee_appraisals", ["proposal_id"], unique=True)


def downgrade() -> None:
    if table_exists("expert_committee_appraisals"):
        op.drop_table("expert_committee_appraisals")
