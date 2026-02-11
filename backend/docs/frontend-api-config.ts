// src/config/api.ts - FRONTEND (móvil y web)
import axios, { AxiosInstance } from 'axios'
import * as SecureStore from 'expo-secure-store'

// Configuración base de la API
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}

// Crear instancia de Axios
export const api: AxiosInstance = axios.create(API_CONFIG)

// Interceptor para añadir token automáticamente
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('userToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.warn('Error al obtener token:', error)
  }
  return config
})

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await SecureStore.deleteItemAsync('userToken')
      // Redirigir al login (esto debe manejarse en el contexto de la app)
      console.warn('Sesión expirada, por favor inicia sesión nuevamente')
    }
    return Promise.reject(error)
  }
)

// Exportar tipos útiles
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Métodos de conveniencia para tokens
export const tokenManager = {
  setToken: async (token: string) => {
    await SecureStore.setItemAsync('userToken', token)
  },
  getToken: async () => {
    return await SecureStore.getItemAsync('userToken')
  },
  removeToken: async () => {
    await SecureStore.deleteItemAsync('userToken')
  }
}

export default api