"""add_phase1_identity_models

Revision ID: df248956a252
Revises: fd53b96110cf
Create Date: 2026-09-28 20:32:08.423004

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df248956a252'
down_revision: Union[str, None] = 'fd53b96110cf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if 'login_attempts' not in existing_tables:
        op.create_table('login_attempts',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('email', sa.String(length=150), nullable=False),
            sa.Column('ip', sa.String(length=50), nullable=True),
            sa.Column('count', sa.Integer(), nullable=False),
            sa.Column('blocked_until', sa.DateTime(), nullable=True),
            sa.Column('last_attempt_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_login_attempts_email'), 'login_attempts', ['email'], unique=False)
        op.create_index(op.f('ix_login_attempts_id'), 'login_attempts', ['id'], unique=False)
        op.create_index(op.f('ix_login_attempts_ip'), 'login_attempts', ['ip'], unique=False)

    if 'official_email_domains' not in existing_tables:
        op.create_table('official_email_domains',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('domain', sa.String(length=100), nullable=False),
            sa.Column('organization_name', sa.String(length=200), nullable=False),
            sa.Column('department', sa.String(length=200), nullable=True),
            sa.Column('active', sa.Boolean(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_official_email_domains_domain'), 'official_email_domains', ['domain'], unique=True)
        op.create_index(op.f('ix_official_email_domains_id'), 'official_email_domains', ['id'], unique=False)

    if 'otp_sessions' not in existing_tables:
        op.create_table('otp_sessions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('email', sa.String(length=150), nullable=False),
            sa.Column('otp_hash', sa.String(length=255), nullable=False),
            sa.Column('purpose', sa.String(length=50), nullable=False),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('attempts', sa.Integer(), nullable=False),
            sa.Column('verified_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_otp_sessions_email'), 'otp_sessions', ['email'], unique=False)
        op.create_index(op.f('ix_otp_sessions_expires_at'), 'otp_sessions', ['expires_at'], unique=False)
        op.create_index(op.f('ix_otp_sessions_id'), 'otp_sessions', ['id'], unique=False)

    if 'audit_logs' not in existing_tables:
        op.create_table('audit_logs',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('event_type', sa.String(length=100), nullable=False),
            sa.Column('actor_id', sa.Integer(), nullable=True),
            sa.Column('actor_email', sa.String(length=150), nullable=True),
            sa.Column('ip_address', sa.String(length=50), nullable=True),
            sa.Column('user_agent', sa.Text(), nullable=True),
            sa.Column('jurisdiction_id', sa.Integer(), nullable=True),
            sa.Column('entity_name', sa.String(length=100), nullable=True),
            sa.Column('entity_id', sa.String(length=100), nullable=True),
            sa.Column('details', sa.JSON(), nullable=True),
            sa.Column('timestamp', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['jurisdiction_id'], ['jurisdictions.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_audit_logs_actor_id'), 'audit_logs', ['actor_id'], unique=False)
        op.create_index(op.f('ix_audit_logs_event_type'), 'audit_logs', ['event_type'], unique=False)
        op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
        op.create_index(op.f('ix_audit_logs_jurisdiction_id'), 'audit_logs', ['jurisdiction_id'], unique=False)
        op.create_index(op.f('ix_audit_logs_timestamp'), 'audit_logs', ['timestamp'], unique=False)

    if 'user_sessions' not in existing_tables:
        op.create_table('user_sessions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('refresh_token_hash', sa.String(length=255), nullable=False),
            sa.Column('device_id', sa.String(length=100), nullable=True),
            sa.Column('ip_address', sa.String(length=50), nullable=True),
            sa.Column('user_agent', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('revoked_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_user_sessions_id'), 'user_sessions', ['id'], unique=False)
        op.create_index(op.f('ix_user_sessions_refresh_token_hash'), 'user_sessions', ['refresh_token_hash'], unique=True)
        op.create_index(op.f('ix_user_sessions_user_id'), 'user_sessions', ['user_id'], unique=False)

    if 'users' in existing_tables:
        user_columns = {c['name'] for c in inspector.get_columns('users')}
        if 'designation' not in user_columns:
            op.add_column('users', sa.Column('designation', sa.String(length=150), nullable=True))
        if 'department_name' not in user_columns:
            op.add_column('users', sa.Column('department_name', sa.String(length=200), nullable=True))
        if 'aadhaar_vault_ref' not in user_columns:
            op.add_column('users', sa.Column('aadhaar_vault_ref', sa.String(length=100), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if 'users' in existing_tables:
        user_columns = {c['name'] for c in inspector.get_columns('users')}
        if 'aadhaar_vault_ref' in user_columns:
            op.drop_column('users', 'aadhaar_vault_ref')
        if 'department_name' in user_columns:
            op.drop_column('users', 'department_name')
        if 'designation' in user_columns:
            op.drop_column('users', 'designation')

    if 'user_sessions' in existing_tables:
        op.drop_table('user_sessions')
    if 'audit_logs' in existing_tables:
        op.drop_table('audit_logs')
    if 'otp_sessions' in existing_tables:
        op.drop_table('otp_sessions')
    if 'official_email_domains' in existing_tables:
        op.drop_table('official_email_domains')
    if 'login_attempts' in existing_tables:
        op.drop_table('login_attempts')
