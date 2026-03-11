import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HistoryPage = () => {
  const { user } = useAuth();

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
      <h1>Historia Treningów</h1>
      <p style={{ marginBottom: '2rem' }}>Przegląd Twoich ukończonych aktywności.</p>
      <div style={{ width: '100%', textAlign: 'left' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <span>10 marca 2024</span>
          <span style={{ fontWeight: '600', color: '#f97316' }}>Siłownia - Góra</span>
        </div>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <span>8 marca 2024</span>
          <span style={{ fontWeight: '600', color: '#f97316' }}>Bieganie (5km)</span>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
