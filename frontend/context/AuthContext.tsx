'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetcher, post } from '@/lib/api'

interface User {
    id: string
    email: string
    name: string
    plan: 'FREE' | 'BASIC' | 'FAMILY'
}

interface AuthContextType {
    user: User | null
    loading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<any>
    logout: () => void
    fetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchUser = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            setUser(null)
            return
        }

        try {
            const response = await fetcher('/api/auth/me')
            setUser(response.data)
        } catch (error) {
            console.error('Auth error:', error)
            logout()
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const login = async (email: string, password: string) => {
        const response = await post('/api/auth/login', { email, password })
        const { token, user } = response.data
        localStorage.setItem('token', token)
        setUser(user)
        router.push('/dashboard')
        return response
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        setLoading(false)
        router.push('/auth/login')
    }

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
