# Architektura FitAI

## Diagram przepływu (ASCII)

```
                        ┌─────────────┐
                        │   Frontend  │
                        │  React SPA  │
                        │  :3000      │
                        └──────┬──────┘
                               │ HTTP
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼──────┐ ┌───────▼───────┐ ┌─────▼───────────┐
     │  User Service │ │Workout Service│ │AI Coach Service │
     │  FastAPI      │ │  FastAPI      │ │  FastAPI        │
     │  :8001        │ │  :8002        │ │  :8003          │
     └───────┬───────┘ └───────┬───────┘ └────────┬────────┘
             │                 │                   │
             └─────────────────┼───────────────────┘
                               │ SQL
                     ┌─────────▼─────────┐
                     │    PostgreSQL      │
                     │    :5432           │
                     └───────────────────┘
                                               ┌──────────────┐
                                    OpenAI API │  GPT-4o-mini │
                          ┌────────────────────►  External    │
                          │                    └──────────────┘
                ┌─────────┴────────┐
                │ AI Coach Service │
                └──────────────────┘
```

---

## Opis mikroserwisów

### User Service (port 8001)
- **Technologia:** Python 3.11 + FastAPI + SQLAlchemy
- **Odpowiedzialność:** Rejestracja i logowanie użytkowników, zarządzanie profilami, wystawianie tokenów JWT
- **Baza danych:** Tabela `users`

### Workout Service (port 8002)
- **Technologia:** Python 3.11 + FastAPI + SQLAlchemy
- **Odpowiedzialność:** CRUD planów treningowych i ćwiczeń, zarządzanie logami aktywności
- **Baza danych:** Tabele `workout_plans`, `exercises`, `workout_logs`

### AI Coach Service (port 8003)
- **Technologia:** Python 3.11 + FastAPI + OpenAI SDK
- **Odpowiedzialność:** Generowanie spersonalizowanych planów treningowych przez OpenAI API, obsługa promptów
- **Zewnętrzne API:** OpenAI GPT-4o-mini

### Frontend (port 3000)
- **Technologia:** React 18 + Vite
- **Odpowiedzialność:** Interfejs użytkownika (SPA), komunikacja z mikroserwisami przez REST API

### PostgreSQL (port 5432)
- **Technologia:** PostgreSQL 15
- **Odpowiedzialność:** Trwałe przechowywanie danych dla wszystkich serwisów backendowych

---

## Planowane endpointy REST (draft)

### User Service (`/api/v1`)

| Metoda | Endpoint | Opis |
|---|---|---|
| POST | `/auth/register` | Rejestracja nowego użytkownika |
| POST | `/auth/login` | Logowanie, zwraca JWT |
| GET | `/users/me` | Dane zalogowanego użytkownika |
| PUT | `/users/me` | Aktualizacja profilu |

### Workout Service (`/api/v1`)

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/plans` | Lista planów treningowych użytkownika |
| POST | `/plans` | Utwórz nowy plan |
| GET | `/plans/{id}` | Pobierz szczegóły planu |
| PUT | `/plans/{id}` | Aktualizuj plan |
| DELETE | `/plans/{id}` | Usuń plan |
| GET | `/exercises` | Lista ćwiczeń |
| POST | `/exercises` | Dodaj ćwiczenie |
| POST | `/logs` | Zapisz log aktywności |
| GET | `/logs` | Historia aktywności |

### AI Coach Service (`/api/v1`)

| Metoda | Endpoint | Opis |
|---|---|---|
| POST | `/coach/suggest` | Generuj plan treningowy przez AI |
| GET | `/coach/history` | Historia wygenerowanych planów |

---

## Modele danych

### User
```json
{
  "id": "uuid",
  "email": "string (unique)",
  "username": "string",
  "hashed_password": "string",
  "age": "integer (optional)",
  "weight_kg": "float (optional)",
  "height_cm": "float (optional)",
  "fitness_level": "enum: beginner | intermediate | advanced",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### WorkoutPlan
```json
{
  "id": "uuid",
  "user_id": "uuid (FK -> users.id)",
  "name": "string",
  "description": "string",
  "duration_weeks": "integer",
  "frequency_per_week": "integer",
  "goal": "enum: weight_loss | muscle_gain | endurance | flexibility",
  "is_ai_generated": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Exercise
```json
{
  "id": "uuid",
  "plan_id": "uuid (FK -> workout_plans.id)",
  "name": "string",
  "sets": "integer",
  "reps": "integer",
  "duration_seconds": "integer (optional)",
  "muscle_group": "string",
  "order": "integer"
}
```

### WorkoutLog
```json
{
  "id": "uuid",
  "user_id": "uuid (FK -> users.id)",
  "plan_id": "uuid (FK -> workout_plans.id)",
  "completed_at": "datetime",
  "notes": "string (optional)",
  "duration_minutes": "integer"
}
```
