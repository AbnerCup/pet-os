// ============================================
// CONFIGURACIÓN COMPLETA DE API
// Para Web (React / Next.js / Vite)
// ============================================

import axios, { AxiosInstance, AxiosError } from 'axios'
import Cookies from 'js-cookie'

// ============================================
// CONFIGURACIÓN
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const API_CONFIG = {
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
}

// ============================================
// INSTANCIA DE AXIOS
// ============================================

export const api: AxiosInstance = axios.create(API_CONFIG)

// ============================================
// INTERCEPTOR DE REQUEST (Agregar Token)
// ============================================

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('userToken')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Log de requests en desarrollo
        if (import.meta.env.DEV) {
            console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
            if (config.data) {
                console.log('📦 Data:', config.data)
            }
        }

        return config
    },
    (error) => {
        console.error('❌ Error en request interceptor:', error)
        return Promise.reject(error)
    }
)

// ============================================
// INTERCEPTOR DE RESPONSE (Manejo de Errores)
// ============================================

api.interceptors.response.use(
    (response) => {
        // Log de responses exitosas en desarrollo
        if (import.meta.env.DEV) {
            console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`)
            console.log('📥 Response:', response.data)
        }

        return response
    },
    (error: AxiosError) => {
        // Log de errores
        if (import.meta.env.DEV) {
            console.error('❌ API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                data: error.response?.data
            })
        }

        // Manejo de errores específicos
        if (error.response) {
            const status = error.response.status

            switch (status) {
                case 401:
                    // Token expirado o inválido
                    console.warn('🔒 Sesión expirada')
                    Cookies.remove('userToken')

                    // Redirigir al login (solo si no estamos ya en login)
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login'
                    }
                    break

                case 403:
                    // Sin permisos (ej: plan insuficiente)
                    console.warn('🚫 Acceso denegado')
                    break

                case 404:
                    // Recurso no encontrado
                    console.warn('🔍 Recurso no encontrado')
                    break

                case 429:
                    // Rate limit excedido
                    console.warn('⏱️ Demasiadas peticiones, intenta más tarde')
                    break

                case 500:
                case 502:
                case 503:
                    // Error del servidor
                    console.error('🔥 Error del servidor')
                    break
            }
        } else if (error.request) {
            // Request hecho pero sin respuesta
            console.error('📡 Sin respuesta del servidor')
        } else {
            // Error al configurar el request
            console.error('⚙️ Error de configuración:', error.message)
        }

        return Promise.reject(error)
    }
)

// ============================================
// TIPOS DE RESPUESTA
// ============================================

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

// ============================================
// UTILIDADES
// ============================================

/**
 * Manejo de errores de API
 */
export function handleApiError(error: any): string {
    if (error.response?.data?.error) {
        return error.response.data.error
    }

    if (error.response?.data?.message) {
        return error.response.data.message
    }

    if (error.message) {
        return error.message
    }

    return 'Error desconocido'
}

/**
 * Verificar si hay conexión a internet
 */
export async function checkConnection(): Promise<boolean> {
    try {
        const response = await api.get('/api/health-check', { timeout: 5000 })
        return response.data.success === true
    } catch (error) {
        return false
    }
}

/**
 * Token Manager
 */
export const tokenManager = {
    setToken(token: string): void {
        Cookies.set('userToken', token, {
            expires: 7, // 7 días
            secure: import.meta.env.PROD, // Solo HTTPS en producción
            sameSite: 'strict'
        })
    },

    getToken(): string | undefined {
        return Cookies.get('userToken')
    },

    removeToken(): void {
        Cookies.remove('userToken')
    },

    hasToken(): boolean {
        return !!this.getToken()
    }
}

// ============================================
// EXPORTAR
// ============================================

export default api
