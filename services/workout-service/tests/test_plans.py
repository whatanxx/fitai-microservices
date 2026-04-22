import pytest
from httpx import AsyncClient

# Bazowy payload - plan z 1 dniem treningowym i 1 ćwiczeniem
_BASE_PLAN = {
    "user_id": 1,
    "title": "Test Plan",
    "duration_weeks": 1,
    "days": [
        {
            "week_number": 1,
            "day_number": 1,
            "is_rest_day": False,
            "target_muscle_group": "Chest",
            "is_completed": False,
            "exercises": [
                {
                    "name": "Push-up",
                    "sets": 3,
                    "reps": "12",
                    "rest_time_seconds": 60,
                }
            ],
        }
    ],
}


async def _create_plan(async_client: AsyncClient, user_id: int = 1, title: str = "Test Plan") -> dict:
    payload = {**_BASE_PLAN, "user_id": user_id, "title": title}
    resp = await async_client.post("/api/workouts/plans", json=payload)
    assert resp.status_code == 201
    return resp.json()


# ── Tworzenie planu ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_plan_success(async_client: AsyncClient) -> None:
    """POST /api/workouts/plans tworzy nowy plan treningowy."""
    response = await async_client.post("/api/workouts/plans", json=_BASE_PLAN)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Plan"
    assert data["user_id"] == 1
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_create_plan_deactivates_previous(async_client: AsyncClient) -> None:
    """Tworzenie nowego planu dezaktywuje poprzednie plany użytkownika."""
    user_id = 10
    plan1 = await _create_plan(async_client, user_id=user_id, title="Plan 1")
    await _create_plan(async_client, user_id=user_id, title="Plan 2")

    # Plan 1 powinien być teraz nieaktywny
    get_resp = await async_client.get(f"/api/workouts/plans/{plan1['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["is_active"] is False


# ── Pobieranie planu ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_plan_success(async_client: AsyncClient) -> None:
    """GET /api/workouts/plans/{plan_id} zwraca pełny plan z dniami i ćwiczeniami."""
    plan = await _create_plan(async_client)
    plan_id = plan["id"]

    response = await async_client.get(f"/api/workouts/plans/{plan_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == plan_id
    assert len(data["days"]) == 1
    assert len(data["days"][0]["exercises"]) == 1


@pytest.mark.asyncio
async def test_get_plan_not_found(async_client: AsyncClient) -> None:
    """GET nieistniejącego planu zwraca 404."""
    response = await async_client.get("/api/workouts/plans/999999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_user_plans(async_client: AsyncClient) -> None:
    """GET /api/workouts/plans/user/{user_id} zwraca listę planów użytkownika."""
    user_id = 20
    await _create_plan(async_client, user_id=user_id)

    response = await async_client.get(f"/api/workouts/plans/user/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert all(p["user_id"] == user_id for p in data)


@pytest.mark.asyncio
async def test_get_public_plans(async_client: AsyncClient) -> None:
    """GET /api/workouts/plans/public zwraca listę opublikowanych planów."""
    response = await async_client.get("/api/workouts/plans/public")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ── Usuwanie planu ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_delete_plan_success(async_client: AsyncClient) -> None:
    """DELETE /api/workouts/plans/{plan_id} usuwa plan i kolejne GET zwraca 404."""
    plan = await _create_plan(async_client)
    plan_id = plan["id"]

    del_resp = await async_client.delete(f"/api/workouts/plans/{plan_id}")
    assert del_resp.status_code == 204

    get_resp = await async_client.get(f"/api/workouts/plans/{plan_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_plan_not_found(async_client: AsyncClient) -> None:
    """DELETE nieistniejącego planu zwraca 404."""
    response = await async_client.delete("/api/workouts/plans/999999")
    assert response.status_code == 404


# ── Aktualizacja tytułu planu ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_update_plan_title(async_client: AsyncClient) -> None:
    """PATCH /api/workouts/plans/{plan_id}?title=... aktualizuje tytuł."""
    plan = await _create_plan(async_client)
    plan_id = plan["id"]

    response = await async_client.patch(
        f"/api/workouts/plans/{plan_id}", params={"title": "Nowy Tytuł"}
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Nowy Tytuł"


@pytest.mark.asyncio
async def test_update_plan_title_not_found(async_client: AsyncClient) -> None:
    """PATCH tytułu nieistniejącego planu zwraca 404."""
    response = await async_client.patch(
        "/api/workouts/plans/999999", params={"title": "X"}
    )
    assert response.status_code == 404


# ── Publikowanie planu ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_publish_plan_success(async_client: AsyncClient) -> None:
    """PATCH /api/workouts/plans/{plan_id}/publish ustawia is_published = true."""
    plan = await _create_plan(async_client)
    plan_id = plan["id"]

    response = await async_client.patch(f"/api/workouts/plans/{plan_id}/publish")
    assert response.status_code == 200
    assert response.json()["is_published"] is True


@pytest.mark.asyncio
async def test_publish_plan_not_found(async_client: AsyncClient) -> None:
    """PATCH /publish nieistniejącego planu zwraca 404."""
    response = await async_client.patch("/api/workouts/plans/999999/publish")
    assert response.status_code == 404


# ── Aktywowanie planu ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_activate_plan_success(async_client: AsyncClient) -> None:
    """PATCH /api/workouts/plans/{plan_id}/activate aktywuje wybrany plan."""
    user_id = 30
    plan1 = await _create_plan(async_client, user_id=user_id, title="Plan A")
    plan2 = await _create_plan(async_client, user_id=user_id, title="Plan B")

    response = await async_client.patch(f"/api/workouts/plans/{plan1['id']}/activate")
    assert response.status_code == 200
    assert response.json()["is_active"] is True

    # Plan B powinien być teraz nieaktywny
    plan2_resp = await async_client.get(f"/api/workouts/plans/{plan2['id']}")
    assert plan2_resp.json()["is_active"] is False


@pytest.mark.asyncio
async def test_activate_plan_not_found(async_client: AsyncClient) -> None:
    """PATCH /activate nieistniejącego planu zwraca 404."""
    response = await async_client.patch("/api/workouts/plans/999999/activate")
    assert response.status_code == 404


# ── Ukończenie dnia treningowego ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_complete_day_success(async_client: AsyncClient) -> None:
    """PATCH /api/workouts/days/{day_id}/complete ustawia is_completed = true."""
    plan = await _create_plan(async_client)
    plan_id = plan["id"]

    plan_detail = await async_client.get(f"/api/workouts/plans/{plan_id}")
    day_id = plan_detail.json()["days"][0]["id"]

    response = await async_client.patch(f"/api/workouts/days/{day_id}/complete")
    assert response.status_code == 200
    assert response.json()["is_completed"] is True


@pytest.mark.asyncio
async def test_complete_day_not_found(async_client: AsyncClient) -> None:
    """PATCH /complete nieistniejącego dnia zwraca 404."""
    response = await async_client.patch("/api/workouts/days/999999/complete")
    assert response.status_code == 404


# ── Ukończenie serii ćwiczenia ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_complete_set_success(async_client: AsyncClient) -> None:
    """PATCH /api/workouts/exercises/{id}/complete-set zwiększa completed_sets."""
    plan = await _create_plan(async_client)
    plan_id = plan["id"]

    plan_detail = await async_client.get(f"/api/workouts/plans/{plan_id}")
    exercise_id = plan_detail.json()["days"][0]["exercises"][0]["id"]

    response = await async_client.patch(
        f"/api/workouts/exercises/{exercise_id}/complete-set"
    )
    assert response.status_code == 200
    assert response.json()["completed_sets"] == 1


@pytest.mark.asyncio
async def test_complete_set_does_not_exceed_sets(async_client: AsyncClient) -> None:
    """completed_sets nie przekracza łącznej liczby serii (sets)."""
    plan = await _create_plan(async_client)
    plan_id = plan["id"]

    plan_detail = await async_client.get(f"/api/workouts/plans/{plan_id}")
    exercise = plan_detail.json()["days"][0]["exercises"][0]
    exercise_id = exercise["id"]
    total_sets = exercise["sets"]  # 3

    # Wykonaj więcej kliknięć niż jest serii
    for _ in range(total_sets + 3):
        await async_client.patch(f"/api/workouts/exercises/{exercise_id}/complete-set")

    final_resp = await async_client.patch(
        f"/api/workouts/exercises/{exercise_id}/complete-set"
    )
    assert final_resp.json()["completed_sets"] <= total_sets


@pytest.mark.asyncio
async def test_complete_set_not_found(async_client: AsyncClient) -> None:
    """PATCH /complete-set nieistniejącego ćwiczenia zwraca 404."""
    response = await async_client.patch("/api/workouts/exercises/999999/complete-set")
    assert response.status_code == 404


# ── Pełna aktualizacja planu (PUT) ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_full_update_plan_success(async_client: AsyncClient) -> None:
    """PUT /api/workouts/plans/{plan_id} zastępuje dni i ćwiczenia."""
    user_id = 40
    plan = await _create_plan(async_client, user_id=user_id)
    plan_id = plan["id"]

    updated_payload = {
        "user_id": user_id,
        "title": "Zaktualizowany Plan",
        "duration_weeks": 2,
        "days": [
            {
                "week_number": 1,
                "day_number": 1,
                "is_rest_day": True,
                "target_muscle_group": None,
                "is_completed": False,
                "exercises": [],
            }
        ],
    }
    response = await async_client.put(
        f"/api/workouts/plans/{plan_id}", json=updated_payload
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Zaktualizowany Plan"
    assert data["duration_weeks"] == 2
    assert data["days"][0]["is_rest_day"] is True


@pytest.mark.asyncio
async def test_full_update_plan_wrong_owner(async_client: AsyncClient) -> None:
    """PUT planu przez innego użytkownika zwraca 403."""
    plan = await _create_plan(async_client, user_id=50)
    plan_id = plan["id"]

    payload = {**_BASE_PLAN, "user_id": 51}  # Inny user_id
    response = await async_client.put(f"/api/workouts/plans/{plan_id}", json=payload)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_full_update_plan_not_found(async_client: AsyncClient) -> None:
    """PUT nieistniejącego planu zwraca 404."""
    response = await async_client.put(
        "/api/workouts/plans/999999", json={**_BASE_PLAN, "user_id": 1}
    )
    assert response.status_code == 404


# ── Klonowanie planu ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_clone_plan_success(async_client: AsyncClient) -> None:
    """POST /api/workouts/plans/{plan_id}/clone/{user_id} tworzy kopię planu."""
    source_plan = await _create_plan(async_client, user_id=60)
    target_user_id = 61

    response = await async_client.post(
        f"/api/workouts/plans/{source_plan['id']}/clone/{target_user_id}"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == target_user_id
    assert "Kopia:" in data["title"]


@pytest.mark.asyncio
async def test_clone_plan_source_not_found(async_client: AsyncClient) -> None:
    """Klonowanie nieistniejącego planu zwraca 404."""
    response = await async_client.post("/api/workouts/plans/999999/clone/1")
    assert response.status_code == 404
