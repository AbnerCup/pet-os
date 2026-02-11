'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { post, fetcher } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  plan: 'FREE' | 'BASIC' | 'FAMILY'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetcher('/api/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('Iniciando login con:', email)
      const response = await post('/api/auth/login', { email, password })
      console.log('Login exitoso:', response)

      const { token, user } = response.data

      localStorage.setItem('token', token)
      console.log('Token guardado')

      setUser(user)
      console.log('Usuario establecido:', user)

      console.log('Redirigiendo a dashboard...')
      router.push('/dashboard')

      return response
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  }

  const register = async (userData: any) => {
    return post('/api/auth/register', userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/auth/login')
  }

  const upgradePlan = async (newPlan: string) => {
    // Simulate plan upgrade
    setUser(prev => prev ? { ...prev, plan: newPlan as 'FREE' | 'BASIC' | 'FAMILY' } : null)
    return Promise.resolve()
  }

  return { user, loading, login, register, logout, upgradePlan, isAuthenticated: !!user }
}