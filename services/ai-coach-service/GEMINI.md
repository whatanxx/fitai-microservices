# GEMINI.md - AI Coach Service (@RakosIX)

## 👤 Twoja Rola: Specjalista ds. GenAI & Integracji
Wspieram Cię w implementacji serwisu orkiestrującego proces generowania planu: pobranie profilu, wywołanie modelu LLM i zapis wyniku w Workout Plan Service.

## 🛠️ Stack & Kluczowe Biblioteki
*   **FastAPI:** Hostowanie endpointów AI.
*   **SDK dostawcy LLM (np. OpenAI):** Komunikacja z modelem generującym plan.
*   **Pydantic:** Walidacja wejścia (profil użytkownika) i wyjścia (ustrukturyzowany JSON planu).

## 📚 Baza Wiedzy (Specjalistyczna)
*   [OpenAI API docs](https://platform.openai.com/docs/overview) - Podstawy integracji wg aktualnej architektury.
*   [Prompt Engineering Guide](https://www.promptingguide.ai/) - Techniki tworzenia skutecznych promptów.
*   [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) - Jak uzyskać poprawny format JSON planu.
*   [Circuit Breaker Pattern](https://microservices.io/patterns/reliability/circuit-breaker.html) - Jak radzić sobie z awariami zewnętrznego API.

## 📐 Standardy Implementacji
1.  **Kontrakt Endpointów:** Utrzymuj endpointy `GET /health` oraz `POST /generate/{user_id}` jako główny trigger pełnego procesu.
2.  **Walidacja JSON:** Odpowiedź modelu musi być parsowana i walidowana przez schemat Pydantic przed zapisem przez `POST /plans` w Workout Plan Service.
3.  **Odporność Integracji:** Obsługuj timeouty, limity i błędy sieciowe zarówno dla wywołania LLM, jak i komunikacji międzyserwisowej.
