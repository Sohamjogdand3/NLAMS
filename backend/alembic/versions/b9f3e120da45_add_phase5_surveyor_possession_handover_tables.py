"""add phase5 surveyor possession handover tables

Revision ID: b9f3e120da45
Revises: d5e8a931ef22
Create Date: 2026-09-29 14:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision = 'b9f3e120da45'
down_revision = 'd5e8a931ef22'
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
    # 1. Field Parcel Surveys Table
    if not table_exists("field_parcel_surveys"):
        op.create_table(
            "field_parcel_surveys",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("parcel_id", sa.Integer(), nullable=False),
            sa.Column("surveyor_user_id", sa.Integer(), nullable=False),
            sa.Column("khasra_gat_number", sa.String(50), nullable=False),
            sa.Column("village_name", sa.String(100), nullable=False),
            sa.Column("taluka_name", sa.String(100), nullable=False),
            sa.Column("district_name", sa.String(100), nullable=False),
            sa.Column("prescribed_area_ha", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("measured_area_ha", sa.Float(), nullable=True),
            sa.Column("variance_percentage", sa.Float(), nullable=True),
            sa.Column("survey_status", sa.String(50), nullable=False, server_default="ASSIGNED"),
            sa.Column("gps_coordinates_json", sa.Text(), nullable=True),
            sa.Column("gps_perimeter_meters", sa.Float(), nullable=True),
            sa.Column("gps_accuracy_meters", sa.Float(), nullable=True),
            sa.Column("is_disputed_boundary", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("dispute_notes", sa.Text(), nullable=True),
            sa.Column("land_use_type", sa.String(50), nullable=False, server_default="Agricultural"),
            sa.Column("occupant_name_on_site", sa.String(200), nullable=True),
            sa.Column("occupant_type", sa.String(100), nullable=True, server_default="Self-Cultivating Owner"),
            sa.Column("road_access", sa.String(100), nullable=True, server_default="Direct Paved Village Road"),
            sa.Column("crops_data_json", sa.Text(), nullable=True),
            sa.Column("trees_data_json", sa.Text(), nullable=True),
            sa.Column("structures_data_json", sa.Text(), nullable=True),
            sa.Column("water_assets_data_json", sa.Text(), nullable=True),
            sa.Column("owner_signature_captured", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("surveyor_remarks", sa.Text(), nullable=True),
            sa.Column("offline_client_uuid", sa.String(100), nullable=True),
            sa.Column("synced_at", sa.DateTime(), nullable=True),
            sa.Column("verified_by_user_id", sa.Integer(), nullable=True),
            sa.Column("verified_at", sa.DateTime(), nullable=True),
            sa.Column("verification_remarks", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["parcel_id"], ["land_parcels.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["surveyor_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["verified_by_user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_field_parcel_surveys_id", "field_parcel_surveys", ["id"])
        op.create_index("ix_field_parcel_surveys_proposal_id", "field_parcel_surveys", ["proposal_id"])
        op.create_index("ix_field_parcel_surveys_parcel_id", "field_parcel_surveys", ["parcel_id"])
        op.create_index("ix_field_parcel_surveys_status", "field_parcel_surveys", ["survey_status"])

    # 2. Geotagged Asset Evidence Table
    if not table_exists("geotagged_asset_evidence"):
        op.create_table(
            "geotagged_asset_evidence",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("survey_id", sa.Integer(), nullable=False),
            sa.Column("parcel_id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("surveyor_user_id", sa.Integer(), nullable=False),
            sa.Column("category", sa.String(50), nullable=False, server_default="SITE_OVERVIEW"),
            sa.Column("caption", sa.String(255), nullable=False),
            sa.Column("latitude", sa.Float(), nullable=False),
            sa.Column("longitude", sa.Float(), nullable=False),
            sa.Column("accuracy_meters", sa.Float(), nullable=False, server_default="2.5"),
            sa.Column("timestamp_captured", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("file_url", sa.String(500), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["survey_id"], ["field_parcel_surveys.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["parcel_id"], ["land_parcels.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["surveyor_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_geotagged_asset_evidence_id", "geotagged_asset_evidence", ["id"])
        op.create_index("ix_geotagged_asset_evidence_survey_id", "geotagged_asset_evidence", ["survey_id"])
        op.create_index("ix_geotagged_asset_evidence_category", "geotagged_asset_evidence", ["category"])

    # 3. Digital Panchnamas Table
    if not table_exists("digital_panchnamas"):
        op.create_table(
            "digital_panchnamas",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("panchnama_number", sa.String(100), nullable=False),
            sa.Column("execution_date", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("site_location_description", sa.Text(), nullable=False),
            sa.Column("circle_officer_name", sa.String(150), nullable=False),
            sa.Column("talathi_name", sa.String(150), nullable=False),
            sa.Column("tehsildar_name", sa.String(150), nullable=False),
            sa.Column("panchas_witnesses_json", sa.Text(), nullable=False),
            sa.Column("total_parcels_taken_count", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("total_area_ha_taken", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("physical_encumbrances_cleared", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("boundary_pillars_fixed", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("standing_crops_harvested_or_compensated", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("panchnama_doc_url", sa.String(500), nullable=False),
            sa.Column("created_by_user_id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("panchnama_number"),
        )
        op.create_index("ix_digital_panchnamas_id", "digital_panchnamas", ["id"])
        op.create_index("ix_digital_panchnamas_proposal_id", "digital_panchnamas", ["proposal_id"])

    # 4. Possession Certificates Table
    if not table_exists("possession_certificates"):
        op.create_table(
            "possession_certificates",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("certificate_number", sa.String(100), nullable=False),
            sa.Column("statutory_section", sa.String(100), nullable=False, server_default="Section 38 / 40 - RFCTLARR Act 2013"),
            sa.Column("issuing_authority_title", sa.String(200), nullable=False),
            sa.Column("issued_by_user_id", sa.Integer(), nullable=False),
            sa.Column("issued_to_requiring_agency", sa.String(150), nullable=False),
            sa.Column("possession_date", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("total_area_acquired_ha", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("total_parcels_count", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("compensation_cleared_confirmation", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("rnr_cleared_confirmation", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("panchnama_id", sa.Integer(), nullable=True),
            sa.Column("certificate_doc_url", sa.String(500), nullable=False),
            sa.Column("status", sa.String(50), nullable=False, server_default="ISSUED_VESTED_IN_STATE"),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["issued_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["panchnama_id"], ["digital_panchnamas.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("proposal_id"),
            sa.UniqueConstraint("certificate_number"),
        )
        op.create_index("ix_possession_certificates_id", "possession_certificates", ["id"])

    # 5. Digital Mutation Records Table
    if not table_exists("digital_mutation_records"):
        op.create_table(
            "digital_mutation_records",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("parcel_id", sa.Integer(), nullable=False),
            sa.Column("ferfar_number", sa.String(100), nullable=False),
            sa.Column("mutation_type", sa.String(100), nullable=False, server_default="ACQUISITION_GOVT_TRANSFER_SEC19"),
            sa.Column("previous_owner_name", sa.String(200), nullable=False),
            sa.Column("new_owner_name", sa.String(200), nullable=False),
            sa.Column("village_name", sa.String(100), nullable=False),
            sa.Column("taluka_name", sa.String(100), nullable=False),
            sa.Column("district_name", sa.String(100), nullable=False),
            sa.Column("survey_number", sa.String(50), nullable=False),
            sa.Column("gut_number", sa.String(50), nullable=True),
            sa.Column("mutated_area_ha", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("e_ferfar_status", sa.String(50), nullable=False, server_default="MUTATION_RECORDED"),
            sa.Column("previous_section11_restriction_status", sa.String(50), nullable=False, server_default="RESOLVED_AND_LIFTED"),
            sa.Column("new_restriction_status", sa.String(50), nullable=False, server_default="VESTED_IN_REQUIRING_AGENCY_PERMANENT"),
            sa.Column("data_source", sa.String(100), nullable=False, server_default="SIMULATED_E_FERFAR_MAHABHULEKH_ADAPTER"),
            sa.Column("is_simulated", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("disclaimer", sa.String(255), nullable=False),
            sa.Column("mutation_timestamp", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("approved_by_user_id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["parcel_id"], ["land_parcels.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["approved_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("ferfar_number"),
        )
        op.create_index("ix_digital_mutation_records_id", "digital_mutation_records", ["id"])
        op.create_index("ix_digital_mutation_records_proposal_id", "digital_mutation_records", ["proposal_id"])
        op.create_index("ix_digital_mutation_records_parcel_id", "digital_mutation_records", ["parcel_id"])

    # 6. PIA Handover Certificates Table
    if not table_exists("pia_handover_certificates"):
        op.create_table(
            "pia_handover_certificates",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("handover_number", sa.String(100), nullable=False),
            sa.Column("possession_certificate_id", sa.Integer(), nullable=False),
            sa.Column("requiring_agency", sa.String(150), nullable=False),
            sa.Column("pia_representative_name", sa.String(150), nullable=False),
            sa.Column("pia_representative_designation", sa.String(150), nullable=False),
            sa.Column("verification_status", sa.String(50), nullable=False, server_default="ACCEPTED"),
            sa.Column("encumbrance_free_verified", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("boundary_demarcation_verified", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("mutations_verified", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("corridor_length_km", sa.Float(), nullable=True),
            sa.Column("total_area_ha", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("acceptance_notes", sa.Text(), nullable=True),
            sa.Column("dispute_reasons", sa.Text(), nullable=True),
            sa.Column("accepted_at", sa.DateTime(), nullable=True),
            sa.Column("action_by_user_id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["possession_certificate_id"], ["possession_certificates.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["action_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("proposal_id"),
            sa.UniqueConstraint("handover_number"),
        )
        op.create_index("ix_pia_handover_certificates_id", "pia_handover_certificates", ["id"])

    # 7. Project Completion Archivals Table
    if not table_exists("project_completion_archivals"):
        op.create_table(
            "project_completion_archivals",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("proposal_id", sa.Integer(), nullable=False),
            sa.Column("archival_dossier_no", sa.String(100), nullable=False),
            sa.Column("total_budget_allocated_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("total_escrow_deposited_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("total_compensation_disbursed_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("total_rnr_disbursed_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("total_cpr_reconstruction_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("total_administrative_charges_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("remaining_escrow_balance_inr", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("reconciliation_status", sa.String(50), nullable=False, server_default="RECONCILED_AND_SETTLED"),
            sa.Column("all_parcels_surveyed", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("all_objections_disposed", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("all_awards_pronounced", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("all_disbursals_settled", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("all_mutations_completed", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("pia_acceptance_confirmed", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("final_audit_hash", sa.String(128), nullable=False),
            sa.Column("archival_summary_json", sa.Text(), nullable=True),
            sa.Column("completed_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("closed_by_user_id", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["proposal_id"], ["project_proposals.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["closed_by_user_id"], ["users.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("proposal_id"),
            sa.UniqueConstraint("archival_dossier_no"),
        )
        op.create_index("ix_project_completion_archivals_id", "project_completion_archivals", ["id"])


def downgrade():
    if table_exists("project_completion_archivals"):
        op.drop_table("project_completion_archivals")
    if table_exists("pia_handover_certificates"):
        op.drop_table("pia_handover_certificates")
    if table_exists("digital_mutation_records"):
        op.drop_table("digital_mutation_records")
    if table_exists("possession_certificates"):
        op.drop_table("possession_certificates")
    if table_exists("digital_panchnamas"):
        op.drop_table("digital_panchnamas")
    if table_exists("geotagged_asset_evidence"):
        op.drop_table("geotagged_asset_evidence")
    if table_exists("field_parcel_surveys"):
        op.drop_table("field_parcel_surveys")
