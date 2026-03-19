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
      age: 25,
      sex: 'male',
      goal: 'Budowa masy',
      equipment: 'gym',
      trainingDays: 3,
      level: 'beginner',
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
      age: 25,
      sex: 'male',
      goal: '',
      equipment: 'gym',
      trainingDays: 3,
      level: 'beginner',
      history: [{ date: new Date().toISOString().split('T')[0], weight: 80 }]
    });
  };

  const updateProfile = (newData) => {
    setUser(prev => ({ 
      ...prev, 
      ...newData,
      history: newData.weight != null && newData.weight !== prev.weight
        ? [...prev.history, { date: new Date().toISOString().split('T')[0], weight: newData.weight }]
        : prev.history
    }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
