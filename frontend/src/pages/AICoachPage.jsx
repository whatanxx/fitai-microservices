import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AICoachPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
        <h1>Twój AI-Coach</h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          Zaloguj się, aby AI mogło przeanalizować Twoje statystyki i wygenerować spersonalizowany plan treningowy.
        </p>
        <Link to="/login">
          <button style={{ padding: '1rem 2.5rem' }}>Zaloguj się teraz</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page ai-coach-page">
      <h1>AI-Coach</h1>
      <p style={{ marginBottom: '2rem' }}>Dostosuj parametry swojego nowego planu.</p>
      <form>
        <label>Cel treningowy</label>
        <input type="text" placeholder="np. Budowa masy, Redukcja" />
        <label>Liczba dni w tygodniu</label>
        <input type="number" placeholder="np. 3" min="1" max="7" />
        <button type="submit" style={{ marginTop: '1rem' }}>
          Wygeneruj plan dla {user.weight}kg
        </button>
      </form>
    </div>
  );
};

export default AICoachPage;
