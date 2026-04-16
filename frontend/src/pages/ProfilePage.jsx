import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [weight, setWeight] = useState(0);
  const [height, setHeight] = useState(0);
  const [age, setAge] = useState(0);
  const [preferredAiProvider, setPreferredAiProvider] = useState('google');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setFirstName(user.profile.first_name || '');
      setNickname(user.profile.nickname || '');
      setWeight(user.profile.current_weight_kg || 0);
      setHeight(user.profile.height_cm || 0);
      setAge(user.profile.age || 25);
      setPreferredAiProvider(user.profile.preferred_ai_provider || 'google');
    }
  }, [user]);

  if (!user) return <div className="page">Zaloguj się, aby zobaczyć profil.</div>;

  const calculateBMI = () => {
    const w = user.profile?.current_weight_kg || 0;
    const h = user.profile?.height_cm || 0;
    if (w === 0 || h === 0) return { bmi: '?', category: 'Brak danych', color: '#94a3b8' };

    const hInMeters = h / 100;
    const bmiValue = (w / (hInMeters * hInMeters)).toFixed(1);
    let category = '';
    let color = '';

    if (bmiValue < 18.5) { category = 'Niedowaga'; color = '#3b82f6'; }
    else if (bmiValue < 25) { category = 'W normie'; color = '#10b981'; }
    else if (bmiValue < 30) { category = 'Nadwaga'; color = '#f97316'; }
    else { category = 'Otyłość'; color = '#ef4444'; }

    return { bmi: bmiValue, category, color };
  };

  const { bmi, category, color } = calculateBMI();

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) {
        setError('Imię jest wymagane.');
        return;
    }
    if (Number(height) < 120) {
        setError('Wzrost musi wynosić co najmniej 120 cm.');
        return;
    }
    if (Number(weight) <= 30) {
        setError('Waga musi być większa niż 30 kg.');
        return;
    }
    if (Number(age) < 0 || Number(age) > 120) {
        setError('Wiek musi być między 0 a 120 lat.');
        return;
    }

    const success = await updateProfile({ 
      first_name: firstName,
      nickname: nickname || null,
      current_weight_kg: Number(weight), 
      height_cm: Number(height),
      age: Number(age),
      preferred_ai_provider: preferredAiProvider
    });
    
    if (success) {
        setIsEditing(false);
        addNotification('Profil został zaktualizowany!', 'success');
    } else {
        setError('Wystąpił błąd podczas zapisywania profilu.');
        addNotification('Błąd zapisu profilu.', 'error');
    }
  };

  // Przygotowanie danych do wykresu (sortowanie po dacie)
  const history = user.profile?.weight_history || [];
  const chartData = history
    .map(entry => ({
      ...entry,
      dateFormatted: new Date(entry.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="page profile-page">
      <h1>Mój Profil</h1>

      {!isEditing ? (
        <div style={{ width: '100%' }}>
          {/* Statystyki Waga/Wzrost */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1.2rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #fed7aa', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#9a3412', fontWeight: '600', textTransform: 'uppercase' }}>Waga</span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#f97316' }}>{user.profile?.current_weight_kg || '--'} <small style={{ fontSize: '1rem' }}>kg</small></div>
            </div>
            <div style={{ padding: '1.2rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #fed7aa', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#9a3412', fontWeight: '600', textTransform: 'uppercase' }}>Wzrost</span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#f97316' }}>{user.profile?.height_cm || '--'} <small style={{ fontSize: '1rem' }}>cm</small></div>
            </div>
          </div>

          {/* BMI Info */}
          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', marginBottom: '2rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '500' }}>Twoje aktualne BMI</span>
            <div style={{ fontSize: '3.5rem', fontWeight: '900', color, lineHeight: '1' }}>{bmi}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color, marginTop: '0.5rem' }}>{category}</div>
          </div>

          {/* WYKRES POSTĘPÓW */}
          <div style={{ marginBottom: '2.5rem', background: '#ffffff', padding: '1.5rem 0.5rem', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.1rem', color: '#1e293b' }}>
              📈 Historia zmian wagi
            </h3>
            <div style={{ width: '100%', height: 250 }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="dateFormatted" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      width={35}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#f97316" 
                      strokeWidth={4} 
                      dot={{ fill: '#f97316', r: 6, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  Brak danych do wyświetlenia wykresu.
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setIsEditing(true)} style={{ width: '100%' }}>
            Edytuj dane biometryczne
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
          
          {/* SEKCJA 1: PROFIL */}
          <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👤 Informacje o profilu
            </h3>
            <div style={{ textAlign: 'left', width: '100%' }}>
              <label>Imię</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                placeholder="Twoje imię"
                required
              />
            </div>
            <div style={{ textAlign: 'left', width: '100%', marginTop: '1rem' }}>
              <label>Nickname</label>
              <input 
                type="text" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                placeholder="Twój pseudonim"
              />
            </div>
          </div>

          {/* SEKCJA 2: USTAWIENIA AI - TERAZ OSOBNO */}
          <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '16px', border: '1px solid #bae6fd' }}>
            <h3 style={{ marginBottom: '1rem', color: '#0369a1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🤖 Twój Trener AI
            </h3>
            <div style={{ textAlign: 'left', width: '100%' }}>
              <label style={{ color: '#0c4a6e' }}>Wybierz inteligencję swojego trenera</label>
              <select 
                value={preferredAiProvider} 
                onChange={(e) => setPreferredAiProvider(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  borderRadius: '12px', 
                  border: '1px solid #7dd3fc', 
                  background: '#ffffff',
                  color: '#0369a1',
                  fontWeight: '600'
                }}
              >
                <option value="google">Google Gemini 2.5 Flash (Szybki i precyzyjny)</option>
                <option value="openai">OpenAI GPT-4o-mini (Kreatywny)</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: '#0ea5e9', marginTop: '0.5rem' }}>
                Wybrany model będzie generował Twoje plany treningowe i odpowiadał na pytania.
              </p>
            </div>
          </div>

          {/* SEKCJA 3: BIOMETRIA */}
          <div style={{ marginBottom: '2rem', padding: '1rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #fed7aa' }}>
            <h3 style={{ marginBottom: '1rem', color: '#9a3412', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚖️ Dane biometryczne
            </h3>
            <div style={{ textAlign: 'left', width: '100%' }}>
              <label>Wiek</label>
              <input 
                type="number" 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                placeholder="np. 25"
                required
              />
            </div>
            <div style={{ textAlign: 'left', width: '100%', marginTop: '1rem' }}>
              <label>Waga (kg)</label>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                placeholder="np. 80"
                required
              />
            </div>
            <div style={{ textAlign: 'left', width: '100%', marginTop: '1rem' }}>
              <label>Wzrost (cm)</label>
              <input 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)} 
                placeholder="np. 180"
                required
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ flex: 1 }}>
              Anuluj
            </button>
            <button type="submit" style={{ flex: 2 }}>
              Zapisz wszystkie zmiany
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
