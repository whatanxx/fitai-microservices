import os
from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_workout.db"

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402


async def _create_tables() -> None:
    """Tworzy tabele w testowej bazie SQLite (bez ALTER TABLE specyficznej dla Postgres)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def _drop_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="session", autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    """Tworzy tabele raz przed wszystkimi testami i usuwa je po zakończeniu sesji."""
    await _create_tables()
    yield
    await _drop_tables()


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Klient HTTP do testowania endpointów; pomija init_db (ALTER TABLE Postgres)."""
    with patch("app.main.init_db", new=AsyncMock()):
        async with AsyncClient(
            transport=ASGITransport(app=app),  # type: ignore
            base_url="http://test",
        ) as client:
            yield client
