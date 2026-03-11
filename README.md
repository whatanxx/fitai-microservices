# 💪 FitAI – Planer treningowy z AI-coachem

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=github-actions)

FitAI to aplikacja mikroserwisowa umożliwiająca personalizowane planowanie treningów przy wsparciu sztucznej inteligencji. Użytkownik może rejestrować się, tworzyć plany ćwiczeń oraz korzystać z AI-coacha opartego na Gemini API, który automatycznie generuje dopasowane plany treningowe. Projekt realizowany w ramach przedmiotu "Budowa i administracja aplikacji w Chmurze".

---

## 🎯 Cel projektu

- Rejestracja i logowanie użytkowników z autoryzacją JWT
- Tworzenie, edytowanie i przeglądanie planów treningowych (CRUD)
- Generowanie spersonalizowanych planów przez AI-coacha (Gemini API)
- Nowoczesny interfejs React
- Deploy na AWS/GCP z CI/CD przez GitHub Actions

---

## 🏗️ Architektura

Projekt oparty jest na architekturze mikroserwisowej z czterema głównymi komponentami:

| Serwis | Port | Opis |
|---|---|---|
| **User Service** | 8001 | Rejestracja, logowanie, zarządzanie użytkownikami, JWT auth |
| **Workout Service** | 8002 | CRUD planów treningowych i ćwiczeń |
| **AI Coach Service** | 8003 | Generowanie planów treningowych przez Gemini API |
| **Frontend** | 3000 | React – interfejs użytkownika |
| **PostgreSQL** | 5432 | Baza danych dla wszystkich serwisów backendowych |

Szczegółowy diagram i opis architektury: [`docs/ARCHITEKTURA.md`](docs/ARCHITEKTURA.md)

---

## 🛠️ Stack technologiczny

| Technologia | Zastosowanie |
|---|---|
| Python 3.11 + FastAPI | Backend mikroserwisów |
| React 18 | Frontend |
| PostgreSQL 15 | Baza danych |
| Docker + Docker Compose | Konteneryzacja i lokalne środowisko |
| GitHub Actions | CI/CD |
| Google Gemini API (gemini) | Generowanie planów treningowych |
| JWT (python-jose) | Autoryzacja użytkowników |
| SQLAlchemy + Alembic | ORM i migracje bazy danych |
| AWS / GCP | Deploy produkcyjny |

---

## 👥 Zespół i podział ról

| Osoba | Rola | Zakres |
|---|---|---|
| [`@whatanxx`](https://github.com/whatanxx) | Lead / DevOps | CI/CD, deploy, architektura, code review |
| [`@rejmon1`](https://github.com/rejmon1) | Backend | User Service + Workout Service |
| [`@RakosIX`](https://github.com/RakosIX) | Backend / Tester | AI Coach Service + integracja Gemini |
| [`@dawbie`](https://github.com/dawbie) | Frontend | React SPA + UI/UX |

---

## 📅 Harmonogram

Szczegółowy harmonogram projektu: [`HARMONOGRAM.md`](HARMONOGRAM.md)

---

## 🚀 Uruchamianie lokalne

### Wymagania

- Docker + Docker Compose
- Klucz Gemini API

### Kroki

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/whatanxx/fitai-microservices.git
cd fitai-microservices

# 2. Skopiuj plik konfiguracyjny i uzupełnij klucz Gemini API
cp .env.example .env
# Edytuj .env i wpisz swój GEMINI_API_KEY

# 3. Uruchom wszystkie serwisy
docker-compose up --build

# 4. Serwisy dostępne pod adresami:
#   Frontend:          http://localhost:3000
#   User Service:      http://localhost:8001/docs
#   Workout Service:   http://localhost:8002/docs
#   AI Coach Service:  http://localhost:8003/docs
```

---

## 🤖 Narzędzia AI

W projekcie aktywnie korzystamy z narzędzi AI:

- **GitHub Copilot** – wygenerowanie README, utworzenie struktury projektu
- **Gemini CLI/Antigravity** – generowanie szkieletów serwisów i komponentów
- **Google Gemini API** – rdzeń funkcjonalności AI Coach Service (generowanie planów)
- **Gemini Web** - wykorzystywanie w przeglądarce do burzy mozgów, generowania instrukcji deploymentu (łatwiej udostępnić)
Szczegółowe zasady pracy z AI: [`docs/AI_TOOLS.md`](docs/AI_TOOLS.md)

---

## 📄 Licencja

[MIT](LICENSE)
