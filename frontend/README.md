# Frontend - FitAI

Interfejs użytkownika aplikacji FitAI zbudowany jako Single Page Application w React.

## Aktualny Status Projektu
✅ **Inicjalizacja:** Projekt zainicjowany przy użyciu Vite + React 19.
✅ **Konfiguracja:** Serwer deweloperski skonfigurowany na porcie `3000`.
✅ **Routing:** Skonfigurowano nawigację (React Router) z podziałem na strony.
✅ **Layout:** Wdrożono responsywny, ciemny interfejs (Mobile-first).

## Planowana funkcjonalność (Oryginalne założenia)

- Rejestracja i logowanie użytkowników
- Dashboard z planami treningowymi
- Formularz generowania planu przez AI-coacha
- Historia treningów

## Do zrobienia (Backlog)
1. **Integracja z API:** Połączenie z mikroserwisami (Auth, Workout Service).
2. **Obsługa Stanu:** Wdrożenie Context API lub Redux do zarządzania sesją użytkownika.
3. **Logika AI-Coach:** Implementacja wielokrokowego formularza do zbierania danych o celach treningowych.
4. **Wizualizacja Planów:** Dodanie komponentów do prezentacji wygenerowanych ćwiczeń.
5. **Testy:** Dodanie testów jednostkowych (Vitest) i e2e (Playwright/Cypress).

## Stack Technologiczny

- **React 19** + **Vite**
- **React Router Dom** (Nawigacja)
- **Vanilla CSS** (Stylizacja responsywna)
- Komunikacja z mikroserwisami przez REST API

## Jak uruchomić?

1. Zainstaluj zależności: `npm install`
2. Uruchom serwer: `npm run dev`
3. Aplikacja dostępna pod adresem: `http://localhost:3000`

## Port
`3000`
