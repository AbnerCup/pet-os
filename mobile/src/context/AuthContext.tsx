import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { authApi } from '../api/endpoints';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const response = await authApi.me();
        setUser(response.data);
      }
    } catch (error) {
      logger.error('Auth check failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const { user, token, refreshToken } = response.data;

    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('refresh_token', refreshToken);

    setUser(user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
