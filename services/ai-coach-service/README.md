# AI Coach Service

> **Coming in Week 3** – AI Coach Service – generowanie planów treningowych przez Gemini API

Serwis odpowiedzialny za integrację z Gemini i generowanie spersonalizowanych planów treningowych.

## Planowana funkcjonalność

- Endpoint `POST /coach/suggest` – generowanie planu treningowego na podstawie danych użytkownika
- Historia wygenerowanych planów
- Prompt engineering dla modelu gemini-2.0-flash

## Stack

- Python 3.11 + FastAPI
- Google Generative AI Python SDK
- Model: gemini-2.0-flash

## Port

`8003`
