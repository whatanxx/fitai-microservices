import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const PlanDetailsPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState(null);
  
  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [canRestore, setCanRestore] = useState(false);
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [authorName, setAuthorName] = useState('');

  const [editingDayId, setEditingDayId] = useState(null);

  const fetchAuthor = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/profile`);
      if (response.ok) {
        const profile = await response.json();
        setAuthorName(profile.nickname || profile.first_name || `Użytkownik #${userId}`);
      }
    } catch (err) {
      console.error("Error fetching author profile:", err);
    }
  };

  const fetchPlanDetails = async () => {
    try {
      const response = await fetch(`/api/workouts/plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Nie udało się pobrać szczegółów planu.');
      const data = await response.json();
      setPlan(data);
      setNewTitle(data.title);
      setIsPublished(data.is_published);
      
      const ownerStatus = user && data.user_id === user.id;
      setIsOwner(ownerStatus);
      
      if (!ownerStatus) {
        fetchAuthor(data.user_id);
      }
      
      const backup = localStorage.getItem(`plan_backup_${planId}`);
      setCanRestore(!!backup);
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveBackup = (currentPlan) => {
    if (!currentPlan) return;
    localStorage.setItem(`plan_backup_${planId}`, JSON.stringify(currentPlan));
    setCanRestore(true);
  };

  const handleRestore = async () => {
    const backup = localStorage.getItem(`plan_backup_${planId}`);
    if (backup) {
      const restoredPlan = JSON.parse(backup);
      await handleUpdateFullPlan(restoredPlan, true);
      localStorage.removeItem(`plan_backup_${planId}`);
      setCanRestore(false);
      addNotification('Przywrócono poprzednią wersję planu.', 'info');
    }
  };

  const toggleManualEdit = (dayId = null) => {
    if (!isManualEditing) {
      saveBackup(plan);
    }
    setIsManualEditing(!isManualEditing);
    if (dayId) setEditingDayId(dayId);
  };

  const handleAddExercise = (dayId) => {
    const newPlan = { ...plan };
    const day = newPlan.days.find(d => d.id === dayId);
    if (day) {
      day.exercises.push({
        name: 'Nowe ćwiczenie',
        sets: 3,
        reps: '12',
        rest_time_seconds: 60
      });
      setPlan({ ...newPlan });
    }
  };

  const handleDeleteExercise = (dayId, exIdx) => {
    const newPlan = { ...plan };
    const day = newPlan.days.find(d => d.id === dayId);
    if (day) {
      day.exercises.splice(exIdx, 1);
      setPlan({ ...newPlan });
    }
  };

  const handleUpdateFullPlan = async (updatedPlanData, isRestore = false) => {
    try {
      const response = await fetch(`/api/workouts/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...updatedPlanData, user_id: user.id })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Błąd podczas aktualizacji planu.');
      }
      const data = await response.json();
      setPlan(data);
      setIsManualEditing(false); 
      setEditingDayId(null);
      if (!isRestore) addNotification('Zmiany zostały zapisane!', 'success');
    } catch (err) {
      addNotification(err.message, 'error');
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
      if (!response.ok) throw new Error('Nie udało się zmienić tytułu.');
      const updatedPlan = await response.json();
      setPlan({ ...plan, title: updatedPlan.title });
      setIsEditingTitle(false);
      addNotification('Tytuł planu został zaktualizowany.', 'success');
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/workouts/plans/${planId}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Błąd podczas publikacji.');
      setIsPublished(true);
      addNotification('Twój plan jest teraz publiczny na Wallu! 📢', 'success');
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) return;
    saveBackup(plan);
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
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'AI Coach napotkał problem.');
      }
      const updatedPlan = await response.json();
      setPlan(updatedPlan);
      setRefinementPrompt('');
      addNotification('Plan został pomyślnie poprawiony przez AI! 🤖', 'success');
    } catch (err) {
      addNotification(err.message, 'error');
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
        {isEditingTitle && isOwner ? (
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
          <h1 onClick={() => isOwner && setIsEditingTitle(true)} style={{ cursor: isOwner ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {plan.title} {isOwner && <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>✏️</span>}
          </h1>
        )}
        <p style={{ color: '#64748b' }}>
          {isOwner ? 'Wygenerowano: ' : `Autor: ${authorName} | Wygenerowano: `}
          {new Date(plan.created_at).toLocaleDateString()}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {isOwner && (
          <button 
            onClick={handlePublish} 
            disabled={isPublished}
            style={{ background: isPublished ? '#94a3b8' : '#f97316', flex: 1 }}
          >
            {isPublished ? '✓ Opublikowano' : '📢 Opublikuj plan'}
          </button>
        )}
        {isOwner && canRestore && (
          <button 
            onClick={handleRestore} 
            style={{ background: '#64748b', flex: 1 }}
          >
            ↩ Przywróć wersję
          </button>
        )}
        {isOwner && (
          <button 
            onClick={toggleManualEdit} 
            style={{ background: isManualEditing ? '#22c55e' : '#f1f5f9', color: isManualEditing ? 'white' : '#1e293b', border: '1px solid #cbd5e1', flex: 1 }}
          >
            {isManualEditing ? 'Zakończ edycję' : '✏️ Edytuj ręcznie'}
          </button>
        )}
      </div>

      {isOwner && (
        /* AI Refinement Section */
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
      )}

      <div className="days-list" style={{ marginBottom: isManualEditing ? '100px' : '0' }}>
        {plan.days.map((day) => (
          <div key={day.id} className="workout-day-card" style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            padding: '1.5rem', 
            marginBottom: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: isManualEditing && editingDayId === day.id ? '2px solid #f97316' : '1px solid #e2e8f0',
            transition: 'border 0.2s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ margin: 0 }}>Dzień {day.day_number} {day.target_muscle_group && `- ${day.target_muscle_group}`}</h3>
                {isOwner && (
                  <button 
                    onClick={() => {
                      if (!isManualEditing) toggleManualEdit(day.id);
                      else setEditingDayId(editingDayId === day.id ? null : day.id);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}
                    title="Edytuj ten dzień"
                  >
                    ✏️
                  </button>
                )}
              </div>
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
                {day.exercises.map((ex, exIdx) => (
                  <div key={exIdx} style={{ 
                    padding: '0.75rem 0', 
                    borderBottom: exIdx === day.exercises.length - 1 ? 'none' : '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: isManualEditing && editingDayId === day.id ? 'column' : 'row',
                    justifyContent: 'space-between',
                    gap: isManualEditing && editingDayId === day.id ? '0.5rem' : '0'
                  }}>
                    {isManualEditing && editingDayId === day.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                        <input 
                          value={ex.name} 
                          onChange={(e) => {
                            const newPlan = {...plan};
                            newPlan.days.find(d => d.id === day.id).exercises[exIdx].name = e.target.value;
                            setPlan({...newPlan});
                          }}
                          style={{ flex: 2, padding: '0.4rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                          <input 
                            type="number"
                            value={ex.sets} 
                            onChange={(e) => {
                              const newPlan = {...plan};
                              newPlan.days.find(d => d.id === day.id).exercises[exIdx].sets = Number(e.target.value);
                              setPlan({...newPlan});
                            }}
                            style={{ width: '45px', padding: '0.4rem' }}
                          />
                          <span>x</span>
                          <input 
                            value={ex.reps} 
                            onChange={(e) => {
                              const newPlan = {...plan};
                              newPlan.days.find(d => d.id === day.id).exercises[exIdx].reps = e.target.value;
                              setPlan({...newPlan});
                            }}
                            style={{ width: '60px', padding: '0.4rem' }}
                          />
                        </div>
                        <button 
                          onClick={() => handleDeleteExercise(day.id, exIdx)}
                          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}
                          title="Usuń ćwiczenie"
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontWeight: '500' }}>{ex.name}</span>
                        <span style={{ color: '#64748b' }}>
                          {ex.sets} x {ex.reps} ({ex.rest_time_seconds}s przerwy)
                        </span>
                      </>
                    )}
                  </div>
                ))}
                {isManualEditing && editingDayId === day.id && (
                  <button 
                    onClick={() => handleAddExercise(day.id)}
                    style={{ background: '#f1f5f9', color: '#1e293b', border: '1px dashed #cbd5e1', width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '8px', fontWeight: '600' }}
                  >
                    ➕ Dodaj ćwiczenie
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Save Bar */}
      {isManualEditing && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)',
          padding: '1.25rem 2rem', 
          boxShadow: '0 -10px 25px -5px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          zIndex: 1000,
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ maxWidth: '900px', width: '100%', display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => { setIsManualEditing(false); setEditingDayId(null); fetchPlanDetails(); }} 
              className="btn-secondary" 
              style={{ flex: 1, padding: '1rem' }}
            >
              Anuluj
            </button>
            <button 
              onClick={() => handleUpdateFullPlan(plan)} 
              className="btn-primary" 
              style={{ flex: 2, padding: '1rem', background: '#22c55e' }}
            >
              💾 Zapisz wszystkie zmiany
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanDetailsPage;
