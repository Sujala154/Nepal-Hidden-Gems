/**
 * AuthContext.jsx
 *
 * Centralizes authentication state and modal management.
 * Provides a unified interface for login, registration, and logout,
 * while maintaining the user's role and session persistent in sessionStorage.
 *
 * Also manages the global authentication modal (Login/Signup toggling).
 */
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  // ── Session Initialization ──────────────────────────────────────────────────
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // ── Authentication Actions ──────────────────────────────────────────────────

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // ── Modal Management ────────────────────────────────────────────────────────

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // ── Provider Value ──────────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      role: user?.role,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
    }),
    [user, loading, isAuthModalOpen, authModalMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook for easy access to the Auth context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};