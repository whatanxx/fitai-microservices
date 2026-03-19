# Profile Service (User Service)

Serwis odpowiedzialny za profil użytkownika i dane wejściowe do generowania planu treningowego.

## Zakres odpowiedzialności

- tworzenie i aktualizacja profilu użytkownika,
- udostępnianie danych profilu dla AI Coach Service,
- health-check serwisu.

## Endpointy API

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/health` | Zwraca status serwisu (`{"status": "works"}`). |
| POST | `/profiles` | Tworzy nowy profil użytkownika. |
| GET | `/profiles/{user_id}` | Pobiera profil konkretnego użytkownika (używany m.in. do promptu AI). |
| PUT | `/profiles/{user_id}` | Aktualizuje profil użytkownika. |

## Model danych profilu

Przykładowe pola profilu (zgodnie z architekturą):

- `id` (INT, PK)
- `age` (INT)
- `gender` (VARCHAR(10))
- `height_cm` (INT)
- `current_weight_kg` (FLOAT)
- `medical_conditions` (TEXT)
- `fitness_goal` (VARCHAR(45))
- `training_time_minutes` (INT)
- `training_days_per_week` (INT)
- `experience_level` (VARCHAR(20))
- `available_equipment` (JSON)

## Stack

- Python 3.11 + FastAPI
- PostgreSQL (SQLAlchemy + Alembic)

## Port

`8001`
