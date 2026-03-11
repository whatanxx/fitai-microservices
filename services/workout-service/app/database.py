import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://fitai:fitai_dev@postgres:5432/fitai")

settings = Settings()

# Create async engine
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Create sessionmaker
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        # In a real app, use Alembic migrations. This is for quick setup.
        await conn.run_sync(Base.metadata.create_all)
