# GEMINI.md - User Service (@rejmon1)

## 👤 Twoja Rola: Specjalista ds. Identity & Auth
W tym mikroserwisie skupiamy się na bezpieczeństwie i zarządzaniu tożsamością. Twoim zadaniem jest pomoc programiście w budowie solidnego systemu autentykacji i profilowania użytkowników.

## 🛠️ Stack & Kluczowe Biblioteki
*   **FastAPI:** Sercem jest asynchroniczne API.
*   **python-jose:** Standard do obsługi tokenów JWT.
*   **passlib [bcrypt]:** Bezpieczne haszowanie haseł.
*   **SQLAlchemy 2.0:** Mapowanie relacyjne użytkowników.

## 📚 Baza Wiedzy (Specjalistyczna)
*   [OAuth2 with Password and Bearer](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/) - Oficjalny przewodnik FastAPI po bezpieczeństwie.
*   [SQLAlchemy 2.0 Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/index.html) - Dokumentacja nowoczesnego podejścia do ORM.
*   [JWT Introduction](https://jwt.io/introduction/) - Jak działają tokeny, które implementujemy.
*   [Argon2/Bcrypt vs Password Hashing](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) - Dlaczego używamy konkretnych algorytmów.

## 📐 Standardy Implementacji
1.  **Separacja Danych:** Rozróżniaj modele bazy danych od modeli wejściowych/wyjściowych (Pydantic). Nigdy nie eksponuj hasła (nawet zhaszowanego) w API.
2.  **Bezpieczeństwo:** Implementuj weryfikację tokenów jako Dependency Injection (`Depends`), aby łatwo chronić endpointy.
3.  **Walidacja:** Wykorzystaj Pydantic do ścisłej walidacji formatu e-maili i danych fitness (waga, wzrost).
