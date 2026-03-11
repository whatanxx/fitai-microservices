import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    // Inicjalizacja z historią (mock danych)
    setUser({ 
      ...userData, 
      weight: 80, 
      height: 180,
      history: [
        { date: '2024-02-11', weight: 82 },
        { date: '2024-03-11', weight: 80 }
      ]
    });
  };

  const logout = () => {
    setUser(null);
  };

  const register = (userData) => {
    setUser({ 
      ...userData, 
      weight: 80, 
      height: 180,
      history: [{ date: new Date().toISOString().split('T')[0], weight: 80 }]
    });
  };

  const updateProfile = (newData) => {
    setUser(prev => ({ 
      ...prev, 
      ...newData,
      history: [...prev.history, { date: new Date().toISOString().split('T')[0], weight: newData.weight }]
    }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
