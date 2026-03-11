import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <ul className="nav-links nav-left">
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/ai-coach">AI-Coach</Link></li>
          <li><Link to="/history">Historia</Link></li>
        </ul>
        
        <ul className="nav-links nav-right">
          {user ? (
            <>
              <li className="user-info">Cześć, {user.email}</li>
              <li><button className="logout-btn" onClick={handleLogout}>Wyloguj</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Zaloguj / Rejestracja</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
