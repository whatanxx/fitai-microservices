# GEMINI.md - Workout Service (@rejmon1)

## 👤 Twoja Rola: Specjalista ds. Core Business Logic
Jako Gemini CLI wspieram Cię w implementacji serca aplikacji - systemu przechowywania planów treningowych, dni i ćwiczeń oraz śledzenia ukończonych dni treningowych.

## 🛠️ Stack & Kluczowe Biblioteki
*   **FastAPI:** Budowa RESTful API.
*   **SQLAlchemy 2.0:** Relacje (One-to-Many), zapytania asynchroniczne.
*   **Pydantic:** Walidacja złożonych struktur treningowych.

## 📚 Baza Wiedzy (Specjalistyczna)
*   [SQLAlchemy Basic Relationships](https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html) - Jak łączyć plany z ćwiczeniami.
*   [Pydantic Models Concept](https://docs.pydantic.dev/latest/concepts/models/) - Głębokie zrozumienie walidacji.
*   [Clean Architecture with Python](https://www.cosmicpython.com/book/preface.html) - Jak organizować logikę, by była testowalna.
*   [PostgreSQL Best Practices for Apps](https://www.postgresql.org/docs/current/best-practices.html) - Podstawy wydajnej bazy.
*   [FastAPI PATCH](https://fastapi.tiangolo.com/tutorial/body-updates/) - Wzorzec aktualizacji częściowej dla `PATCH /days/{day_id}/complete`.

## 📐 Standardy Implementacji
1.  **Kontrakt Endpointów:** Utrzymuj endpointy `GET /health`, `POST /plans`, `GET /plans/user/{user_id}`, `GET /plans/{plan_id}`, `PATCH /days/{day_id}/complete` zgodnie z architekturą.
2.  **Relacje i Integralność:** Pilnuj spójności relacji `WorkoutPlans -> WorkoutDays -> Exercises` oraz kaskadowych operacji przy usuwaniu.
3.  **DTO (Schemas):** Twórz oddzielne schematy dla listy planów, pełnego widoku planu i operacji zapisu/aktualizacji statusu dnia.
