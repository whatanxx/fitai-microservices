# AI Coach Service

> **Coming in Week 3** – AI Coach Service – generowanie planów treningowych przez OpenAI API

Serwis odpowiedzialny za integrację z OpenAI i generowanie spersonalizowanych planów treningowych.

## Planowana funkcjonalność

- Endpoint `POST /coach/suggest` – generowanie planu treningowego na podstawie danych użytkownika
- Historia wygenerowanych planów
- Prompt engineering dla modelu GPT-4o-mini

## Stack

- Python 3.11 + FastAPI
- OpenAI Python SDK
- Model: GPT-4o-mini

## Port

`8003`
