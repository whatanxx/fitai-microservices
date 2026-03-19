# GEMINI.md - User Service (@rejmon1)

## 👤 Twoja Rola: Specjalista ds. Identity & Auth
W tym mikroserwisie skupiamy się na utrzymaniu spójnych danych profilu użytkownika, które są wejściem dla procesu generowania planu treningowego.

## 🛠️ Stack & Kluczowe Biblioteki
*   **FastAPI:** Sercem jest asynchroniczne API.
*   **SQLAlchemy 2.0:** Mapowanie relacyjne użytkowników.
*   **Pydantic:** Walidacja danych profilu i kontraktów API.

## 📚 Baza Wiedzy (Specjalistyczna)
*   [SQLAlchemy 2.0 Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/index.html) - Dokumentacja nowoczesnego podejścia do ORM.
*   [Pydantic Models Concept](https://docs.pydantic.dev/latest/concepts/models/) - Walidacja schematów wejścia/wyjścia.
*   [FastAPI Path Params](https://fastapi.tiangolo.com/tutorial/path-params/) - Projektowanie endpointów z parametrem `user_id`.
*   [PostgreSQL JSON Types](https://www.postgresql.org/docs/current/datatype-json.html) - Przechowywanie `available_equipment` jako JSON.

## 📐 Standardy Implementacji
1.  **Kontrakt API:** Utrzymuj endpointy `GET /health`, `POST /profiles`, `GET /profiles/{user_id}`, `PUT /profiles/{user_id}` zgodnie z dokumentacją architektury.
2.  **Separacja Danych:** Rozróżniaj modele ORM od modeli Pydantic (Create/Read/Update), aby nie przeciekały pola wewnętrzne.
3.  **Walidacja Domenowa:** Waliduj zakresy danych fitness (np. wzrost, waga, liczba dni treningowych), aby AI dostawało poprawne wejście.
