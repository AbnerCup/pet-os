'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { Activity, Plus, Calendar, Clock, MapPin, TrendingUp, Heart, Zap, Filter, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react'

// Definir URL base API
const ENV_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const API_URL = ENV_URL.endsWith('/api') ? ENV_URL : `${ENV_URL}/api`

interface ActivityModel {
  id: string
  petId: string
  type: string
  duration: number
  date: string
  notes?: string
  pet: {
    name: string
  }
}

export default function ActivityPage() {
  const { user } = useAuth()
  const { pets } = usePets()

  const [activities, setActivities] = useState<ActivityModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedPet, setSelectedPet] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    petId: '',
    activityType: 'walk',
    duration: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Cargar actividades
  const fetchActivities = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No has iniciado sesión')
        return
      }

      // Obtener últimas 100 actividades
      const res = await fetch(`${API_URL}/activities?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Error al obtener actividades')

      const json = await res.json()
      if (json.success) {
        setActivities(json.data)
        setError(null)
      } else {
        setError(json.error || 'Error desconocido')
      }
    } catch (err) {
      console.error(err)
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  // Crear actividad
  const handleSaveActivity = async () => {
    if (!formData.petId || !formData.duration || !formData.date) {
      alert('Por favor completa los campos requeridos')
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')

      const payload = {
        petId: formData.petId,
        type: formData.activityType,
        duration: Number(formData.duration),
        date: new Date(formData.date).toISOString(), // Convertir a ISO
        notes: formData.notes
      }

      const res = await fetch(`${API_URL}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const json = await res.json()

      if (!res.ok) {
        alert(json.error || 'Error al guardar')
        return
      }

      // Éxito
      setShowAddForm(false)
      setFormData({
        petId: '',
        activityType: 'walk',
        duration: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      })
      fetchActivities() // Recargar lista

    } catch (err) {
      console.error(err)
      alert('Error de conexión al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  // UI Helpers
  const activityTypes = [
    { value: 'walk', label: 'Paseo', icon: '🚶', color: 'bg-blue-500' },
    { value: 'play', label: 'Juego', icon: '🎾', color: 'bg-green-500' },
    { value: 'training', label: 'Entrenamiento', icon: '🎯', color: 'bg-purple-500' },
    { value: 'exercise', label: 'Ejercicio', icon: '💪', color: 'bg-orange-500' },
    { value: 'social', label: 'Socialización', icon: '🐕', color: 'bg-pink-500' },
    { value: 'other', label: 'Otro', icon: '📝', color: 'bg-gray-500' }
  ]

  const getActivityIcon = (type: string) => {
    return activityTypes.find(t => t.value === type)?.icon || '📝'
  }

  const getActivityLabel = (type: string) => {
    return activityTypes.find(t => t.value === type)?.label || 'Otro'
  }

  // Filtrado y Stats
  const filteredActivities = activities.filter(activity => {
    if (selectedPet && activity.petId !== selectedPet) return false

    // Filtro de periodo
    const activityDate = new Date(activity.date)
    const now = new Date()

    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      return activityDate >= weekAgo
    }
    if (selectedPeriod === 'month') {
      return activityDate.getMonth() === now.getMonth() &&
        activityDate.getFullYear() === now.getFullYear()
    }
    if (selectedPeriod === 'year') {
      return activityDate.getFullYear() === now.getFullYear()
    }

    return true
  })

  // Obtener actividades de la semana pasada (independiente del filtro) para la card "Esta Semana"
  const thisWeekCount = activities.filter(a => {
    const activityDate = new Date(a.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return activityDate >= weekAgo
  }).length

  const stats = {
    totalActivities: filteredActivities.length,
    totalDuration: filteredActivities.reduce((sum, a) => sum + a.duration, 0),
    thisWeek: thisWeekCount
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Actividad</h1>
          <p className="text-stone-600">Registra y monitorea la actividad de tus mascotas</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Registrar Actividad
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Total actividades</span>
            <Activity className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.totalActivities}</p>
          <p className="text-sm text-stone-500 mt-1">Registradas</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Tiempo total</span>
            <Clock className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.totalDuration}min</p>
          <p className="text-sm text-stone-500 mt-1">De actividad</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Actualizar</span>
            <button onClick={fetchActivities} title="Recargar">
              <RefreshCw className={`w-5 h-5 text-stone-400 hover:text-sage-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            {loading ? 'Cargando...' : 'Datos actualizados'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Esta semana</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.thisWeek}</p>
          <p className="text-sm text-stone-500 mt-1">Actividades recientes</p>
        </div>
      </div>

      {/* Add Activity Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 border border-sage-200 mb-6 shadow-md animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-sage-900 mb-4">Registrar Nueva Actividad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Mascota</label>
              <select
                value={formData.petId}
                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                className="w-full"
              >
                <option value="">Seleccionar...</option>
                {pets?.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de actividad</label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                className="w-full"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Duración (minutos)</label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Notas</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detalles de la actividad..."
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveActivity}
              disabled={isSubmitting}
              className="btn-primary px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Actividad'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-sage-200 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sage-900">Filtros</h2>
          <Filter className="w-5 h-5 text-stone-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Mascota</label>
            <select
              value={selectedPet}
              onChange={(e) => setSelectedPet(e.target.value)}
              className="w-full"
            >
              <option value="">Todas las mascotas</option>
              {pets?.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Período</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="year">Último año</option>
              <option value="all">Todos los tiempos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity by Type */}
        <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-sage-900">Por Tipo</h2>
            <BarChart3 className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-4">
            {activities.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin datos de actividades</p>
            )}

            {activityTypes.map(type => {
              const count = activities.filter(a => a.type === type.value).length
              const percentage = activities.length > 0 ? (count / activities.length * 100).toFixed(1) : '0'
              if (count === 0) return null

              return (
                <div key={type.value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getActivityIcon(type.value)}</span>
                      <span className="text-sm font-medium text-stone-700">{type.label}</span>
                    </div>
                    <span className="text-sm font-bold text-sage-900">{count}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div
                      className={`${type.color} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-500 text-right">{percentage}%</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
          <h2 className="text-lg font-semibold text-sage-900 mb-4">Actividades Recientes</h2>
          <div className="space-y-3">
            {filteredActivities.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p>No hay actividades registradas.</p>
              </div>
            )}

            {filteredActivities.map(activity => {
              const activityType = activityTypes.find(t => t.value === activity.type)
              return (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-sage-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${activityType?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center text-white text-lg`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">
                        {getActivityLabel(activity.type)} • {activity.pet?.name || 'Mascota'}
                      </p>
                      <p className="text-sm text-stone-500">{activity.notes || 'Sin notas'}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.duration}min
                        </span>

                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}