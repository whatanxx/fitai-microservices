import pytest
from httpx import AsyncClient


async def _register_and_login(
    async_client: AsyncClient, email: str, password: str = "securepass"
) -> tuple[int, str]:
    """Rejestruje użytkownika i zwraca (user_id, token)."""
    reg_resp = await async_client.post(
        "/api/users/register", json={"email": email, "password": password}
    )
    assert reg_resp.status_code == 201
    user_id: int = reg_resp.json()["id"]
    login_resp = await async_client.post(
        "/api/users/login", json={"email": email, "password": password}
    )
    token: str = login_resp.json()["access_token"]
    return user_id, token


@pytest.mark.asyncio
async def test_get_profile_auto_creates(async_client: AsyncClient) -> None:
    """GET profilu automatycznie tworzy pusty profil jeśli nie istnieje."""
    user_id, _ = await _register_and_login(async_client, "get_profile@example.com")
    response = await async_client.get(f"/api/users/{user_id}/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id


@pytest.mark.asyncio
async def test_get_profile_user_not_found(async_client: AsyncClient) -> None:
    """GET profilu nieistniejącego użytkownika zwraca 404."""
    response = await async_client.get("/api/users/999999/profile")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_profile_success(async_client: AsyncClient) -> None:
    """PUT profilu aktualizuje dane użytkownika."""
    user_id, _ = await _register_and_login(async_client, "update_ok@example.com")
    response = await async_client.put(
        f"/api/users/{user_id}/profile",
        json={
            "first_name": "Jan",
            "age": 25,
            "height_cm": 180,
            "current_weight_kg": 75.0,
            "fitness_goal": "Muscle gain",
            "experience_level": "Beginner",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Jan"
    assert data["age"] == 25
    assert data["height_cm"] == 180


@pytest.mark.asyncio
async def test_update_profile_user_not_found(async_client: AsyncClient) -> None:
    """PUT profilu dla nieistniejącego użytkownika zwraca 404."""
    response = await async_client.put(
        "/api/users/999999/profile",
        json={"first_name": "Ghost"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_profile_invalid_age(async_client: AsyncClient) -> None:
    """Wiek powyżej 120 jest odrzucany przez walidację (422)."""
    user_id, _ = await _register_and_login(async_client, "bad_age@example.com")
    response = await async_client.put(
        f"/api/users/{user_id}/profile", json={"age": 150}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_profile_negative_age(async_client: AsyncClient) -> None:
    """Ujemny wiek jest odrzucany przez walidację (422)."""
    user_id, _ = await _register_and_login(async_client, "neg_age@example.com")
    response = await async_client.put(
        f"/api/users/{user_id}/profile", json={"age": -1}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_profile_invalid_height(async_client: AsyncClient) -> None:
    """Wzrost poniżej 120 cm jest odrzucany przez walidację (422)."""
    user_id, _ = await _register_and_login(async_client, "bad_height@example.com")
    response = await async_client.put(
        f"/api/users/{user_id}/profile", json={"height_cm": 50}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_profile_invalid_weight(async_client: AsyncClient) -> None:
    """Waga poniżej lub równa 30 kg jest odrzucana przez walidację (422)."""
    user_id, _ = await _register_and_login(async_client, "bad_weight@example.com")
    response = await async_client.put(
        f"/api/users/{user_id}/profile", json={"current_weight_kg": 10.0}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_profile_weight_history_grows(async_client: AsyncClient) -> None:
    """Zmiana wagi dodaje wpis do weight_history."""
    user_id, _ = await _register_and_login(async_client, "weight_hist@example.com")
    await async_client.put(
        f"/api/users/{user_id}/profile", json={"current_weight_kg": 80.0}
    )
    response = await async_client.put(
        f"/api/users/{user_id}/profile", json={"current_weight_kg": 78.5}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["weight_history"] is not None
    assert len(data["weight_history"]) >= 2


@pytest.mark.asyncio
async def test_create_profile_conflict(async_client: AsyncClient) -> None:
    """POST profilu dla użytkownika z istniejącym profilem zwraca 409."""
    user_id, _ = await _register_and_login(async_client, "create_conflict@example.com")
    # Rejestracja automatycznie tworzy pusty profil,
    # więc drugi POST powinien zwrócić konflikt.
    response = await async_client.post(
        f"/api/users/{user_id}/profile", json={"first_name": "Test"}
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_internal_get_profile_endpoint(async_client: AsyncClient) -> None:
    """Wewnętrzny endpoint /profiles/{user_id} zwraca profil."""
    user_id, _ = await _register_and_login(async_client, "internal@example.com")
    response = await async_client.get(f"/profiles/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id


@pytest.mark.asyncio
async def test_internal_get_profile_not_found(async_client: AsyncClient) -> None:
    """Wewnętrzny endpoint /profiles/{user_id} dla nieistniejącego użytkownika zwraca 404."""
    response = await async_client.get("/profiles/999999")
    assert response.status_code == 404
