import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient) -> None:
    """Sprawdza, czy serwis zwraca poprawny status health."""
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "works"}
