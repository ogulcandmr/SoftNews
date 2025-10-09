import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is already logged in
        if (authService.isAuthenticated) {
          // Verify token is still valid
          const isValid = await authService.verifyToken();
          if (isValid) {
            setUser(authService.currentUser);
            setIsAuthenticated(true);
          } else {
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Authentication initialization failed');
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const handleAuthChange = (event) => {
      const { user: newUser, isAuthenticated: newIsAuthenticated } = event.detail;
      setUser(newUser);
      setIsAuthenticated(newIsAuthenticated);
      setError(null);
    };

    window.addEventListener('softnews_auth_change', handleAuthChange);

    return () => {
      window.removeEventListener('softnews_auth_change', handleAuthChange);
    };
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.login(email, password);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.updateProfile(profileData);
      setUser(response.data.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    // Helper methods
    validateEmail: authService.validateEmail,
    validatePassword: authService.validatePassword,
    getPasswordStrength: authService.getPasswordStrength
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
