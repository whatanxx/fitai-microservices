import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = { email };
    
    if (isRegistering) {
      register(userData);
    } else {
      login(userData);
    }
    
    navigate('/');
  };

  return (
    <div className="page login-page">
      <h1>{isRegistering ? 'Zarejestruj się' : 'Zaloguj się'}</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Hasło" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isRegistering && (
          <input type="password" placeholder="Powtórz hasło" required />
        )}
        <button type="submit">
          {isRegistering ? 'Stwórz konto' : 'Zaloguj się'}
        </button>
      </form>
      
      <p style={{ marginTop: '1rem' }}>
        {isRegistering ? 'Masz już konto?' : 'Nie masz konta?'}
        <button 
          className="toggle-auth"
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ background: 'none', border: 'none', color: '#646cff', cursor: 'pointer', paddingLeft: '5px' }}
        >
          {isRegistering ? 'Zaloguj się' : 'Zarejestruj się'}
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
