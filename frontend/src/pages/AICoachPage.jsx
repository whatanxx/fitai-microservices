import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AICoachPage = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState(user?.goal || '');
  const [days, setDays] = useState(user?.trainingDays || 3);
  const [level, setLevel] = useState(user?.level || 'beginner');
  const [equipment, setEquipment] = useState(user?.equipment || 'gym');
  const [generatedPlan, setGeneratedPlan] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock: plan zostanie wygenerowany przez AI Coach Service
    setGeneratedPlan({
      goal,
      days,
      level,
      equipment,
      weight: user.weight,
      height: user.height,
    });
  };

  return (
    <div className="page ai-coach-page">
      <h1>AI-Coach</h1>
      <p style={{ marginBottom: '2rem' }}>Dostosuj parametry swojego nowego planu.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="ai-goal">Cel treningowy</label>
        <input
          id="ai-goal"
          type="text"
          placeholder="np. Budowa masy, Redukcja"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          required
        />

        <label htmlFor="ai-days">Liczba dni w tygodniu</label>
        <input
          id="ai-days"
          type="number"
          placeholder="np. 3"
          min="1"
          max="7"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          required
        />

        <label htmlFor="ai-level">Stopień zaawansowania</label>
        <select
          id="ai-level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="beginner">Początkujący</option>
          <option value="intermediate">Średnio zaawansowany</option>
          <option value="advanced">Zaawansowany</option>
        </select>

        <label htmlFor="ai-equipment">Dostępny sprzęt</label>
        <select
          id="ai-equipment"
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
        >
          <option value="home">Domowy</option>
          <option value="gym">Siłownia</option>
        </select>

        <button type="submit" style={{ marginTop: '1rem' }}>
          Wygeneruj plan dla {user.weight}kg
        </button>
      </form>

      {generatedPlan && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #fed7aa', width: '100%', textAlign: 'left' }}>
          <h3 style={{ color: '#ea580c', marginBottom: '1rem' }}>🏋️ Wygenerowany plan</h3>
          <p><strong>Cel:</strong> {generatedPlan.goal}</p>
          <p><strong>Dni w tygodniu:</strong> {generatedPlan.days}</p>
          <p><strong>Poziom:</strong> {generatedPlan.level}</p>
          <p><strong>Sprzęt:</strong> {generatedPlan.equipment === 'gym' ? 'Siłownia' : 'Domowy'}</p>
          <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            ℹ️ Integracja z AI Coach Service w toku – plan zostanie wygenerowany przez LLM.
          </p>
        </div>
      )}
    </div>
  );
};

export default AICoachPage;
