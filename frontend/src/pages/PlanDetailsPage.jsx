import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PlanDetailsPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState(null);
  
  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [refinementPrompt, setRefinementPrompt] = useState('');

  const fetchPlanDetails = async () => {
    try {
      const response = await fetch(`/api/workouts/plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Błąd pobierania planu.');
      const data = await response.json();
      setPlan(data);
      setNewTitle(data.title);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && planId) {
      fetchPlanDetails();
    }
  }, [user, planId]);

  const handleUpdateTitle = async () => {
    try {
      const response = await fetch(`/api/workouts/plans/${planId}?title=${encodeURIComponent(newTitle)}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Błąd podczas aktualizacji tytułu.');
      const updatedPlan = await response.json();
      setPlan({ ...plan, title: updatedPlan.title });
      setIsEditingTitle(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) return;
    setRefining(true);
    try {
      const response = await fetch(`/api/ai/refine/${planId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt: refinementPrompt })
      });
      if (!response.ok) throw new Error('Błąd podczas doprecyzowania planu.');
      const newPlan = await response.json();
      alert('Wygenerowano nowy plan na podstawie Twoich uwag!');
      navigate(`/history/${newPlan.id}`);
      window.location.reload(); // Prosty sposób na odświeżenie danych dla nowego ID
    } catch (err) {
      alert(err.message);
    } finally {
      setRefining(false);
    }
  };

  if (!user) return <div className="page">Zaloguj się.</div>;
  if (loading) return <div className="page">Wczytywanie...</div>;
  if (error) return <div className="page"><p style={{ color: 'red' }}>{error}</p></div>;
  if (!plan) return <div className="page">Nie znaleziono planu.</div>;

  return (
    <div className="page plan-details-page">
      <button onClick={() => navigate('/history')} style={{ marginBottom: '1rem', background: '#f1f5f9', color: '#475569' }}>
        ← Wróć do historii
      </button>
      
      <div style={{ marginBottom: '2rem' }}>
        {isEditingTitle ? (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '0.5rem' }}
            />
            <button onClick={handleUpdateTitle} style={{ background: '#22c55e', padding: '0.5rem' }}>Zapisz</button>
            <button onClick={() => setIsEditingTitle(false)} style={{ background: '#94a3b8', padding: '0.5rem' }}>X</button>
          </div>
        ) : (
          <h1 onClick={() => setIsEditingTitle(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {plan.title} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>✏️</span>
          </h1>
        )}
        <p style={{ color: '#64748b' }}>
          Wygenerowano: {new Date(plan.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* AI Refinement Section */}
      <div style={{ 
        background: '#f0f9ff', 
        padding: '1.5rem', 
        borderRadius: '16px', 
        marginBottom: '2rem',
        border: '1px solid #bae6fd' 
      }}>
        <h3 style={{ marginTop: 0, color: '#0369a1' }}>🤖 Popraw ten plan z AI</h3>
        <p style={{ fontSize: '0.9rem', color: '#0c4a6e' }}>Np. "dodaj więcej ćwiczeń na brzuch" lub "zmień trening na bardziej intensywny".</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input 
            placeholder="Wpisz swoje uwagi..." 
            value={refinementPrompt}
            onChange={(e) => setRefinementPrompt(e.target.value)}
            style={{ flex: 1, padding: '0.75rem' }}
            disabled={refining}
          />
          <button 
            onClick={handleRefine} 
            disabled={refining || !refinementPrompt}
            style={{ background: refining ? '#94a3b8' : '#0ea5e9', minWidth: '100px' }}
          >
            {refining ? '⏳...' : 'Popraw'}
          </button>
        </div>
      </div>

      <div className="days-list">
        {plan.days.map((day) => (
          <div key={day.id} className="workout-day-card" style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            padding: '1.5rem', 
            marginBottom: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Dzień {day.day_number} {day.target_muscle_group && `- ${day.target_muscle_group}`}</h3>
              {day.is_rest_day ? (
                <span style={{ color: '#64748b', fontWeight: '600' }}>REGEN</span>
              ) : (
                <span style={{ color: '#f97316', fontWeight: '600' }}>TRENING</span>
              )}
            </div>

            {day.is_rest_day ? (
              <p style={{ color: '#64748b' }}>Odpoczynek jest kluczowy dla regeneracji mięśni.</p>
            ) : (
              <div className="exercises-list">
                {day.exercises.map((ex, idx) => (
                  <div key={idx} style={{ 
                    padding: '0.75rem 0', 
                    borderBottom: idx === day.exercises.length - 1 ? 'none' : '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: '500' }}>{ex.name}</span>
                    <span style={{ color: '#64748b' }}>
                      {ex.sets} x {ex.reps} ({ex.rest_time_seconds}s przerwy)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanDetailsPage;
