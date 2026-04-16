import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# Import all models so Alembic can detect them
from app.database import Base  # noqa: F401
import app.models  # noqa: F401

config = context.config

# Override sqlalchemy.url from DATABASE_URL env var if available
database_url = os.getenv("DATABASE_URL")
if not database_url:
    db_user = os.getenv("DB_USER", "postgres")
    db_pass = os.getenv("DB_PASSWORD")
    db_name = os.getenv("DB_NAME", "fitai_db")
    db_host = os.getenv("DB_HOST", "/cloudsql/gen-lang-client-0145356180:us-central1:fitai-instance")
    if db_pass:
        database_url = f"postgresql+psycopg2://{db_user}:{db_pass}@/{db_name}?host={db_host}"

if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
