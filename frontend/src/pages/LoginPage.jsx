import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const userData = { email, password };
    
    try {
      const success = isRegistering 
        ? await register(userData) 
        : await login(userData);
        
      if (success) {
        navigate('/');
      } else {
        setError('Błąd autoryzacji. Sprawdź dane (hasło min. 8 znaków).');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <h1>{isRegistering ? 'Zarejestruj się' : 'Zaloguj się'}</h1>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input 
          type="password" 
          placeholder="Hasło (min. 8 znaków)" 
          required 
          minLength="8"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Czekaj...' : (isRegistering ? 'Stwórz konto' : 'Zaloguj się')}
        </button>
      </form>
      
      <p>
        {isRegistering ? 'Masz już konto?' : 'Nie masz konta?'}
        <button
          type="button"
          className="toggle-auth"
          onClick={() => setIsRegistering(!isRegistering)}
          disabled={loading}
        >
          {isRegistering ? 'Zaloguj się' : 'Zarejestruj się'}
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
