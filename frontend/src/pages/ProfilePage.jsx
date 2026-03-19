import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(user?.weight || 0);
  const [height, setHeight] = useState(user?.height || 0);
  const [age, setAge] = useState(user?.age || '');
  const [sex, setSex] = useState(user?.sex || 'male');
  const [goal, setGoal] = useState(user?.goal || '');
  const [equipment, setEquipment] = useState(user?.equipment || 'gym');
  const [trainingDays, setTrainingDays] = useState(user?.trainingDays || 3);
  const [level, setLevel] = useState(user?.level || 'beginner');

  if (!user) return <div className="page">Zaloguj się, aby zobaczyć profil.</div>;

  const calculateBMI = () => {
    const hInMeters = user.height / 100;
    const bmi = (user.weight / (hInMeters * hInMeters)).toFixed(1);
    let category = '';
    let color = '';

    if (bmi < 18.5) { category = 'Niedowaga'; color = '#3b82f6'; }
    else if (bmi < 25) { category = 'W normie'; color = '#10b981'; }
    else if (bmi < 30) { category = 'Nadwaga'; color = '#f97316'; }
    else { category = 'Otyłość'; color = '#ef4444'; }

    return { bmi, category, color };
  };

  const { bmi, category, color } = calculateBMI();

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      sex,
      goal,
      equipment,
      trainingDays: Number(trainingDays),
      level,
    });
    setIsEditing(false);
  };

  // Przygotowanie danych do wykresu (sortowanie po dacie)
  const chartData = user.history
    .map(entry => ({
      ...entry,
      dateFormatted: new Date(entry.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const levelLabels = {
    beginner: 'Początkujący',
    intermediate: 'Średnio zaawansowany',
    advanced: 'Zaawansowany',
  };

  const equipmentLabels = {
    home: 'Domowy',
    gym: 'Siłownia',
  };

  const sexLabels = {
    male: 'Mężczyzna',
    female: 'Kobieta',
  };

  return (
    <div className="page profile-page">
      <h1>Mój Profil</h1>

      {!isEditing ? (
        <div style={{ width: '100%' }}>
          {/* Statystyki Waga/Wzrost */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1.2rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #fed7aa', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#9a3412', fontWeight: '600', textTransform: 'uppercase' }}>Waga</span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#f97316' }}>{user.weight} <small style={{ fontSize: '1rem' }}>kg</small></div>
            </div>
            <div style={{ padding: '1.2rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #fed7aa', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#9a3412', fontWeight: '600', textTransform: 'uppercase' }}>Wzrost</span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#f97316' }}>{user.height} <small style={{ fontSize: '1rem' }}>cm</small></div>
            </div>
          </div>

          {/* Dodatkowe informacje */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Wiek</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>{user.age} lat</div>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Płeć</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>{sexLabels[user.sex] || user.sex}</div>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Sprzęt</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{equipmentLabels[user.equipment] || user.equipment}</div>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Dni/tydz.</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>{user.trainingDays}</div>
            </div>
          </div>

          {/* Cel i poziom */}
          {user.goal && (
            <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: '600', textTransform: 'uppercase' }}>Cel treningowy</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ea580c', marginTop: '0.25rem' }}>{user.goal}</div>
            </div>
          )}
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Poziom zaawansowania</span>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginTop: '0.25rem' }}>{levelLabels[user.level] || user.level}</div>
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
            </div>
          </div>

          <button onClick={() => setIsEditing(true)} style={{ width: '100%' }}>
            Edytuj dane biometryczne
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ textAlign: 'left', width: '100%' }}>
            <label htmlFor="profile-weight">Waga (kg)</label>
            <input 
              id="profile-weight"
              type="number" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
              placeholder="np. 80"
              required
            />
          </div>
          <div style={{ textAlign: 'left', width: '100%', marginTop: '1.5rem' }}>
            <label htmlFor="profile-height">Wzrost (cm)</label>
            <input 
              id="profile-height"
              type="number" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)} 
              placeholder="np. 180"
              required
            />
          </div>
          <div style={{ textAlign: 'left', width: '100%', marginTop: '1.5rem' }}>
            <label htmlFor="profile-age">Wiek</label>
            <input
              id="profile-age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="np. 25"
              min="10"
              max="100"
              required
            />
          </div>
          <div style={{ textAlign: 'left', width: '100%', marginTop: '1.5rem' }}>
            <label htmlFor="profile-sex">Płeć</label>
            <select
              id="profile-sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', width: '100%' }}
            >
              <option value="male">Mężczyzna</option>
              <option value="female">Kobieta</option>
            </select>
          </div>
          <div style={{ textAlign: 'left', width: '100%', marginTop: '1.5rem' }}>
            <label htmlFor="profile-goal">Cel treningowy</label>
            <input
              id="profile-goal"
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="np. Budowa masy, Redukcja"
            />
          </div>
          <div style={{ textAlign: 'left', width: '100%', marginTop: '1.5rem' }}>
            <label htmlFor="profile-equipment">Dostępny sprzęt</label>
            <select
              id="profile-equipment"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', width: '100%' }}
            >
              <option value="home">Domowy</option>
              <option value="gym">Siłownia</option>
            </select>
          </div>
          <div style={{ textAlign: 'left', width: '100%', marginTop: '1.5rem' }}>
            <label htmlFor="profile-days">Liczba dni treningowych w tygodniu</label>
            <input
              id="profile-days"
              type="number"
              value={trainingDays}
              onChange={(e) => setTrainingDays(e.target.value)}
              placeholder="np. 3"
              min="1"
              max="7"
              required
            />
          </div>
          <div style={{ textAlign: 'left', width: '100%', marginTop: '1.5rem' }}>
            <label htmlFor="profile-level">Stopień zaawansowania</label>
            <select
              id="profile-level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', width: '100%' }}
            >
              <option value="beginner">Początkujący</option>
              <option value="intermediate">Średnio zaawansowany</option>
              <option value="advanced">Zaawansowany</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ flex: 1 }}>
              Anuluj
            </button>
            <button type="submit" style={{ flex: 2 }}>
              Zapisz zmiany
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
