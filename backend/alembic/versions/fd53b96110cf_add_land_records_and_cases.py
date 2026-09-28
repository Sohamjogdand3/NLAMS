"""add_land_records_and_cases

Revision ID: fd53b96110cf
Revises: 41da306a6c97
Create Date: 2026-09-09 16:09:47.317245

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fd53b96110cf'
down_revision: Union[str, None] = '41da306a6c97'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if 'acquisition_cases' not in existing_tables:
        op.create_table('acquisition_cases',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('case_number', sa.String(length=100), nullable=False),
            sa.Column('project_name', sa.String(length=200), nullable=False),
            sa.Column('status', sa.String(length=50), nullable=False),
            sa.Column('jurisdiction_id', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['jurisdiction_id'], ['jurisdictions.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_acquisition_cases_case_number'), 'acquisition_cases', ['case_number'], unique=True)
        op.create_index(op.f('ix_acquisition_cases_id'), 'acquisition_cases', ['id'], unique=False)
        op.create_index(op.f('ix_acquisition_cases_jurisdiction_id'), 'acquisition_cases', ['jurisdiction_id'], unique=False)
        op.create_index(op.f('ix_acquisition_cases_status'), 'acquisition_cases', ['status'], unique=False)

    if 'land_records' not in existing_tables:
        op.create_table('land_records',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('survey_number', sa.String(length=50), nullable=False),
            sa.Column('owner_name', sa.String(length=150), nullable=False),
            sa.Column('area_acres', sa.Float(), nullable=False),
            sa.Column('jurisdiction_id', sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(['jurisdiction_id'], ['jurisdictions.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_land_records_id'), 'land_records', ['id'], unique=False)
        op.create_index(op.f('ix_land_records_jurisdiction_id'), 'land_records', ['jurisdiction_id'], unique=False)
        op.create_index(op.f('ix_land_records_survey_number'), 'land_records', ['survey_number'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if 'land_records' in existing_tables:
        op.drop_table('land_records')
    if 'acquisition_cases' in existing_tables:
        op.drop_table('acquisition_cases')
