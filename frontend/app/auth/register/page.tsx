'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { PawPrint, Eye, EyeOff, Loader2, User, Mail, Lock, Phone } from 'lucide-react'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const { register, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sage-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-sage-900">Crear cuenta</h1>
          <p className="text-stone-600">Únete a Pet OS</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-sage-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono (opcional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="tel"
                  placeholder="+591 70000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
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

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-stone-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-sage-600 font-semibold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}