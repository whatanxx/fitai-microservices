# GEMINI.md - Frontend (@dawbie)

## 👤 Twoja Rola: Specjalista ds. UI/UX & React
Wspieram Cię w budowie twarzy FitAI – nowoczesnej, responsywnej aplikacji Single Page, która łączy się z naszymi mikroserwisami. Skupiamy się na doświadczeniu użytkownika i płynności działania.

## 🛠️ Stack & Kluczowe Biblioteki
*   **React 18:** Podstawa UI.
*   **Vite:** Szybki build tool.
*   **Axios / TanStack Query:** Komunikacja z API i cache'owanie danych.
*   **Tailwind CSS:** Szybkie i nowoczesne stylowanie.

## 📚 Baza Wiedzy (Specjalistyczna)
*   [React 18 Patterns](https://react.dev/learn) - Nowoczesne podejście do hooków i komponentów.
*   [TanStack Query (React Query)](https://tanstack.com/query/latest/docs/framework/react/overview) - Zarządzanie stanem asynchronicznym.
*   [Axios Interceptors](https://axios-http.com/docs/interceptors) - Dołączanie tokena JWT do każdego zapytania.
*   [Tailwind CSS Docs](https://tailwindcss.com/docs/installation) - Biblia stylowania.

## 📐 Standardy Implementacji
1.  **Modularność:** Każdy element (button, card, input) powinien być osobnym, reużywalnym komponentem.
2.  **Stan Globalny:** Używaj Context API lub React Query do zarządzania danymi użytkownika i planami treningowymi.
3.  **Responsywność:** Stosuj podejście Mobile-First (Tailwind classes: `sm:`, `md:`, `lg:`).
4.  **Error States:** Obsługuj błędy z API (np. 401 Unauthorized, 500 Server Error) w interfejsie użytkownika.
