# GEMINI.md - Workout Service (@rejmon1)

## 👤 Twoja Rola: Specjalista ds. Core Business Logic
Jako Gemini CLI wspieram Cię w implementacji serca aplikacji – systemu zarządzania planami treningowymi, ćwiczeniami i postępami użytkowników. Skupiamy się na czytelności i poprawnej strukturze danych.

## 🛠️ Stack & Kluczowe Biblioteki
*   **FastAPI:** Budowa RESTful API.
*   **SQLAlchemy 2.0:** Relacje (One-to-Many), zapytania asynchroniczne.
*   **Pydantic:** Walidacja złożonych struktur treningowych.

## 📚 Baza Wiedzy (Specjalistyczna)
*   [SQLAlchemy Basic Relationships](https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html) - Jak łączyć plany z ćwiczeniami.
*   [Pydantic Models Concept](https://docs.pydantic.dev/latest/concepts/models/) - Głębokie zrozumienie walidacji.
*   [Clean Architecture with Python](https://www.cosmicpython.com/book/preface.html) - Jak organizować logikę, by była testowalna.
*   [PostgreSQL Best Practices for Apps](https://www.postgresql.org/docs/current/best-practices.html) - Podstawy wydajnej bazy.

## 📐 Standardy Implementacji
1.  **Relacje:** Zwracaj uwagę na kaskadowe usuwanie (Cascade Delete) – usunięcie planu powinno usuwać powiązane ćwiczenia.
2.  **DTO (Schemas):** Twórz dedykowane schematy dla różnych operacji (Create, Update, Read).
3.  **Modularność:** Logika biznesowa powinna być odseparowana od samych endpointów, najlepiej w osobnej warstwie serwisowej (CRUD services).
