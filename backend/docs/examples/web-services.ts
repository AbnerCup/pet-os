// ============================================
// SERVICIOS COMPLETOS PARA WEB (React/Next.js/Vite)
// ============================================

import api, { ApiResponse } from '../config/api'
import Cookies from 'js-cookie'

// ============================================
// TIPOS Y INTERFACES (Idénticos a mobile)
// ============================================

export interface User {
    id: string
    email: string
    phone?: string
    name: string
    plan: 'FREE' | 'BASIC' | 'FAMILY'
    planExpiresAt?: string
    createdAt: string
    updatedAt: string
}

export interface Pet {
    id?: string
    name: string
    species: string
    breed?: string
    birthDate?: string
    weight?: number
    photoUrl?: string
    userId?: string
    createdAt?: string
}

export interface HealthRecord {
    id?: string
    petId: string
    type: string
    title: string
    date: string
    nextDate?: string
    vetName?: string
    notes?: string
    status?: 'pending' | 'completed'
    createdAt?: string
}

export interface Expense {
    id?: string
    petId: string
    userId?: string
    category: string
    amount: number
    date: string
    description?: string
}

export interface Activity {
    id?: string
    petId: string
    type: string
    duration: number
    date: string
    notes?: string
}

export interface LocationLog {
    id?: string
    petId: string
    latitude: number
    longitude: number
    accuracy?: number
    battery?: number
    timestamp?: string
}

// ============================================
// AUTH SERVICE
// ============================================

