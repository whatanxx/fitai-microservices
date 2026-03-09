# Narzędzia AI w projekcie FitAI

## Przegląd

W projekcie FitAI aktywnie korzystamy z narzędzi AI na każdym etapie pracy – od generowania boilerplate kodu, przez tworzenie testów, aż po rdzeń funkcjonalności aplikacji (AI Coach Service). Dokumentujemy tutaj sposób wykorzystania każdego narzędzia oraz zasady "Vibe Coding" przyjęte przez zespół.

---

## GitHub Copilot

### Konfiguracja
- Rozszerzenie dostępne w VS Code i JetBrains IDE
- Włączone dla wszystkich członków zespołu posiadających licencję (lub GitHub Education)
- Repozytorium dołączone do organizacji z włączonym Copilotem

### Zastosowanie w projekcie
- Autouzupełnianie kodu podczas implementacji endpointów FastAPI
- Generowanie docstringów i komentarzy
- Podpowiedzi przy pisaniu testów jednostkowych (pytest)
- Generowanie plików konfiguracyjnych (Dockerfile, GitHub Actions workflows)
- Sugestie przy pisaniu zapytań SQLAlchemy

---

## Cursor

### Zastosowanie w projekcie
- Generowanie kompletnych szkieletów serwisów (Tydzień 3) na podstawie opisu wymagań
- Refaktoryzacja kodu z wyjaśnieniem zmian
- Generowanie komponentów React na podstawie opisu UI
- Tworzenie schematów Pydantic na podstawie modeli danych
- Szybkie prototypowanie – opis słowny → działający kod

---

## OpenAI API

### Zastosowanie w AI Coach Service
- Model: `o3-mini` (najnowszy lekki model OpenAI)
- Endpoint: `POST /coach/suggest`
- Działanie: Na podstawie danych użytkownika (wiek, waga, poziom zaawansowania, cel) generuje spersonalizowany plan treningowy
- Format odpowiedzi: JSON z listą ćwiczeń, zestawami i powtórzeniami
- Prompt engineering: system prompt definiujący rolę AI jako coach fitness

### Przykładowy prompt (draft)
```
Jesteś profesjonalnym trenerem personalnym. 
Na podstawie poniższych danych użytkownika wygeneruj tygodniowy plan treningowy w formacie JSON.

Dane użytkownika:
- Wiek: {age}
- Waga: {weight_kg} kg
- Wzrost: {height_cm} cm
- Poziom: {fitness_level}
- Cel: {goal}
- Dostępność: {frequency_per_week} dni w tygodniu

Zwróć plan jako JSON zgodny ze schematem WorkoutPlan.
```

---

## Zasady Vibe Coding

Zasady przyjęte przez zespół FitAI dotyczące pracy z AI:

1. **AI generuje, człowiek weryfikuje** – każdy wygenerowany fragment kodu musi zostać przejrzany przez autora przed commitem
2. **Opisuj, nie dyktuj** – podawaj AI kontekst i cel, nie szczegółowe instrukcje krok po kroku
3. **Małe iteracje** – generuj małe fragmenty i testuj je natychmiast, nie całe moduły naraz
4. **Testy obowiązkowe** – kod wygenerowany przez AI musi mieć testy (można też wygenerować je przez AI, ale po weryfikacji logiki)
5. **Dokumentuj źródło** – w PR zaznaczaj, które fragmenty zostały wygenerowane przez AI
6. **Nie commituj śmieciowego kodu** – jeśli AI wygenerowało coś niezrozumiałego, nie commituj bez zrozumienia

---

## Podział odpowiedzialności: AI vs. Człowiek

| Zadanie | Kto odpowiada |
|---|---|
| Generowanie boilerplate (Dockerfile, configs) | ✅ AI generuje, 👤 człowiek przegląda |
| Szkielety endpointów FastAPI | ✅ AI generuje, 👤 człowiek weryfikuje logikę |
| Schematy Pydantic (modele danych) | ✅ AI generuje, 👤 człowiek sprawdza typy |
| Logika biznesowa (autoryzacja, kalkulacje) | 👤 człowiek pisze, ✅ AI asystuje |
| Testy jednostkowe | ✅ AI generuje, 👤 człowiek weryfikuje pokrycie |
| Prompt engineering (AI Coach) | 👤 człowiek projektuje, ✅ AI iteruje |
| Code review | 👤 człowiek zawsze |
| Deploy i konfiguracja infrastruktury | 👤 człowiek zawsze |
| Dokumentacja API (Swagger) | ✅ AI generuje szkielet, 👤 człowiek uzupełnia |
| Decyzje architektoniczne | 👤 człowiek zawsze |
