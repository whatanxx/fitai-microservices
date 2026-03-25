import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Bazowa konfiguracja Axios korzystająca z proxy Vite
const api = axios.create({
  baseURL: '/api'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // TODO: Możesz dodać pobieranie profilu użytkownika przy odświeżeniu
    }
  }, [token]);

  const login = async (userData) => {
    try {
      const response = await api.post('/users/login', userData);
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);
      setUser({ email: userData.email }); // Proste przypisanie dla widoku
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const register = async (userData) => {
    try {
      // Rejestracja w user-service
      await api.post('/users/register', userData);
      // Po rejestracji od razu logujemy
      return await login(userData);
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const updateProfile = async (newData) => {
    try {
      // TODO: Implementacja PUT /profiles/{user_id}
      setUser(prev => ({ ...prev, ...newData }));
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
