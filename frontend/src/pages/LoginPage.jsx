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
    const userData = { email, password };
    isRegistering ? register(userData) : login(userData);
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
        <button type="submit">
          {isRegistering ? 'Stwórz konto' : 'Zaloguj się'}
        </button>
      </form>
      
      <p>
        {isRegistering ? 'Masz już konto?' : 'Nie masz konta?'}
        <button className="toggle-auth" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Zaloguj się' : 'Zarejestruj się'}
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
