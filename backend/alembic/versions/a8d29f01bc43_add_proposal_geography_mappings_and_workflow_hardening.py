"""add proposal geography mappings and workflow hardening

Revision ID: a8d29f01bc43
Revises: f4b9c812d345
Create Date: 2026-09-29 00:29:30.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision = 'a8d29f01bc43'
down_revision = 'f4b9c812d345'
branch_labels = None
depends_on = None


def table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    insp = Inspector.from_engine(bind)
    return table_name in insp.get_table_names()


def column_exists(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    insp = Inspector.from_engine(bind)
    columns = [c['name'] for c in insp.get_columns(table_name)]
    return column_name in columns


def upgrade():
    # 1. Create proposal_geography_mappings table
    if not table_exists("proposal_geography_mappings"):
        op.create_table(
            "proposal_geography_mappings",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("state_id", sa.Integer(), nullable=False),
            sa.Column("district_id", sa.Integer(), nullable=False),
            sa.Column("taluka_id", sa.Integer(), nullable=True),
            sa.Column("village_id", sa.Integer(), nullable=True),
            sa.Column("is_primary", sa.Boolean(), nullable=False, server_default="1"),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["state_id"], ["jurisdictions.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["district_id"], ["jurisdictions.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["taluka_id"], ["jurisdictions.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["village_id"], ["jurisdictions.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_proposal_geography_mappings_id"), "proposal_geography_mappings", ["id"], unique=False)
        op.create_index(op.f("ix_proposal_geography_mappings_proposal_id"), "proposal_geography_mappings", ["proposal_id"], unique=False)
        op.create_index(op.f("ix_proposal_geography_mappings_state_id"), "proposal_geography_mappings", ["state_id"], unique=False)
        op.create_index(op.f("ix_proposal_geography_mappings_district_id"), "proposal_geography_mappings", ["district_id"], unique=False)

    # 2. Add new milestone columns to project_proposals if not present
    new_cols = [
        ("valuation_computed_at", sa.DateTime(), True),
        ("valuation_total_inr", sa.Float(), True),
        ("award_order_no", sa.String(length=100), True),
        ("compensation_disbursed_at", sa.DateTime(), True),
        ("total_disbursed_inr", sa.Float(), True),
        ("pia_accepted_at", sa.DateTime(), True),
        ("pia_acceptance_notes", sa.Text(), True),
    ]
    for col_name, col_type, nullable in new_cols:
        if not column_exists("project_proposals", col_name):
            op.add_column("project_proposals", sa.Column(col_name, col_type, nullable=nullable))


def downgrade():
    if table_exists("proposal_geography_mappings"):
        op.drop_table("proposal_geography_mappings")
