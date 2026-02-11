import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Configura tu IP local para desarrollo
const getBaseURL = () => {
  if (__DEV__) {
    // Android emulator usa 10.0.2.2, iOS simulator usa localhost
    return 'http://192.168.1.38:3001/api';
  }
  return 'https://tu-api-produccion.com/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, logout
      await SecureStore.deleteItemAsync('auth_token');
      // Aquí podrías navegar al login
    }
    return Promise.reject(error);
  }
);

export default api;
