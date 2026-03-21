import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HistoryPage = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchPlans = async () => {
        try {
          // Pobieranie planów z Workout Service (port 8002)
          // Dla celów demo używamy user_id = 1
          const response = await fetch('http://localhost:8002/plans/user/1');
          if (!response.ok) {
            throw new Error('Błąd podczas pobierania historii planów.');
          }
          const data = await response.json();
          setPlans(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchPlans();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
        <h1>Twoja Historia</h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          Zaloguj się, aby mieć dostęp do pełnego archiwum swoich dotychczasowych treningów.
        </p>
        <Link to="/login">
          <button style={{ padding: '1rem 2.5rem' }}>Zaloguj się teraz</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page history-page">
      <h1>Historia Twoich Planów</h1>
      <p style={{ marginBottom: '2rem' }}>Lista planów wygenerowanych przez Twojego AI-Coacha.</p>
      
      {loading ? (
        <p>Wczytywanie historii...</p>
      ) : error ? (
        <p style={{ color: '#dc2626' }}>{error}</p>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Nie masz jeszcze żadnych planów.</p>
          <Link to="/ai-coach">
            <button style={{ marginTop: '1rem' }}>Stwórz pierwszy plan</button>
          </Link>
        </div>
      ) : (
        <div style={{ width: '100%', textAlign: 'left', display: 'grid', gap: '1rem' }}>
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              style={{ 
                padding: '1.5rem', 
                background: '#fff', 
                borderRadius: '12px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: '#1e293b' }}>{plan.title}</h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                  Utworzono: {new Date(plan.created_at).toLocaleDateString()}
                </p>
              </div>
              <span style={{ 
                background: '#fef3c7', 
                color: '#92400e', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '20px', 
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                {plan.duration_weeks} tyg.
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
