// ============================================
// REACT HOOKS PERSONALIZADOS PARA PET-OS
// ============================================
// Estos hooks facilitan el uso de los servicios en componentes React

import { useState, useEffect, useCallback } from 'react'
import {
    authService,
    petsService,
    healthService,
    expensesService,
    activitiesService,
    locationService,
    User,
    Pet,
    HealthRecord,
    Expense,
    Activity,
    LocationLog
} from '../services' // Ajusta la ruta según tu estructura

// ============================================
// useAuth - Manejo de autenticación
// ============================================

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Cargar perfil del usuario al montar
    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setError(null)

            if (authService.isAuthenticated()) {
                const response = await authService.getProfile()
                if (response.success) {
                    setUser(response.data!)
                }
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            setLoading(true)
            setError(null)

            const response = await authService.login({ email, password })

            if (response.success) {
                setUser(response.data!.user)
                return { success: true }
            } else {
                setError(response.error || 'Error al iniciar sesión')
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message
            setError(errorMsg)
            return { success: false, error: errorMsg }
        } finally {
            setLoading(false)
        }
    }

    const register = async (data: {
        name: string
        email: string
        password: string
        phone?: string
    }) => {
        try {
            setLoading(true)
            setError(null)

            const response = await authService.register(data)

            if (response.success) {
                setUser(response.data!.user)
                return { success: true }
            } else {
                setError(response.error || 'Error al registrarse')
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message
            setError(errorMsg)
            return { success: false, error: errorMsg }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        authService.logout()
        setUser(null)
    }

    const updateProfile = async (data: Partial<User>) => {
        try {
            setLoading(true)
            setError(null)

            const response = await authService.updateProfile(data)

            if (response.success) {
                setUser(response.data!)
                return { success: true }
            } else {
                setError(response.error || 'Error al actualizar perfil')
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message
            setError(errorMsg)
            return { success: false, error: errorMsg }
        } finally {
            setLoading(false)
        }
    }

    return {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refresh: loadProfile,
        isAuthenticated: !!user
    }
}

// ============================================
// usePets - Manejo de mascotas
// ============================================

export function usePets() {
    const [pets, setPets] = useState<Pet[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadPets()
    }, [])

    const loadPets = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await petsService.getPets()

            if (response.success) {
                setPets(response.data || [])
            } else {
                setError(response.error || 'Error al cargar mascotas')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addPet = async (petData: Pet) => {
        try {
            const response = await petsService.createPet(petData)

            if (response.success) {
                await loadPets()
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const updatePet = async (id: string, petData: Partial<Pet>) => {
        try {
            const response = await petsService.updatePet(id, petData)

            if (response.success) {
                await loadPets()
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const deletePet = async (id: string) => {
        try {
            const response = await petsService.deletePet(id)

            if (response.success) {
                await loadPets()
                return { success: true }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    return {
        pets,
        loading,
        error,
        addPet,
        updatePet,
        deletePet,
        refresh: loadPets
    }
}

// ============================================
// useHealthRecords - Manejo de registros médicos
// ============================================

export function useHealthRecords(petId?: string) {
    const [records, setRecords] = useState<HealthRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadRecords()
    }, [petId])

    const loadRecords = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await healthService.getHealthRecords({ petId })

            if (response.success) {
                setRecords(response.data || [])
            } else {
                setError(response.error || 'Error al cargar registros')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addRecord = async (recordData: HealthRecord) => {
        try {
            const response = await healthService.createHealthRecord(recordData)

            if (response.success) {
                await loadRecords()
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const updateRecord = async (id: string, recordData: Partial<HealthRecord>) => {
        try {
            const response = await healthService.updateHealthRecord(id, recordData)

            if (response.success) {
                await loadRecords()
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const deleteRecord = async (id: string) => {
        try {
            const response = await healthService.deleteHealthRecord(id)

            if (response.success) {
                await loadRecords()
                return { success: true }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const upcomingAppointments = records.filter(record => {
        if (!record.nextDate || record.status !== 'pending') return false
        return new Date(record.nextDate) > new Date()
    }).sort((a, b) =>
        new Date(a.nextDate!).getTime() - new Date(b.nextDate!).getTime()
    )

    return {
        records,
        upcomingAppointments,
        loading,
        error,
        addRecord,
        updateRecord,
        deleteRecord,
        refresh: loadRecords
    }
}

// ============================================
// useExpenses - Manejo de gastos
// ============================================

export function useExpenses(petId?: string) {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadExpenses()
    }, [petId])

    const loadExpenses = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await expensesService.getExpenses({ petId })

            if (response.success) {
                setExpenses(response.data || [])
            } else {
                setError(response.error || 'Error al cargar gastos')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addExpense = async (expenseData: Expense) => {
        try {
            const response = await expensesService.createExpense(expenseData)

            if (response.success) {
                await loadExpenses()
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
        try {
            const response = await expensesService.updateExpense(id, expenseData)

            if (response.success) {
                await loadExpenses()
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const deleteExpense = async (id: string) => {
        try {
            const response = await expensesService.deleteExpense(id)

            if (response.success) {
                await loadExpenses()
                return { success: true }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    // Calcular total
    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

    // Agrupar por categoría
    const byCategory = expenses.reduce((acc, expense) => {
        const category = expense.category
        acc[category] = (acc[category] || 0) + Number(expense.amount)
        return acc
    }, {} as Record<string, number>)

    return {
        expenses,
        total,
        byCategory,
        loading,
        error,
        addExpense,
        updateExpense,
        deleteExpense,
        refresh: loadExpenses
    }
}

// ============================================
// useActivities - Manejo de actividades
// ============================================

export function useActivities(petId?: string) {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadActivities()
    }, [petId])

    const loadActivities = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await activitiesService.getActivities({ petId })

            if (response.success) {
                setActivities(response.data || [])
            } else {
                setError(response.error || 'Error al cargar actividades')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addActivity = async (activityData: Activity) => {
        try {
            const response = await activitiesService.createActivity(activityData)

            if (response.success) {
                await loadActivities()
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const updateActivity = async (id: string, activityData: Partial<Activity>) => {
        try {
            const response = await activitiesService.updateActivity(id, activityData)

            if (response.success) {
                await loadActivities()
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const deleteActivity = async (id: string) => {
        try {
            const response = await activitiesService.deleteActivity(id)

            if (response.success) {
                await loadActivities()
                return { success: true }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    // Calcular total de minutos
    const totalMinutes = activities.reduce((sum, activity) => sum + activity.duration, 0)

    return {
        activities,
        totalMinutes,
        loading,
        error,
        addActivity,
        updateActivity,
        deleteActivity,
        refresh: loadActivities
    }
}

// ============================================
// useLocation - Rastreo de ubicación
// ============================================

export function useLocation(petId?: string) {
    const [locations, setLocations] = useState<LocationLog[]>([])
    const [lastLocation, setLastLocation] = useState<LocationLog | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (petId) {
            loadLocations()
            loadLastLocation()
        }
    }, [petId])

    const loadLocations = async () => {
        if (!petId) return

        try {
            setLoading(true)
            setError(null)

            const response = await locationService.getLocationLogs({ petId })

            if (response.success) {
                setLocations(response.data || [])
            } else {
                setError(response.error || 'Error al cargar ubicaciones')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const loadLastLocation = async () => {
        if (!petId) return

        try {
            const location = await locationService.getLastKnownLocation(petId)
            setLastLocation(location)
        } catch (err: any) {
            console.error('Error al cargar última ubicación:', err)
        }
    }

    const addLocation = async (locationData: LocationLog) => {
        try {
            const response = await locationService.createLocationLog(locationData)

            if (response.success) {
                await loadLocations()
                await loadLastLocation()
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response.error }
            }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    return {
        locations,
        lastLocation,
        loading,
        error,
        addLocation,
        refresh: loadLocations
    }
}