export const authService = {
    /**
     * Registrar nuevo usuario
     */
    async register(data: {
        name: string
        email: string
        password: string
        phone?: string
        plan?: 'FREE' | 'BASIC' | 'FAMILY'
    }): Promise<ApiResponse<{ user: User; token: string }>> {
        const response = await api.post('/api/auth/register', data)

        if (response.data.success && response.data.data?.token) {
            Cookies.set('userToken', response.data.data.token, {
                expires: 7, // 7 días
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
        }

        return response.data
    },

    /**
     * Iniciar sesión
     */
    async login(data: {
        email: string
        password: string
    }): Promise<ApiResponse<{ user: User; token: string }>> {
        const response = await api.post('/api/auth/login', data)

        if (response.data.success && response.data.data?.token) {
            Cookies.set('userToken', response.data.data.token, {
                expires: 7,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
        }

        return response.data
    },

    /**
     * Obtener perfil del usuario actual
     */
    async getProfile(): Promise<ApiResponse<User>> {
        const response = await api.get('/api/auth/me')
        return response.data
    },

    /**
     * Actualizar perfil del usuario
     */
    async updateProfile(data: {
        name?: string
        email?: string
        phone?: string
        password?: string
    }): Promise<ApiResponse<User>> {
        const response = await api.put('/api/auth/me', data)
        return response.data
    },

    /**
     * Cerrar sesión
     */
    logout(): void {
        Cookies.remove('userToken')
    },

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        return !!Cookies.get('userToken')
    },

    /**
     * Obtener token actual
     */
    getToken(): string | undefined {
        return Cookies.get('userToken')
    }
}

// ============================================
// PETS SERVICE
// ============================================

export const petsService = {
    async getPets(): Promise<ApiResponse<Pet[]>> {
        const response = await api.get('/api/pets')
        return response.data
    },

    async createPet(data: Pet): Promise<ApiResponse<Pet>> {
        const response = await api.post('/api/pets', data)
        return response.data
    },

    async getPetById(id: string): Promise<ApiResponse<Pet>> {
        const response = await api.get(`/api/pets/${id}`)
        return response.data
    },

    async updatePet(id: string, data: Partial<Pet>): Promise<ApiResponse<Pet>> {
        const response = await api.put(`/api/pets/${id}`, data)
        return response.data
    },

    async deletePet(id: string): Promise<ApiResponse> {
        const response = await api.delete(`/api/pets/${id}`)
        return response.data
    }
}

// ============================================
// HEALTH SERVICE
// ============================================

export const healthService = {
    async getHealthRecords(params?: {
        petId?: string
        status?: 'pending' | 'completed'
        limit?: number
        offset?: number
    }): Promise<ApiResponse<HealthRecord[]>> {
        const response = await api.get('/api/health', { params })
        return response.data
    },

    async createHealthRecord(data: HealthRecord): Promise<ApiResponse<HealthRecord>> {
        const response = await api.post('/api/health', data)
        return response.data
    },

    async getHealthRecordById(id: string): Promise<ApiResponse<HealthRecord>> {
        const response = await api.get(`/api/health/${id}`)
        return response.data
    },

    async updateHealthRecord(id: string, data: Partial<HealthRecord>): Promise<ApiResponse<HealthRecord>> {
        const response = await api.put(`/api/health/${id}`, data)
        return response.data
    },

    async deleteHealthRecord(id: string): Promise<ApiResponse> {
        const response = await api.delete(`/api/health/${id}`)
        return response.data
    },

    async getUpcomingAppointments(petId?: string): Promise<ApiResponse<HealthRecord[]>> {
        const response = await this.getHealthRecords({ petId, status: 'pending' })

        if (response.success && response.data) {
            const upcoming = response.data.filter(record => {
                if (!record.nextDate) return false
                return new Date(record.nextDate) > new Date()
            })

            upcoming.sort((a, b) =>
                new Date(a.nextDate!).getTime() - new Date(b.nextDate!).getTime()
            )

            return { ...response, data: upcoming }
        }

        return response
    }
}

// ============================================
// EXPENSES SERVICE
// ============================================

export const expensesService = {
    async getExpenses(params?: {
        petId?: string
        limit?: number
        offset?: number
    }): Promise<ApiResponse<Expense[]>> {
        const response = await api.get('/api/expenses', { params })
        return response.data
    },

    async createExpense(data: Expense): Promise<ApiResponse<Expense>> {
        const response = await api.post('/api/expenses', data)
        return response.data
    },

    async getExpenseById(id: string): Promise<ApiResponse<Expense>> {
        const response = await api.get(`/api/expenses/${id}`)
        return response.data
    },

    async updateExpense(id: string, data: Partial<Expense>): Promise<ApiResponse<Expense>> {
        const response = await api.put(`/api/expenses/${id}`, data)
        return response.data
    },

    async deleteExpense(id: string): Promise<ApiResponse> {
        const response = await api.delete(`/api/expenses/${id}`)
        return response.data
    },

    async getTotalByPet(petId: string): Promise<number> {
        const response = await this.getExpenses({ petId })

        if (response.success && response.data) {
            return response.data.reduce((total, expense) =>
                total + Number(expense.amount), 0
            )
        }

        return 0
    },

    async getExpensesByCategory(petId?: string): Promise<Record<string, number>> {
        const response = await this.getExpenses({ petId })

        if (response.success && response.data) {
            return response.data.reduce((acc, expense) => {
                const category = expense.category
                acc[category] = (acc[category] || 0) + Number(expense.amount)
                return acc
            }, {} as Record<string, number>)
        }

        return {}
    }
}

// ============================================
// ACTIVITIES SERVICE
// ============================================

export const activitiesService = {
    async getActivities(params?: {
        petId?: string
        type?: string
        dateFrom?: string
        dateTo?: string
        limit?: number
        offset?: number
    }): Promise<ApiResponse<Activity[]>> {
        const response = await api.get('/api/activities', { params })
        return response.data
    },

    async createActivity(data: Activity): Promise<ApiResponse<Activity>> {
        const response = await api.post('/api/activities', data)
        return response.data
    },

    async updateActivity(id: string, data: Partial<Activity>): Promise<ApiResponse<Activity>> {
        const response = await api.put(`/api/activities/${id}`, data)
        return response.data
    },

    async deleteActivity(id: string): Promise<ApiResponse> {
        const response = await api.delete(`/api/activities/${id}`)
        return response.data
    },

    async getTotalActivityMinutes(petId: string, dateFrom?: string, dateTo?: string): Promise<number> {
        const response = await this.getActivities({ petId, dateFrom, dateTo })

        if (response.success && response.data) {
            return response.data.reduce((total, activity) =>
                total + activity.duration, 0
            )
        }

        return 0
    }
}

// ============================================
// LOCATION SERVICE
// ============================================

export const locationService = {
    async getLocationLogs(params?: {
        petId?: string
        limit?: number
        offset?: number
    }): Promise<ApiResponse<LocationLog[]>> {
        const response = await api.get('/api/location', { params })
        return response.data
    },

    async createLocationLog(data: LocationLog): Promise<ApiResponse<LocationLog>> {
        const response = await api.post('/api/location', data)
        return response.data
    },

    async getLastKnownLocation(petId: string): Promise<LocationLog | null> {
        const response = await this.getLocationLogs({ petId, limit: 1 })

        if (response.success && response.data && response.data.length > 0) {
            return response.data[0]
        }

        return null
    }
}

// ============================================
// HEALTH CHECK
// ============================================

export const healthCheckService = {
    async check(): Promise<ApiResponse> {
        const response = await api.get('/api/health-check')
        return response.data
    }
}

// ============================================
// EXPORTAR TODO
// ============================================

export default {
    auth: authService,
    pets: petsService,
    health: healthService,
    expenses: expensesService,
    activities: activitiesService,
    location: locationService,
    healthCheck: healthCheckService
}
