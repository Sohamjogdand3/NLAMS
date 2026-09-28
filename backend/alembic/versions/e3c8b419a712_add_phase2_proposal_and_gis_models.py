"""add_phase2_proposal_and_gis_models

Revision ID: e3c8b419a712
Revises: df248956a252
Create Date: 2026-09-29 00:05:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = 'e3c8b419a712'
down_revision: Union[str, None] = 'df248956a252'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade() -> None:
    # 1. Project Proposals Table
    if not table_exists("project_proposals"):
        op.create_table(
            "project_proposals",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_code", sa.String(length=100), nullable=False),
            sa.Column("project_title", sa.String(length=255), nullable=False),
            sa.Column("requiring_agency", sa.String(length=100), nullable=False),
            sa.Column("ministry", sa.String(length=150), nullable=False),
            sa.Column("public_purpose", sa.String(length=255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("estimated_budget_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("required_area_ha", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("target_district_id", sa.Integer(), nullable=True),
            sa.Column("target_taluka_ids", sa.String(length=255), nullable=True),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="DRAFT"),
            sa.Column("conflict_status", sa.String(length=50), nullable=False, server_default="PENDING_CHECK"),
            sa.Column("conflict_notes", sa.Text(), nullable=True),
            sa.Column("multiplier_compliance_verified", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("created_by_user_id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["target_district_id"], ["jurisdictions.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_project_proposals_id"), "project_proposals", ["id"], unique=False)
        op.create_index(op.f("ix_project_proposals_proposal_code"), "project_proposals", ["proposal_code"], unique=True)
        op.create_index(op.f("ix_project_proposals_project_title"), "project_proposals", ["project_title"], unique=False)
        op.create_index(op.f("ix_project_proposals_requiring_agency"), "project_proposals", ["requiring_agency"], unique=False)
        op.create_index(op.f("ix_project_proposals_status"), "project_proposals", ["status"], unique=False)
        op.create_index(op.f("ix_project_proposals_target_district_id"), "project_proposals", ["target_district_id"], unique=False)
        op.create_index(op.f("ix_project_proposals_created_by_user_id"), "project_proposals", ["created_by_user_id"], unique=False)

    # 2. Project DPR Documents Table
    if not table_exists("project_dpr_documents"):
        op.create_table(
            "project_dpr_documents",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("document_name", sa.String(length=200), nullable=False),
            sa.Column("document_type", sa.String(length=50), nullable=False),
            sa.Column("file_path", sa.String(length=500), nullable=False),
            sa.Column("file_size_bytes", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("file_hash", sa.String(length=64), nullable=True),
            sa.Column("uploaded_by_user_id", sa.Integer(), nullable=False),
            sa.Column("uploaded_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["uploaded_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_project_dpr_documents_id"), "project_dpr_documents", ["id"], unique=False)
        op.create_index(op.f("ix_project_dpr_documents_proposal_id"), "project_dpr_documents", ["proposal_id"], unique=False)

    # 3. Project GIS Corridors Table
    if not table_exists("project_gis_corridors"):
        op.create_table(
            "project_gis_corridors",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("geojson_data", sa.Text(), nullable=False),
            sa.Column("bounding_box", sa.String(length=200), nullable=True),
            sa.Column("total_corridor_length_km", sa.Float(), nullable=True),
            sa.Column("corridor_width_meters", sa.Float(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("proposal_id"),
        )
        op.create_index(op.f("ix_project_gis_corridors_id"), "project_gis_corridors", ["id"], unique=False)
        op.create_index(op.f("ix_project_gis_corridors_proposal_id"), "project_gis_corridors", ["proposal_id"], unique=True)

    # 4. Land Parcels Table
    if not table_exists("land_parcels"):
        op.create_table(
            "land_parcels",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("survey_number", sa.String(length=50), nullable=False),
            sa.Column("gut_number", sa.String(length=50), nullable=True),
            sa.Column("sub_division", sa.String(length=50), nullable=True),
            sa.Column("village_name", sa.String(length=100), nullable=False),
            sa.Column("taluka_name", sa.String(length=100), nullable=False),
            sa.Column("district_name", sa.String(length=100), nullable=False),
            sa.Column("jurisdiction_id", sa.Integer(), nullable=True),
            sa.Column("land_category", sa.String(length=50), nullable=False, server_default="DRY_CROP"),
            sa.Column("total_area_ha", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("affected_area_ha", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("owner_name", sa.String(length=200), nullable=False),
            sa.Column("aadhaar_vault_ref", sa.String(length=100), nullable=True),
            sa.Column("khatedar_count", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("khasra_roster_json", sa.Text(), nullable=True),
            sa.Column("is_frozen", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("freeze_timestamp", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["jurisdiction_id"], ["jurisdictions.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_land_parcels_id"), "land_parcels", ["id"], unique=False)
        op.create_index(op.f("ix_land_parcels_proposal_id"), "land_parcels", ["proposal_id"], unique=False)
        op.create_index(op.f("ix_land_parcels_survey_number"), "land_parcels", ["survey_number"], unique=False)
        op.create_index(op.f("ix_land_parcels_village_name"), "land_parcels", ["village_name"], unique=False)
        op.create_index(op.f("ix_land_parcels_taluka_name"), "land_parcels", ["taluka_name"], unique=False)
        op.create_index(op.f("ix_land_parcels_district_name"), "land_parcels", ["district_name"], unique=False)

    # 5. Escrow Accounts Table
    if not table_exists("escrow_accounts"):
        op.create_table(
            "escrow_accounts",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("account_number", sa.String(length=50), nullable=False),
            sa.Column("bank_name", sa.String(length=100), nullable=False),
            sa.Column("ifsc_code", sa.String(length=20), nullable=False),
            sa.Column("total_sanctioned_amount", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("deposited_amount", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("disbursed_amount", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("balance_amount", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("replenishment_threshold_pct", sa.Float(), nullable=False, server_default="20.0"),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="ACTIVE"),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("proposal_id"),
        )
        op.create_index(op.f("ix_escrow_accounts_id"), "escrow_accounts", ["id"], unique=False)
        op.create_index(op.f("ix_escrow_accounts_proposal_id"), "escrow_accounts", ["proposal_id"], unique=True)
        op.create_index(op.f("ix_escrow_accounts_account_number"), "escrow_accounts", ["account_number"], unique=True)

    # 6. CALA Appointments Table
    if not table_exists("cala_appointments"):
        op.create_table(
            "cala_appointments",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("district_id", sa.Integer(), nullable=False),
            sa.Column("collector_user_id", sa.Integer(), nullable=False),
            sa.Column("appointed_by_user_id", sa.Integer(), nullable=False),
            sa.Column("appointment_order_no", sa.String(length=100), nullable=False),
            sa.Column("appointment_date", sa.DateTime(), nullable=False),
            sa.Column("gazette_notification_ref", sa.String(length=150), nullable=True),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="ACTIVE"),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["appointed_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["collector_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["district_id"], ["jurisdictions.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("proposal_id"),
        )
        op.create_index(op.f("ix_cala_appointments_id"), "cala_appointments", ["id"], unique=False)
        op.create_index(op.f("ix_cala_appointments_proposal_id"), "cala_appointments", ["proposal_id"], unique=True)
        op.create_index(op.f("ix_cala_appointments_appointment_order_no"), "cala_appointments", ["appointment_order_no"], unique=True)


def downgrade() -> None:
    if table_exists("cala_appointments"):
        op.drop_table("cala_appointments")
    if table_exists("escrow_accounts"):
        op.drop_table("escrow_accounts")
    if table_exists("land_parcels"):
        op.drop_table("land_parcels")
    if table_exists("project_gis_corridors"):
        op.drop_table("project_gis_corridors")
    if table_exists("project_dpr_documents"):
        op.drop_table("project_dpr_documents")
    if table_exists("project_proposals"):
        op.drop_table("project_proposals")
