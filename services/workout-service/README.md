# Workout Plan Service

Serwis odpowiedzialny za trwały zapis i odczyt planów treningowych, tygodni, dni i ćwiczeń.

## Zakres odpowiedzialności

- zapis wygenerowanego planu treningowego,
- listowanie planów użytkownika,
- zwracanie pełnych szczegółów planu pod frontend,
- oznaczanie dni treningowych jako ukończone.

## Endpointy API

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/health` | Zwraca status serwisu (`{"status": "works"}`). |
| POST | `/plans` | Tworzy nowy plan (wywoływany po wygenerowaniu JSON przez AI). |
| GET | `/plans/user/{user_id}` | Zwraca listę planów danego użytkownika (widok listy). |
| GET | `/plans/{plan_id}` | Zwraca pełny plan: tygodnie, dni i ćwiczenia. |
| PATCH | `/days/{day_id}/complete` | Ustawia `is_completed = true` dla dnia treningowego. |

## Model danych

### `WorkoutPlans`

- `id` (INT, PK)
- `user_id` (INT, FK -> UserProfiles.id)
- `title` (VARCHAR(100))
- `duration_weeks` (INT)
- `created_at` (TIMESTAMP)

### `WorkoutDays`

- `id` (INT, PK)
- `plan_id` (INT, FK -> WorkoutPlans.id)
- `week_number` (INT)
- `day_number` (INT)
- `is_rest_day` (BOOLEAN)
- `target_muscle_group` (VARCHAR(50))
- `is_completed` (BOOLEAN)

### `Exercises`

- `id` (INT, PK)
- `day_id` (INT, FK -> WorkoutDays.id)
- `name` (VARCHAR(100))
- `sets` (INT)
- `reps` (VARCHAR(10))
- `rest_time_seconds` (INT)

## Stack

- Python 3.11 + FastAPI
- PostgreSQL (SQLAlchemy + Alembic)

## Port

`8002`
