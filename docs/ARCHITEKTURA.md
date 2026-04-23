# Architektura FitAI

## Diagram przeplywu (ASCII)

```
                               REST API
                        +-------------------+
                        |  React SPA Front  |
                        +---------+---------+
                                  |
            +---------------------+----------------------+
            |                                            |
        REST API                                     REST API
            |                                            |
+-----------v-----------+                    +-----------v-----------+
|    User Service       |                    |   AI Coach Service    |
|       (port 8001)     |                    |      (port 8003)      |
+-----------+-----------+                    +-----------+-----------+
            |                                            |
            | REST API (internal)                        | request/response
            |                                            |
+-----------v-----------+                    +-----------v-----------+
| Workout Plan Service  |                    | LLM Provider          |
|      (port 8002)      |                    | (Gemini / OpenAI)     |
+-----------+-----------+                    +-----------------------+
            |
            | read/write
            |
+-----------v-----------+
|     PostgreSQL DB     |
+-----------------------+
```

---

## Komponenty systemu

### Frontend (React SPA)
- Odpowiedzialnosc: interfejs uzytkownika oraz wywolywanie endpointow backendowych.
- Komunikacja: REST API do Profile Service, Workout Plan Service i AI Coach Service.

### Profile Service (port 8001)
- Odpowiedzialność: przechowywanie i aktualizacja profilu użytkownika. Obsługuje także rejestrację i logowanie (generuje tokeny JWT).
- Udostępnia dane potrzebne AI do wygenerowania planu przez wewnętrzny endpoint `/profiles/{user_id}`.

### Workout Plan Service (port 8002)
- Odpowiedzialnosc: zapis i odczyt planow treningowych, dni i cwiczen.
- Obsluguje oznaczanie dni treningowych jako ukonczone.

### AI Coach Service (port 8003)
- Odpowiedzialnosc: orkiestracja procesu generowania planu.
- Pobiera dane profilu, wywoluje model LLM, normalizuje JSON i zapisuje plan przez Workout Plan Service.

### PostgreSQL (port 5432)
- Odpowiedzialnosc: trwale przechowywanie danych profilowych i planow treningowych.

### Adminer (port 8080)
- Narzedzie do zarzadzania baza danych PostgreSQL w srodowisku deweloperskim.

### Zewnetrzny dostawca LLM
- Domyślny dostawca: **Google Gemini** (AI Studio przez `GEMINI_API_KEY` lub Vertex AI przez `GCP_PROJECT`).
- Opcjonalny dostawca: **OpenAI** (`gpt-4o-mini`) aktywowany przez `OPENAI_API_KEY` i ustawienie `preferred_ai_provider=openai` w profilu użytkownika.

---

## Komunikacja

### Frontend -> Backend
- Frontend komunikuje sie z mikroserwisami za pomoca biblioteki **Axios**.
- W srodowisku deweloperskim (Docker) wykorzystywane jest **proxy** skonfigurowane w Vite (`vite.config.js`), ktore przekierowuje zapytania `/api` do odpowiednich serwisow (np. `user-service`).

---

## Kontrakty API

