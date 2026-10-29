import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ecosort_token'));
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('ecosort_guest') === 'true');

  useEffect(() => {
    async function loadUserProfile() {
      if (token) {
        try {
          const res = await api.getProfile();
          if (res && res.user) {
            setUser(res.user);
            setIsGuest(false);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    loadUserProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res && res.token) {
      localStorage.setItem('ecosort_token', res.token);
      localStorage.removeItem('ecosort_guest');
      setToken(res.token);
      setUser(res.user);
      setIsGuest(false);
      return res.user;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res && res.token) {
      localStorage.setItem('ecosort_token', res.token);
      localStorage.removeItem('ecosort_guest');
      setToken(res.token);
      setUser(res.user);
      setIsGuest(false);
      return res.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('ecosort_token');
    localStorage.removeItem('ecosort_guest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    localStorage.removeItem('ecosort_token');
    localStorage.setItem('ecosort_guest', 'true');
    setToken(null);
    setUser(null);
    setIsGuest(true);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isGuest,
    login,
    register,
    logout,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
