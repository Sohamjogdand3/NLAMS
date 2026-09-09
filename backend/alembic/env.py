import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
import geoalchemy2  # noqa: F401

# Add backend root to sys.path so app imports work
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.db.base import Base
# Import all models here so Base.metadata is populated with all tables
import app.models  # noqa: F401

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Overwrite sqlalchemy.url with application settings
config.set_main_option("sqlalchemy.url", settings.sync_database_url)

target_metadata = Base.metadata

# PostGIS / TIGER / Topology system tables that should never be modified or dropped by Alembic
IGNORED_TABLE_NAMES = {
    "spatial_ref_sys",
    "geometry_columns",
    "geography_columns",
    "raster_columns",
    "raster_overviews",
    "layer",
    "topology",
}

IGNORED_TABLE_PREFIXES = (
    "tiger",
    "topology",
    "tabblock",
    "bg",
    "tract",
    "zcta5",
    "county",
    "state",
    "place",
    "cousub",
    "edges",
    "faces",
    "featnames",
    "addr",
    "zip_",
    "pagc_",
    "loader_",
    "direction_lookup",
    "secondary_unit_lookup",
    "street_type_lookup",
    "state_lookup",
    "countysub_lookup",
    "place_lookup",
    "zip_lookup",
    "geocode_settings",
)

IGNORED_SCHEMAS = {"tiger", "tiger_data", "topology"}


def include_object(object, name, type_, reflected, compare_to):
    """Filter out PostGIS, Tiger Geocoder, and Topology extension tables from Alembic autogenerate."""
    if type_ == "table":
        # Ignore by schema
        if hasattr(object, "schema") and object.schema in IGNORED_SCHEMAS:
            return False
        # Ignore specific system table names
        if name in IGNORED_TABLE_NAMES:
            return False
        # Ignore PostGIS/Tiger/Census prefixes
        if name and name.startswith(IGNORED_TABLE_PREFIXES):
            return False
    return True


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=include_object,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
