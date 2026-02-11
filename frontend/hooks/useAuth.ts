'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { post } from '@/lib/api'

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
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        const user = await res.json()
        setUser(user)
      } else {
        logout()
      }
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('Iniciando login con:', email)
      const data = await post('/api/auth/login', { email, password })
      console.log('Login exitoso:', data)
      
      localStorage.setItem('token', data.token)
      console.log('Token guardado')
      
      setUser(data.user)
      console.log('Usuario establecido:', data.user)
      
      console.log('Redirigiendo a dashboard...')
      router.push('/dashboard')
      
      return data
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