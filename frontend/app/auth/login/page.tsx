'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { PawPrint, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(formData.email, formData.password)
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sage-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-sage-900">Bienvenido de vuelta</h1>
          <p className="text-stone-600">Inicia sesión en Pet OS</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-sage-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-600">
            <p>Usuarios de prueba:</p>
            <p className="mt-1">free@test.com / 123456</p>
            <p>basic@test.com / 123456</p>
            <p>family@test.com / 123456</p>
          </div>
        </div>

        <p className="text-center mt-6 text-stone-600">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="text-sage-600 font-semibold hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}
