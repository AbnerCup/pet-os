import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// URL de producción en Railway
const PRODUCTION_API_URL = 'https://pet-os-production.up.railway.app/api';

// URL de desarrollo local
const DEV_API_URL = 'http://192.168.1.38:3001/api';

const getBaseURL = () => {
  if (__DEV__) {
    return DEV_API_URL;
  }
  return PRODUCTION_API_URL;
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
