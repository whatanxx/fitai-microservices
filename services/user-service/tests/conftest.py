import os
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient

# Ustawiamy zmienne środowiskowe ZANIM zaimportujemy app
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["DB_PASSWORD"] = "test"
os.environ["JWT_SECRET"] = "test_secret_key_123"

from app.database import Base, engine
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Tworzy tabele w testowej bazie danych przed uruchomieniem testów."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Dostarcza asynchronicznego klienta HTTP do testowania endpointów."""
    async with AsyncClient(
        transport=ASGITransport(app=app), # type: ignore
        base_url="http://test"
    ) as client:
        yield client
