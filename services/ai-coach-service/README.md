# AI Coach Service

Serwis koordynujący proces generowania planu treningowego na podstawie profilu użytkownika.

## Zakres odpowiedzialności

- pobranie danych użytkownika z Profile Service,
- wygenerowanie planu przez model LLM,
- zapis gotowego planu przez Workout Plan Service,
- health-check serwisu.

## Endpointy API

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/health` | Zwraca status serwisu (`{"status": "works"}`). |
| POST | `/generate/{user_id}` | Główny wyzwalacz procesu: pobiera profil, generuje plan i zapisuje go w Workout Plan Service. |

## Przepływ integracji

1. AI Coach pobiera profil użytkownika z Profile Service.
2. AI Coach wysyła request do dostawcy LLM (wg architektury: OpenAI API).
3. AI Coach normalizuje odpowiedź do oczekiwanego JSON.
4. AI Coach zapisuje plan przez endpoint `POST /plans` w Workout Plan Service.

## Stack

- Python 3.11 + FastAPI
- Integracja z API modelu LLM (np. OpenAI)
- Pydantic (walidacja danych wejścia/wyjścia)

## Port

`8003`
