import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AICoachPage = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    setSuccess(false);

    try {
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
        if (response.status === 403) {
            addNotification('Osiągnięto limit 5 planów. Usuń stary plan przed wygenerowaniem nowego.', 'error');
            setLoading(false);
            return;
        }
        throw new Error(errorData.detail || 'Wystąpił błąd podczas generowania planu.');
      }

      const data = await response.json();
      setSuccess(true);
      addNotification('Plan treningowy wygenerowany pomyślnie! 🚀', 'success');
      
      setTimeout(() => {
        navigate(`/history/${data.id}`);
      }, 1500);

    } catch (err) {
      addNotification(err.message, 'error');
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