### User Service (Profile Service)

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/health` | Status serwisu (`{"status": "works"}`). |
| POST | `/api/users/register` | Rejestracja nowego użytkownika. Zwraca dane użytkownika (201). |
| POST | `/api/users/login` | Logowanie – zwraca token JWT (`access_token`). |
| GET | `/api/users/me` | Dane zalogowanego użytkownika (wymaga tokenu Bearer). |
| POST | `/api/users/{user_id}/profile` | Tworzy profil użytkownika (201). |
| GET | `/api/users/{user_id}/profile` | Pobiera profil użytkownika. |
| PUT | `/api/users/{user_id}/profile` | Aktualizuje profil użytkownika. |
| GET | `/profiles/{user_id}` | Wewnętrzny endpoint dla serwisów (service-to-service). |

### Workout Plan Service

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/health` | Status serwisu (`{"status": "works"}`). |
| POST | `/api/workouts/plans` | Tworzy nowy plan treningowy (201). |
| GET | `/api/workouts/plans/user/{user_id}` | Zwraca listę planów użytkownika. |
| GET | `/api/workouts/plans/public` | Zwraca listę opublikowanych planów. |
| GET | `/api/workouts/plans/{plan_id}` | Zwraca pełny plan z dniami i ćwiczeniami. |
| PUT | `/api/workouts/plans/{plan_id}` | Zamienia całą zawartość planu. |
| PATCH | `/api/workouts/plans/{plan_id}?title=` | Aktualizuje tytuł planu. |
| PATCH | `/api/workouts/plans/{plan_id}/activate` | Aktywuje plan (dezaktywuje pozostałe). |
| PATCH | `/api/workouts/plans/{plan_id}/publish` | Publikuje plan (`is_published=true`). |
| DELETE | `/api/workouts/plans/{plan_id}` | Usuwa plan (204). |
| POST | `/api/workouts/plans/{plan_id}/clone/{user_id}` | Klonuje plan dla innego użytkownika. |
| PATCH | `/api/workouts/days/{day_id}/complete` | Ustawia `is_completed=true` dla dnia. |
| PATCH | `/api/workouts/exercises/{exercise_id}/complete-set` | Zwiększa `completed_sets` o 1. |

### AI Coach Service

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/health` | Status serwisu (`{"status": "works"}`). |
| POST | `/api/ai/generate/{user_id}` | Pobiera profil, generuje plan przez LLM i zapisuje go w Workout Service. |
| POST | `/api/ai/refine/{plan_id}` | Modyfikuje istniejący plan na podstawie opisu użytkownika. |
| POST | `/api/ai/explain` | Zwraca krótkie wyjaśnienie jak wykonać dane ćwiczenie. |

---

## Model danych

### Tabela `users`
- `id` INT PK
- `email` VARCHAR(255) UNIQUE
- `hashed_password` VARCHAR(255)
- `is_active` BOOLEAN
- `created_at` TIMESTAMP

### Tabela `user_profiles`
- `id` INT PK
- `user_id` INT FK -> users.id (CASCADE DELETE)
- `first_name` VARCHAR(100)
- `nickname` VARCHAR(100)
- `age` INT
- `gender` VARCHAR(10)
- `height_cm` INT
- `current_weight_kg` FLOAT
- `medical_conditions` TEXT
- `fitness_goal` VARCHAR(45)
- `training_time_minutes` INT
- `training_days_per_week` INT
- `experience_level` VARCHAR(20)
- `available_equipment` JSON
- `preferred_ai_provider` VARCHAR(20) DEFAULT 'google'
- `weight_history` JSON
- `updated_at` TIMESTAMP

### Tabela `workout_plans`
- `id` INT PK
- `user_id` INT (cross-service reference, brak FK)
- `title` VARCHAR(100)
- `duration_weeks` INT
- `is_active` BOOLEAN
- `is_published` BOOLEAN
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### Tabela `workout_days`
- `id` INT PK
- `plan_id` INT FK -> workout_plans.id
- `week_number` INT
- `day_number` INT
- `is_rest_day` BOOLEAN
- `target_muscle_group` VARCHAR(100)
- `is_completed` BOOLEAN

### Tabela `exercises`
- `id` INT PK
- `day_id` INT FK -> workout_days.id
- `name` VARCHAR(200)
- `sets` INT
- `completed_sets` INT DEFAULT 0
- `reps` VARCHAR(100)
- `rest_time_seconds` INT

---

## Strategia auth (JWT)

Autentykacja jest w pełni zaimplementowana w **User Service**.

- **User Service**: Odpowiada za rejestrację (`POST /api/users/register`), logowanie (`POST /api/users/login`) i walidację tokenu (`GET /api/users/me`).
- **Haszowanie**: Hasła są przechowywane w postaci zhaszowanej przy użyciu biblioteki `bcrypt`.
- **Token JWT**: Podpisywany `JWT_SECRET`, domyślny czas ważności 30 minut (konfigurowalny przez `JWT_EXPIRE_MINUTES`).
- **Serwisy domenowe** (`workout-plan`, `ai-coach`): Nie walidują JWT samodzielnie. W docelowej architekturze weryfikacja odbywa się na brzegu systemu (API Gateway/Nginx), a do serwisów trafia już zweryfikowany `user_id`.
