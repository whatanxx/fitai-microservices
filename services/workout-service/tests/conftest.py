import os
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient

# Mock DB for health check if needed, though health_check usually doesn't need it
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"

from app.main import app


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=app), # type: ignore
        base_url="http://test"
    ) as client:
        yield client
