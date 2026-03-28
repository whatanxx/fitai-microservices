import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const OnboardingModal = () => {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useNotification();
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('Mężczyzna');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Check if profile is missing critical data
  const isProfileIncomplete = user && (!user.profile?.current_weight_kg || !user.profile?.height_cm || !user.profile?.age || !user.profile?.first_name);

  if (!isProfileIncomplete || !isVisible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Number(height) < 120) {
      setError('Wzrost musi wynosić co najmniej 120 cm.');
      return;
    }
    if (Number(weight) <= 30) {
      setError('Waga musi być większa niż 30 kg.');
      return;
    }
    if (Number(age) <= 0 || Number(age) > 120) {
      setError('Wiek musi być między 1 a 120 lat.');
      return;
    }
    if (!firstName.trim()) {
      setError('Imię jest wymagane.');
      return;
    }

    const success = await updateProfile({
      first_name: firstName,
      nickname: nickname || null,
      gender: gender,
      current_weight_kg: Number(weight),
      height_cm: Number(height),
      age: Number(age)
    });

    if (success) {
      setIsVisible(false);
      addNotification('Witaj na pokładzie! Twój profil jest gotowy. 🚀', 'success');
    } else {
      setError('Błąd podczas zapisywania profilu.');
      addNotification('Wystąpił problem z profilem.', 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content onboarding-card" style={{ position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
        >
          &times;
        </button>
        <h2>Witaj w FitAI! 👋</h2>
        <p>Zanim zaczniemy, uzupełnij swoje podstawowe dane.</p>
        
        {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Imię *</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jan" required />
            </div>
            <div className="input-group">
              <label>Pseudonim</label>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Johny" />
            </div>
          </div>

          <div className="input-group">
            <label>Płeć</label>
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '2px solid #e2e8f0' }}
            >
              <option value="Mężczyzna">Mężczyzna</option>
              <option value="Kobieta">Kobieta</option>
              <option value="Inna">Inna</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Wiek</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Waga (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Wzrost (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            Zacznijmy przygodę!
          </button>
        </form>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .onboarding-card {
          background: white;
          padding: 2.5rem;
          border-radius: 24px;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          text-align: center;
        }
        .onboarding-card h2 {
          font-size: 1.75rem;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        .onboarding-card p {
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        .input-group {
          text-align: left;
          margin-bottom: 1.25rem;
        }
        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #475569;
          font-size: 0.9rem;
        }
        .input-group input {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .input-group input:focus {
          border-color: #f97316;
          outline: none;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
        }
      `}</style>
    </div>
  );
};

export default OnboardingModal;
