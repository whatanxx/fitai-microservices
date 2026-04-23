import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient) -> None:
    """Rejestracja nowego użytkownika kończy się sukcesem."""
    response = await async_client.post(
        "/api/users/register",
        json={"email": "newuser@example.com", "password": "securepass"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["is_active"] is True
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient) -> None:
    """Próba rejestracji z istniejącym emailem zwraca 409."""
    payload = {"email": "dup@example.com", "password": "securepass"}
    await async_client.post("/api/users/register", json=payload)
    response = await async_client.post("/api/users/register", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_register_password_too_short(async_client: AsyncClient) -> None:
    """Hasło krótsze niż 8 znaków zwraca 422."""
    response = await async_client.post(
        "/api/users/register",
        json={"email": "short@example.com", "password": "123"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email(async_client: AsyncClient) -> None:
    """Nieprawidłowy format emaila zwraca 422."""
    response = await async_client.post(
        "/api/users/register",
        json={"email": "not-an-email", "password": "securepass"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient) -> None:
    """Poprawne dane logowania zwracają token JWT."""
    await async_client.post(
        "/api/users/register",
        json={"email": "loginok@example.com", "password": "securepass"},
    )
    response = await async_client.post(
        "/api/users/login",
        json={"email": "loginok@example.com", "password": "securepass"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient) -> None:
    """Błędne hasło zwraca 401."""
    await async_client.post(
        "/api/users/register",
        json={"email": "badpass@example.com", "password": "securepass"},
    )
    response = await async_client.post(
        "/api/users/login",
        json={"email": "badpass@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(async_client: AsyncClient) -> None:
    """Logowanie nieistniejącego użytkownika zwraca 401."""
    response = await async_client.post(
        "/api/users/login",
        json={"email": "ghost@example.com", "password": "securepass"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_success(async_client: AsyncClient) -> None:
    """Pobieranie własnego profilu z ważnym tokenem zwraca dane użytkownika."""
    await async_client.post(
        "/api/users/register",
        json={"email": "me@example.com", "password": "securepass"},
    )
    login_resp = await async_client.post(
        "/api/users/login",
        json={"email": "me@example.com", "password": "securepass"},
    )
    token = login_resp.json()["access_token"]

    response = await async_client.get(
        "/api/users/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_get_me_without_token(async_client: AsyncClient) -> None:
    """Brak tokena w nagłówku zwraca 401."""
    response = await async_client.get("/api/users/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_invalid_token(async_client: AsyncClient) -> None:
    """Nieprawidłowy token JWT zwraca 401."""
    response = await async_client.get(
        "/api/users/me",
        headers={"Authorization": "Bearer thisIsNotAValidToken"},
    )
    assert response.status_code == 401
