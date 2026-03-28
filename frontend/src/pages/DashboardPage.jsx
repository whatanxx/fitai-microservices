import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [activePlan, setActivePlan] = useState(null);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWeekly, setShowWeekly] = useState(false);
  
  const [explainingId, setExplainingId] = useState(null);
  const [explanation, setExplanation] = useState('');

  const fetchActivePlan = async () => {
    try {
      const response = await fetch(`/api/workouts/plans/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Nie udało się pobrać danych treningowych.');
      const plans = await response.json();
      
      let planToUse = plans.find(p => p.is_active);

      if (planToUse) {
        const fullPlanResp = await fetch(`/api/workouts/plans/${planToUse.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        const fullPlan = await fullPlanResp.json();
        setActivePlan(fullPlan);

        const dayOfWeek = new Date().getDay();
        const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek; 
        const today = fullPlan.days.find(d => d.day_number === normalizedDay);
        setTodayWorkout(today);
      }
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivePlan();
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
        fetchActivePlan();
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

  const isDayFinished = (day) => {
    if (day.is_completed) return true;
    if (day.is_rest_day) return false;
    if (!day.exercises || day.exercises.length === 0) return false;
    return day.exercises.every(ex => ex.completed_sets >= ex.sets);
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
    if (!activePlan) return 0;
    let totalSets = 0;
    let completedSets = 0;
    activePlan.days.forEach(day => {
      day.exercises.forEach(ex => {
        totalSets += ex.sets;
        completedSets += ex.completed_sets;
      });
    });
    if (totalSets === 0) return 0;
    return Math.round((completedSets / totalSets) * 100);
  };

  if (!user) return <div className="page">Zaloguj się.</div>;

  const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
  const displayName = user.profile?.nickname || user.profile?.first_name || user.email.split('@')[0];

  return (
    <div className="page dashboard-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Cześć, {displayName}! 👋</h1>
        <button 
            onClick={() => setShowWeekly(!showWeekly)}
            style={{ 
                background: showWeekly ? '#f97316' : '#fff', 
                color: showWeekly ? '#fff' : '#f97316',
                border: '1px solid #f97316',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}
        >
            {showWeekly ? 'Zamknij podgląd' : 'Podgląd tygodnia'}
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', textAlign: 'left', marginTop: '1rem' }}>
        {loading ? (
            <p>Wczytywanie...</p>
        ) : activePlan ? (
            <>
                {/* Progress Bar Section */}
                <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '2px solid #f97316' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                        <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ width: '8px', height: '8px', background: '#f97316', borderRadius: '50%' }}></span>
                                AKTYWNY PLAN
                            </span>
                            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e293b', marginTop: '0.25rem' }}>{activePlan.title}</div>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f97316' }}>{calculateTodayProgress()}%</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ 
                            width: `${calculateTodayProgress()}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
                            transition: 'width 0.4s ease-out'
                        }} />
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '4px', background: '#f1f5f9', borderRadius: '2px' }}>
                            <div style={{ width: `${calculateTotalProgress()}%`, height: '100%', background: '#94a3b8', borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>CAŁOŚĆ: {calculateTotalProgress()}%</span>
                    </div>
                </div>

                {/* Widok tygodnia - PEŁNA SZEROKOŚĆ, BEZ SCROLLA */}
                {showWeekly && (
                    <div style={{ 
                        padding: '1rem', 
                        background: '#f8fafc', 
                        borderRadius: '20px', 
                        border: '1px solid #e2e8f0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '0.4rem',
                    }}>
                        {activePlan.days.sort((a,b) => a.day_number - b.day_number).map((day) => {
                            const isToday = day.day_number === (new Date().getDay() === 0 ? 7 : new Date().getDay());
                            const finished = isDayFinished(day);
                            
                            return (
                                <div key={day.id} style={{ 
                                    padding: '0.5rem 0.2rem', 
                                    background: '#fff', 
                                    borderRadius: '14px', 
                                    border: isToday ? '2px solid #f97316' : '1px solid #e2e8f0',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '100px',
                                    boxShadow: isToday ? '0 4px 12px rgba(249, 115, 22, 0.1)' : 'none'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 'bold', color: isToday ? '#f97316' : '#64748b', marginBottom: '0.2rem' }}>
                                            {dayNames[day.day_number - 1]}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: day.is_rest_day ? '#cbd5e1' : '#1e293b', lineHeight: '1.1', textTransform: 'uppercase', wordBreak: 'break-word' }}>
                                            {day.is_rest_day ? 'REST' : (day.target_muscle_group || 'TRG')}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '1.1rem' }}>
                                        {finished ? '✅' : (day.is_rest_day ? '😴' : '⏳')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

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
                                                >
                                                    💡
                                                </button>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{ex.reps} powt.</span>
                                        </div>
                                        {explainingId === ex.id && (
                                            <div style={{ fontSize: '0.85rem', color: '#0369a1', background: '#e0f2fe', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
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
                                                        color: setIdx <= setIdx < ex.completed_sets ? '#fff' : (setIdx === ex.completed_sets ? '#fff' : '#94a3b8'),
                                                        transition: 'all 0.2s',
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
                                <p style={{ color: '#64748b', margin: 0 }}>Dziś czas na regenerację!</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ padding: '1.5rem', background: '#f1f5f9', borderRadius: '20px', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', margin: 0 }}>Wybierz aktywny plan w sekcji Moje Plany.</p>
                    </div>
                )}
            </>
        ) : (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff7ed', borderRadius: '20px', border: '2px dashed #f97316' }}>
                <p>Nie masz aktywnego planu treningowego.</p>
                <Link to="/ai-coach">
                    <button style={{ marginTop: '1rem' }}>Wygeneruj plan z AI 🤖</button>
                </Link>
            </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Link to="/history" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem' }}>📋</div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>Moje Plany</span>
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
