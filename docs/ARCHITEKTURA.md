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
|    Profile Service    |                    |   AI Coach Service    |
|       (port 8001)     |                    |      (port 8003)      |
+-----------+-----------+                    +-----------+-----------+
            |                                            |
            | REST API                                   | request/response
            |                                            |
+-----------v-----------+                    +-----------v-----------+
| Workout Plan Service  |                    |      OpenAI API       |
|      (port 8002)      |                    +-----------------------+
+-----------+-----------+
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
- Odpowiedzialnosc: przechowywanie i aktualizacja profilu uzytkownika.
- Udostepnia dane potrzebne AI do wygenerowania planu.

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
- Aktualny diagram zaklada integracje z OpenAI API.

---

## Komunikacja

### Frontend -> Backend
- Frontend komunikuje sie z mikroserwisami za pomoca biblioteki **Axios**.
- W srodowisku deweloperskim (Docker) wykorzystywane jest **proxy** skonfigurowane w Vite (`vite.config.js`), ktore przekierowuje zapytania `/api` do odpowiednich serwisow (np. `user-service`).

---

## Kontrakty API

### Profile Service

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/health` | Status serwisu (`{"status": "works"}`). |
| POST | `/profiles` | Tworzy nowy profil uzytkownika. |
| GET | `/profiles/{user_id}` | Pobiera profil konkretnego uzytkownika. |
| PUT | `/profiles/{user_id}` | Aktualizuje profil uzytkownika. |

### Workout Plan Service

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/health` | Status serwisu (`{"status": "works"}`). |
| POST | `/plans` | Tworzy nowy plan (po wygenerowaniu przez AI). |
| GET | `/plans/user/{user_id}` | Zwraca liste planow uzytkownika (widok listy). |
| GET | `/plans/{plan_id}` | Zwraca pelny plan z tygodniami, dniami i cwiczeniami. |
| PATCH | `/days/{day_id}/complete` | Ustawia `is_completed = true` dla dnia treningowego. |

### AI Coach Service

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/health` | Status serwisu (`{"status": "works"}`). |
| POST | `/generate/{user_id}` | Glowne wywolanie procesu: profil -> LLM -> zapis planu. |

---

## Model danych

### Tabela `UserProfiles`
- `id` INT PK
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

### Tabela `WorkoutPlans`
- `id` INT PK
- `user_id` INT FK -> UserProfiles.id
- `title` VARCHAR(100)
- `duration_weeks` INT
- `created_at` TIMESTAMP

### Tabela `WorkoutDays`
- `id` INT PK
- `plan_id` INT FK -> WorkoutPlans.id
- `week_number` INT
- `day_number` INT
- `is_rest_day` BOOLEAN
- `target_muscle_group` VARCHAR(50)
- `is_completed` BOOLEAN

### Tabela `Exercises`
- `id` INT PK
- `day_id` INT FK -> WorkoutDays.id
- `name` VARCHAR(100)
- `sets` INT
- `reps` VARCHAR(10)
- `rest_time_seconds` INT

---

## Strategia auth (JWT)

System implementuje autentykacje oparta o tokeny JWT (JSON Web Tokens).

- **User Service**: Odpowiada za rejestracje, logowanie oraz generowanie tokenow JWT.
- **Haszowanie**: Hasla sa przechowywane w postaci zhaszowanej przy uzyciu biblioteki `bcrypt`.
- **Walidacja**: Inne serwisy moga weryfikowac tokeny JWT w celu autoryzacji uzytkownika.
