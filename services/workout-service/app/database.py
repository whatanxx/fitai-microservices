import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Robust connection string builder for GCP/Local (Async)
if not DATABASE_URL:
    db_user = os.getenv("DB_USER", "postgres")
    db_pass = os.getenv("DB_PASSWORD")
    db_name = os.getenv("DB_NAME", "fitai_db")
    db_host = os.getenv("DB_HOST", "/cloudsql/gen-lang-client-0145356180:us-central1:fitai-instance")
    
    if db_pass:
        DATABASE_URL = f"postgresql+asyncpg://{db_user}:{db_pass}@/{db_name}?host={db_host}"
    else:
        raise ValueError("Neither DATABASE_URL nor DB_PASSWORD environment variable is set!")

# Ensure the URL uses asyncpg for async support
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
        # Explicitly update the 'reps' column length for existing databases
        from sqlalchemy import text
        await conn.execute(text("ALTER TABLE exercises ALTER COLUMN reps TYPE VARCHAR(100)"))
