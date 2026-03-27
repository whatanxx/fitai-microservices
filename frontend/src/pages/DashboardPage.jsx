import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [latestPlan, setLatestPlan] = useState(null);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Explanation states
  const [explainingId, setExplainingId] = useState(null);
  const [explanation, setExplanation] = useState('');

  const fetchLatestPlan = async () => {
    try {
      const response = await fetch(`/api/workouts/plans/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Błąd pobierania planu.');
      const plans = await response.json();
      
      if (plans.length > 0) {
        const sortedPlans = plans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const planId = sortedPlans[0].id;

        const fullPlanResp = await fetch(`/api/workouts/plans/${planId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        const fullPlan = await fullPlanResp.json();
        setLatestPlan(fullPlan);

        const dayOfWeek = new Date().getDay();
        const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek; 
        const today = fullPlan.days.find(d => d.day_number === normalizedDay);
        setTodayWorkout(today);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLatestPlan();
    }
  }, [user]);

  const handleCompleteSet = async (exerciseId) => {
    try {
      const response = await fetch(`/api/workouts/exercises/${exerciseId}/complete-set`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchLatestPlan();
      }
    } catch (err) {
      console.error("Error completing set:", err);
    }
  };

  const handleExplain = async (exerciseName, exerciseId) => {
    if (explainingId === exerciseId) {
        setExplainingId(null);
        return;
    }
    setExplainingId(exerciseId);
    setExplanation('Generowanie wskazówek...');
    try {
        const response = await fetch('/api/ai/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ exercise_name: exerciseName })
        });
        const data = await response.json();
        setExplanation(data.explanation);
    } catch (err) {
        setExplanation('Nie udało się pobrać wyjaśnienia.');
    }
  };

  const calculateTodayProgress = () => {
    if (!todayWorkout || todayWorkout.is_rest_day) return 0;
    let totalSets = 0;
    let completedSets = 0;

    todayWorkout.exercises.forEach(ex => {
      totalSets += ex.sets;
      completedSets += ex.completed_sets;
    });

    if (totalSets === 0) return 0;
    return Math.round((completedSets / totalSets) * 100);
  };

  const calculateTotalProgress = () => {
    if (!latestPlan) return 0;
    let totalSets = 0;
    let completedSets = 0;

    latestPlan.days.forEach(day => {
      day.exercises.forEach(ex => {
        totalSets += ex.sets;
        completedSets += ex.completed_sets;
      });
    });

    if (totalSets === 0) return 0;
    return Math.round((completedSets / totalSets) * 100);
  };

  const todayProgress = calculateTodayProgress();
  const totalProgress = calculateTotalProgress();

  if (!user) return <div className="page">Zaloguj się.</div>;

  return (
    <div className="page dashboard-page">
      <h1 style={{ marginBottom: '0.5rem' }}>Cześć, {user.email.split('@')[0]}! 👋</h1>
      
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', textAlign: 'left', marginTop: '1rem' }}>
        {loading ? (
            <p>Wczytywanie...</p>
        ) : latestPlan ? (
            <>
                {/* Progress Bar Section */}
                <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                        <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b' }}>DZISIEJSZY TRENING</span>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{latestPlan.title}</div>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f97316' }}>{todayProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ 
                            width: `${todayProgress}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
                            transition: 'width 0.4s ease-out'
                        }} />
                    </div>
                    
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '4px', background: '#f1f5f9', borderRadius: '2px' }}>
                            <div style={{ width: `${totalProgress}%`, height: '100%', background: '#94a3b8', borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>CAŁOŚĆ: {totalProgress}%</span>
                    </div>
                </div>

                {/* Sekcja Dzisiejszego Treningu */}
                {todayWorkout ? (
                    <div style={{ 
                        padding: '1.5rem', 
                        background: '#fff', 
                        borderRadius: '20px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f97316', textTransform: 'uppercase' }}>
                                🚀 DZISIEJSZE ZADANIA
                            </span>
                            <h2 style={{ margin: 0 }}>{todayWorkout.target_muscle_group || 'Trening'}</h2>
                        </div>

                        {!todayWorkout.is_rest_day ? (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {todayWorkout.exercises.map((ex) => (
                                    <div key={ex.id} style={{ 
                                        padding: '1rem', 
                                        background: '#f8fafc', 
                                        borderRadius: '12px',
                                        border: '1px solid #f1f5f9'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: '700', color: '#1e293b' }}>{ex.name}</span>
                                                <button 
                                                    onClick={() => handleExplain(ex.name, ex.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1.1rem' }}
                                                    title="Jak to ćwiczyć?"
                                                >
                                                    💡
                                                </button>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{ex.reps} powt.</span>
                                        </div>

                                        {explainingId === ex.id && (
                                            <div style={{ 
                                                fontSize: '0.85rem', 
                                                color: '#0369a1', 
                                                background: '#e0f2fe', 
                                                padding: '0.75rem', 
                                                borderRadius: '8px',
                                                marginBottom: '0.75rem',
                                                lineHeight: '1.4'
                                            }}>
                                                <strong>AI Coach:</strong> {explanation}
                                            </div>
                                        )}
                                        
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {[...Array(ex.sets)].map((_, setIdx) => (
                                                <button
                                                    key={setIdx}
                                                    onClick={() => setIdx === ex.completed_sets && handleCompleteSet(ex.id)}
                                                    style={{
                                                        width: '35px',
                                                        height: '35px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        cursor: setIdx === ex.completed_sets ? 'pointer' : 'default',
                                                        background: setIdx < ex.completed_sets ? '#22c55e' : (setIdx === ex.completed_sets ? '#f97316' : '#e2e8f0'),
                                                        color: setIdx <= ex.completed_sets ? '#fff' : '#94a3b8',
                                                        transition: 'all 0.2s',
                                                        boxShadow: setIdx === ex.completed_sets ? '0 0 8px rgba(249, 115, 22, 0.4)' : 'none'
                                                    }}
                                                >
                                                    {setIdx < ex.completed_sets ? '✓' : setIdx + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>😴</div>
                                <p style={{ color: '#64748b', margin: 0 }}>Dziś czas na regenerację! Mięśnie rosną kiedy odpoczywasz.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ padding: '1.5rem', background: '#f1f5f9', borderRadius: '20px', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', margin: 0 }}>Brak zaplanowanego treningu na dziś.</p>
                    </div>
                )}
            </>
        ) : (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff7ed', borderRadius: '20px', border: '2px dashed #f97316' }}>
                <p>Nie masz jeszcze żadnego planu treningowego.</p>
                <Link to="/ai-coach">
                    <button style={{ marginTop: '1rem' }}>Wygeneruj plan z AI 🤖</button>
                </Link>
            </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Link to="/history" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem' }}>📅</div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>Historia</span>
                </div>
            </Link>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem' }}>📈</div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>Postępy</span>
                </div>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
