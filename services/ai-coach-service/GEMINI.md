# GEMINI.md - AI Coach Service (@RakosIX)

## 👤 Twoja Rola: Specjalista ds. GenAI & Integracji
Wspieram Cię w implementacji mózgu aplikacji – serwisu, który komunikuje się z Gemini API, by tworzyć inteligentne plany treningowe. Skupiamy się na Prompt Engineeringu i stabilności połączeń zewnętrznych.

## 🛠️ Stack & Kluczowe Biblioteki
*   **FastAPI:** Hostowanie endpointów AI.
*   **Google Generative AI SDK:** Oficjalna biblioteka do komunikacji z Gemini.
*   **Pydantic:** Walidacja wejścia (dane usera) i wyjścia (odpowiedź AI).

## 📚 Baza Wiedzy (Specjalistyczna)
*   [Google AI SDK for Python](https://ai.google.dev/gemini-api/docs/quickstart?lang=python) - Podstawy integracji.
*   [Prompt Engineering Guide](https://www.promptingguide.ai/) - Techniki tworzenia skutecznych promptów.
*   [Handling JSON from LLMs](https://ai.google.dev/gemini-api/docs/structured-output) - Kluczowe dla uzyskania poprawnego formatu planu.
*   [Circuit Breaker Pattern](https://microservices.io/patterns/reliability/circuit-breaker.html) - Jak radzić sobie z awariami zewnętrznego API.

## 📐 Standardy Implementacji
1.  **Struktura Promptów:** Prompty powinny być przechowywane jako templejty (np. f-strings lub pliki zewnętrzne), a nie zakodowane "na sztywno" w logice.
2.  **Walidacja JSON:** Odpowiedź z Gemini musi być parsowana i walidowana przez schemat Pydantic przed zwróceniem jej do frontendu.
3.  **Error Handling:** Obsługuj przypadki przekroczenia limitów (Rate Limiting) oraz błędy sieciowe przy połączeniu z Google API.
