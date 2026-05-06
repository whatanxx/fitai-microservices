# Sprawozdanie z Testowania Projektu FitAI

Dokument opisuje strategię zapewnienia jakości, używane biblioteki, strukturę testów oraz rzeczywiste wyniki pokrycia kodu (coverage) w mikroserwisach FitAI.

---

## 1. Biblioteki i Narzędzia Testowe

| Biblioteka | Wersja | Zastosowanie |
|---|---|---|
| **[pytest](https://docs.pytest.org/)** | 8.2.0 | Główny framework do uruchamiania i organizacji testów |
| **[pytest-asyncio](https://pytest-asyncio.readthedocs.io/)** | 0.23.6 | Obsługa testów asynchronicznych (`async def test_...`) |
| **[pytest-cov](https://pytest-cov.readthedocs.io/)** | 5.0.0 | Generowanie raportów pokrycia kodu (coverage) |
| **[HTTPX](https://www.python-httpx.org/)** | 0.27.0 | Asynchroniczny klient HTTP do wywoływania endpointów FastAPI w testach (`ASGITransport`) |
| **[unittest.mock](https://docs.python.org/3/library/unittest.mock.html)** | stdlib | Mockowanie zewnętrznych zależności (Gemini API, OpenAI API, httpx) |
| **[SQLite / aiosqlite](https://www.sqlite.org/)** | 0.20.0 | In-memory/plikowa baza danych do testów integracyjnych (izolacja od PostgreSQL) |
| **[Mypy](https://mypy.readthedocs.io/)** | 1.10.0 | Statyczna analiza typów – weryfikacja poprawności typów bez uruchamiania kodu |

---

## 2. Struktura Testów

W każdym serwisie backendowym folder `tests/` zawiera:

```
services/<service-name>/
└── tests/
    ├── conftest.py       # Konfiguracja sesji testowej: baza SQLite, fixture async_client
    ├── test_health.py    # Test endpointu /health
    ├── test_auth.py      # (user-service) Rejestracja, logowanie, JWT
    ├── test_profiles.py  # (user-service) CRUD profilu użytkownika
    ├── test_plans.py     # (workout-service) CRUD planów, dni, ćwiczeń
    └── test_ai_coach.py  # (ai-coach-service) Generowanie planu, refinement, ochrona przed promptami
```

Każdy `conftest.py` tworzy izolowane środowisko testowe:
- `user-service` i `workout-service` korzystają z **SQLite** zamiast PostgreSQL
- `ai-coach-service` nie wymaga bazy danych – serwis jest bezstanowy

---

## 3. Rodzaje Testów

### Testy Integracyjne (Integration Tests)
Dominujący rodzaj testów w projekcie. Każdy test wywołuje rzeczywiste endpointy HTTP przez `HTTPX + ASGITransport`, który uruchamia aplikację FastAPI bez serwera HTTP. Baza danych (SQLite) jest tworzona przed seją testową i kasowana po niej.

**Przykład** (`test_auth.py`):
```python
@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient) -> None:
    response = await async_client.post(
        "/api/users/register",
        json={"email": "newuser@example.com", "password": "securepass"},
    )
    assert response.status_code == 201
```

### Testy Jednostkowe (Unit Tests)
Stosowane głównie w `ai-coach-service` do testowania logiki izolowanej od sieci. Moduł `unittest.mock` zastępuje klientów AI (Gemini, OpenAI) i wywołania HTTP do innych serwisów atrapami (`MagicMock`, `AsyncMock`).

**Przykład** – test ochrony przed prompt injection (`test_ai_coach.py`):
```python
def test_check_prompt_injection_sql() -> None:
    from fastapi import HTTPException
    from app.main import check_prompt_injection
    with pytest.raises(HTTPException) as exc_info:
        check_prompt_injection("drop table users")
    assert exc_info.value.status_code == 400
```

### Statyczna Analiza Typów (Mypy)
Uruchamiana ręcznie z poziomu folderu serwisu. Weryfikuje zgodność typów w całym kodzie bez jego uruchamiania.

---

## 4. Wyniki Testów i Pokrycie Kodu (Coverage)

### User Service — 23 testy ✅

| Plik | Linie | Pokrycie |
|---|---|---|
| `app/__init__.py` | 0 | 100% |
| `app/auth.py` | 39 | **95%** |
| `app/database.py` | 21 | 67% |
| `app/main.py` | 14 | 93% |
| `app/models.py` | 32 | **100%** |
| `app/routers/auth.py` | 32 | **97%** |
| `app/routers/profiles.py` | 18 | **100%** |
| `app/schemas.py` | 68 | **100%** |
| `app/services/profile_service.py` | 58 | 69% |
| **TOTAL** | **282** | **90%** |

**Scenariusze objęte testami:** rejestracja (sukces, duplikat, złe hasło, zły email), logowanie (sukces, złe hasło, brak użytkownika), weryfikacja JWT (`/me`), CRUD profilu (tworzenie, aktualizacja, walidacja danych – wiek, wzrost, waga), wewnętrzny endpoint `/profiles/{user_id}`.

---

### Workout Service — 25 testów ✅

| Plik | Linie | Pokrycie |
|---|---|---|
| `app/__init__.py` | 0 | 100% |
| `app/database.py` | 28 | 57% |
| `app/main.py` | 191 | 36% |
| `app/models.py` | 36 | **100%** |
| `app/schemas.py` | 41 | **100%** |
| **TOTAL** | **296** | **55%** |

**Scenariusze objęte testami:** tworzenie planu (dezaktywacja poprzednich), pobieranie planu (pełne dane z dniami i ćwiczeniami), lista planów użytkownika, plany publiczne, usuwanie planu, aktualizacja tytułu, publikowanie, aktywowanie planu, ukończenie dnia treningowego, ukończenie serii ćwiczenia (z limitem do `sets`), pełna aktualizacja (PUT), ochrona własności planu (403), klonowanie planu.

---

### AI Coach Service — 17 testów ✅

| Plik | Linie | Pokrycie |
|---|---|---|
| `app/__init__.py` | 0 | 100% |
| `app/main.py` | 193 | **80%** |
| **TOTAL** | **193** | **80%** |

**Scenariusze objęte testami:** ochrona przed prompt injection (SQL, jailbreak, przepisy, hacking), generowanie planu przez Gemini (z mockiem LLM i httpx), generowanie planu przez OpenAI, limit 5 planów na użytkownika (403), niedostępność User Service (502), wyjaśnienie ćwiczenia (`/explain`) – sukces, brak modelu, błąd modelu, modyfikacja planu (`/refine`) – sukces, ochrona przed promptem, brak modelu.

---

### Podsumowanie Zbiorcze

| Serwis | Liczba testów | Całkowite pokrycie |
|---|---|---|
| **User Service** | 23 | **90%** |
| **Workout Service** | 25 | **55%** |
| **AI Coach Service** | 17 | **80%** |
| **ŁĄCZNIE** | **65** | — |

---

## 5. Jak Uruchomić Testy?

Z poziomu folderu konkretnego serwisu (np. `services/user-service`):

```bash
# Instalacja zależności
pip install -r requirements.txt

# Uruchomienie testów
PYTHONPATH=. pytest

# Testy z raportem pokrycia
PYTHONPATH=. pytest --cov=app tests/ --cov-report=term-missing

# Statyczna analiza typów
mypy .
```

---

## 6. Dobre Praktyki Stosowane w Projekcie

1. **Testowanie ścieżek błędnych:** Każdy endpoint posiada testy dla przypadków niepoprawnych danych (błędna walidacja 422, brak zasobu 404, konflikt 409, brak uprawnień 403).
2. **Izolacja od zewnętrznych serwisów:** AI Coach Service używa mocków dla Gemini/OpenAI – testy są bezpłatne i deterministyczne.
3. **Izolacja bazy danych:** SQLite zamiast PostgreSQL w testach – brak efektów ubocznych na dane produkcyjne.
4. **Type Hinting + Mypy:** Typy argumentów i wartości zwracanych są zawsze deklarowane, co Mypy weryfikuje statycznie.
5. **conftest.py per serwis:** Każdy serwis ma własną konfigurację testową, co zapewnia pełną izolację między mikroserwisami.
