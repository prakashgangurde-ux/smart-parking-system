// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../services/api';

const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const userData = await getMe();
        if (userData) setUser(userData);
      } catch (error) {
        apiLogout();
      }
      setLoading(false);
    };
    checkLoggedInUser();
  }, []);
  const login = async (email, password) => {
    try {
      await apiLogin(email, password);
      const userData = await getMe();
      setUser(userData);
      return userData;
    } catch (error) {
      apiLogout();
      throw error;
    }
  };
  const logout = () => {
    apiLogout();
    setUser(null);
  };
  const value = { user, login, logout, isAuthenticated: !!user, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  return useContext(AuthContext);
}