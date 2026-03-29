import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const SocialWallPage = () => {
  const [publicPlans, setPublicPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authors, setAuthors] = useState({});
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const fetchAuthor = async (userId) => {
    if (authors[userId]) return;
    try {
      const response = await fetch(`/api/users/${userId}/profile`);
      if (response.ok) {
        const profile = await response.json();
        setAuthors(prev => ({ ...prev, [userId]: profile.nickname || profile.first_name || `Użytkownik #${userId}` }));
      }
    } catch (err) {
      console.error("Error fetching author profile:", err);
    }
  };

  const fetchPublicPlans = async () => {
    try {
      const response = await fetch('/api/workouts/plans/public', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Nie udało się pobrać publicznych planów.');
      const data = await response.json();
      setPublicPlans(data);
      
      // Fetch authors for each plan
      const uniqueUserIds = [...new Set(data.map(p => p.user_id))];
      uniqueUserIds.forEach(id => fetchAuthor(id));
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPublicPlans();
    }
  }, [user]);

  const handleClone = async (planId) => {
    try {
      const response = await fetch(`/api/workouts/plans/${planId}/clone/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 403) {
        addNotification('Osiągnięto limit 5 planów. Usuń stary plan, aby sklonować nowy.', 'error');
        return;
      }
      
      if (!response.ok) throw new Error('Wystąpił błąd podczas klonowania planu.');
      
      const newPlan = await response.json();
      addNotification('Plan został pomyślnie sklonowany!', 'success');
      navigate(`/history/${newPlan.id}`);
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  if (!user) return <div className="page">Zaloguj się, aby zobaczyć publiczne plany.</div>;
  if (loading) return <div className="page">Wczytywanie ściany społeczności...</div>;
  if (error) return <div className="page"><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div className="page social-wall">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>
          🔥 Fitness Wall
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Inspiruj się planami treningowymi innych użytkowników FitAI.
        </p>
      </div>

      <div className="plans-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '2rem' 
      }}>
        {publicPlans.length > 0 ? (
          publicPlans.map((plan) => (
            <div 
              key={plan.id} 
              className="card plan-card" 
              style={{ 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid #e2e8f0',
                padding: '1.75rem',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div>
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  background: plan.user_id === user?.id ? '#22c55e' : '#f8fafc', 
                  color: plan.user_id === user?.id ? 'white' : '#64748b', 
                  padding: '0.4rem 1rem', 
                  fontSize: '0.75rem', 
                  fontWeight: '800',
                  borderBottomLeftRadius: '16px',
                  letterSpacing: '0.05em'
                }}>
                  {plan.user_id === user?.id ? 'TWÓJ PLAN' : `UDOSTĘPNIŁ: ${authors[plan.user_id] || '...'}`}
                </div>

                <h3 style={{ margin: '1rem 0 0.75rem 0', color: '#1e293b', fontSize: '1.4rem', fontWeight: '800', lineHeight: '1.2' }}>{plan.title}</h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                  <span style={{ background: '#fff7ed', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#f97316', border: '1px solid #ffedd5' }}>
                    ⏱️ {plan.duration_weeks} TYG.
                  </span>
                  <span style={{ background: '#f0f9ff', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#0ea5e9', border: '1px solid #e0f2fe' }}>
                    🤖 FitAI GEN
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn-secondary" 
                  style={{ 
                    flex: 1, 
                    fontSize: '0.9rem', 
                    padding: '0.8rem', 
                    borderRadius: '12px',
                    fontWeight: '700'
                  }} 
                  onClick={() => navigate(`/history/${plan.id}`)}
                >
                  Szczegóły
                </button>
                {plan.user_id !== user?.id && (
                  <button 
                    className="btn-primary" 
                    style={{ 
                      flex: 1, 
                      fontSize: '0.9rem', 
                      background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', 
                      padding: '0.8rem', 
                      borderRadius: '12px',
                      fontWeight: '700',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
                    }} 
                    onClick={(e) => { e.stopPropagation(); handleClone(plan.id); }}
                  >
                    Klonuj
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏜️</div>
            <p style={{ fontSize: '1.2rem' }}>Brak publicznych planów. Bądź pierwszy i opublikuj swój plan!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialWallPage;
