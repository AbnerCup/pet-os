import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { authApi } from '../api/endpoints';
import { logger } from '../utils/logger';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          // El backend devuelve { success: true, data: { user, token } }
          const { user, token, refreshToken } = response.data.data;

          if (token) {
            await SecureStore.setItemAsync('auth_token', token);
          }
          if (refreshToken) {
            await SecureStore.setItemAsync('refresh_token', refreshToken);
          }

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          logger.error('Login error details', { 
            error: error.response?.data,
            email 
          });
          set({
            error: error.response?.data?.error || error.response?.data?.message || 'Error al iniciar sesión',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        try {
          const token = await SecureStore.getItemAsync('auth_token');
          if (!token) {
            set({ isAuthenticated: false });
            return;
          }

          const response = await authApi.me();
          set({
            user: response.data.data,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          await SecureStore.deleteItemAsync('auth_token');
          set({ isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
