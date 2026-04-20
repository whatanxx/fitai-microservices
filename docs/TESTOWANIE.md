# Strategia Testowania Projektu FitAI

Dokument ten opisuje podejście do zapewnienia jakości w mikroserwisach FitAI.

## 1. Narzędzia i Technologie

- **[Pytest](https://docs.pytest.org/)**: Główny framework do uruchamiania testów.
- **[HTTPX](https://www.python-httpx.org/)**: Biblioteka do asynchronicznego testowania API (zastępuje tradycyjne wywołania sieciowe).
- **[Mypy](https://mypy.readthedocs.io/)**: Narzędzie do statycznej analizy typów (wykrywa błędy logiczne przed uruchomieniem kodu).
- **[SQLite (In-Memory)](https://www.sqlite.org/)**: (Planowane) Do szybkich testów integracyjnych z bazą danych bez wpływania na produkcyjne dane.

## 2. Struktura testów

W każdym serwisie (np. `services/user-service/`) znajduje się folder `tests/`:

- `conftest.py`: Wspólna konfiguracja i "fixtures" (np. asynchroniczny klient API).
- `test_*.py`: Pliki z konkretnymi scenariuszami testowymi.

## 3. Rodzaje testów w FitAI

### Testy Jednostkowe (Unit Tests)
Sprawdzają małe kawałki kodu, np. funkcję walidującą wzrost użytkownika.
- Szybkie w wykonaniu.
- Nie wymagają bazy danych ani innych serwisów.

### Testy Integracyjne (Integration Tests)
Sprawdzają, czy poszczególne części serwisu współpracują ze sobą poprawnie (np. czy zapis do bazy danych przez API działa).
- Używamy `httpx` do wywoływania endpointów.

### Statyczna analiza (Mypy)
To proces "sprawdzania kodu bez jego uruchamiania". Mypy weryfikuje, czy typy danych (np. `str`, `int`) zgadzają się w całym programie.

## 4. Jak uruchomić testy i analizę?

Z poziomu folderu konkretnego serwisu (np. `services/user-service`):

**Uruchomienie testów:**
```bash
pytest
```

**Sprawdzenie typów (Mypy):**
```bash
mypy .
```

**Uruchomienie testów z raportem pokrycia (Coverage):**
```bash
pytest --cov=app tests/
```

## 5. Dobre praktyki dla zespołu

1. **Testuj błędy:** Nie sprawdzaj tylko czy "działa", ale też czy aplikacja poprawnie reaguje na błędne dane (np. ujemna waga użytkownika).
2. **Używaj Type Hinting:** Zawsze definiuj typy argumentów i zwracanych wartości funkcji – dzięki temu Mypy nam pomoże.
3. **Mokowanie:** Jeśli serwis łączy się z zewnętrznym API (np. OpenAI), używamy "atrap" (mocków), aby testy były darmowe i niezależne od internetu.
