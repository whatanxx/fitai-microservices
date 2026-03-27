import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HistoryPage = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`/api/workouts/plans/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania planów.');
      }
      const data = await response.json();
      setPlans(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const handleDelete = async (e, planId) => {
    e.preventDefault();
    if (!window.confirm('Czy na pewno chcesz usunąć ten plan?')) return;

    try {
      const response = await fetch(`/api/workouts/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Błąd podczas usuwania planu.');
      setPlans(plans.filter(p => p.id !== planId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleActivate = async (e, planId) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/workouts/plans/${planId}/activate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Błąd podczas aktywacji planu.');
      fetchPlans(); // Odśwież listę, aby pokazać który jest aktywny
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
        <h1>Moje Plany</h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          Zaloguj się, aby zarządzać swoimi planami treningowymi.
        </p>
        <Link to="/login">
          <button style={{ padding: '1rem 2.5rem' }}>Zaloguj się teraz</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page history-page">
      <h1>Moje Plany Treningowe</h1>
      <p style={{ marginBottom: '2rem' }}>Zarządzaj swoimi planami i wybierz ten, który chcesz obecnie realizować.</p>
      
      {loading ? (
        <p>Wczytywanie...</p>
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
        <div style={{ width: '100%', textAlign: 'left', display: 'grid', gap: '1.2rem' }}>
          {plans.map((plan) => (
            <Link 
              key={plan.id} 
              to={`/history/${plan.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div 
                style={{ 
                  padding: '1.5rem', 
                  background: '#fff', 
                  borderRadius: '16px', 
                  boxShadow: plan.is_active ? '0 0 0 2px #f97316, 0 4px 6px -1px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {plan.is_active && (
                    <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        background: '#f97316', 
                        color: '#fff', 
                        fontSize: '0.65rem', 
                        fontWeight: 'bold', 
                        padding: '2px 8px',
                        borderBottomRightRadius: '8px'
                    }}>
                        AKTYWNY
                    </div>
                )}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h3 style={{ margin: 0, color: '#1e293b' }}>{plan.title}</h3>
                  <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem', textAlign: 'left' }}>
                    Utworzono: {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {!plan.is_active && (
                    <button 
                        onClick={(e) => handleActivate(e, plan.id)}
                        style={{ 
                            background: '#fff', 
                            color: '#f97316', 
                            padding: '0.5rem 0.8rem', 
                            borderRadius: '10px',
                            border: '1px solid #f97316',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Aktywuj
                    </button>
                  )}
                  <button 
                    onClick={(e) => handleDelete(e, plan.id)}
                    style={{ 
                      background: '#fee2e2', 
                      color: '#ef4444', 
                      padding: '0.5rem', 
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="Usuń plan"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
