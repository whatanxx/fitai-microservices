import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
        <h1>Twój Dashboard</h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          Zaloguj się, aby zobaczyć swoje aktualne plany treningowe i dzisiejsze cele.
        </p>
        <Link to="/login">
          <button style={{ padding: '1rem 2.5rem' }}>Zaloguj się teraz</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <h1>Witaj, {user.email}!</h1>
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', textAlign: 'left' }}>
        <div style={{ padding: '1.5rem', background: '#fff7ed', borderRadius: '16px', border: '1px dotted #f97316' }}>
          <h3 style={{ color: '#ea580c', marginBottom: '0.5rem' }}>🔥 Dzisiejszy cel</h3>
          <p>Twój plan treningowy pojawi się tutaj po wygenerowaniu go przez AI.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
