import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const api = axios.create({
  baseURL: '/api'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async (authToken) => {
    try {
      const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Fetch current user error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (userData) => {
    try {
      const response = await api.post('/users/login', userData);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      // fetchCurrentUser zostanie wywołane przez useEffect [token]
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
      await api.post('/users/register', userData);
      return await login(userData);
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user) return false;
      const response = await api.put(`/users/${user.id}/profile`, profileData);
      setUser(prev => ({ ...prev, profile: response.data }));
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
