import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AICoachPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState('3');

  if (!user) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
        <h1>Twój AI-Coach</h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          Zaloguj się, aby AI mogło przeanalizować Twoje statystyki i wygenerować spersonalizowany plan treningowy.
        </p>
        <button onClick={() => navigate('/login')} style={{ padding: '1rem 2.5rem' }}>
          Zaloguj się teraz
        </button>
      </div>
    );
  }

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Wysłanie prośby do AI Coach Service (port 8003) przez proxy Vite
      const response = await fetch(`/api/ai/generate/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          goal: goal,
          days_per_week: parseInt(days)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Wystąpił błąd podczas generowania planu.');
      }

      const data = await response.json();
      console.log('Plan wygenerowany:', data);
      
      setSuccess(true);
      // Po 2 sekundach przekieruj do historii lub dashboardu
      setTimeout(() => {
        navigate('/history');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentWeight = user.profile?.current_weight_kg || '?';

  return (
    <div className="page ai-coach-page">
      <h1>AI-Coach</h1>
      <p style={{ marginBottom: '2rem' }}>Dostosuj parametry swojego nowego planu.</p>
      
      {success ? (
        <div style={{ padding: '2rem', background: '#dcfce7', color: '#166534', borderRadius: '12px', textAlign: 'center' }}>
          <h3>✅ Sukces!</h3>
          <p>Twój plan został wygenerowany i zapisany. Przekierowuję do historii...</p>
        </div>
      ) : (
        <form onSubmit={handleGenerate}>
          <label>Cel treningowy</label>
          <input 
            type="text" 
            placeholder="np. Budowa masy, Redukcja" 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
          
          <label>Liczba dni w tygodniu</label>
          <input 
            type="number" 
            placeholder="np. 3" 
            min="1" 
            max="7" 
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />

          {error && <p style={{ color: '#dc2626', marginTop: '1rem' }}>{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '1rem', background: loading ? '#94a3b8' : '#f97316' }}
          >
            {loading ? '🤖 Generowanie (może potrwać chwilę)...' : `Wygeneruj plan dla ${currentWeight}kg`}
          </button>
        </form>
      )}
    </div>
  );
};

export default AICoachPage;
