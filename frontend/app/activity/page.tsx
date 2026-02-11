'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { Activity, Plus, Calendar, Clock, MapPin, TrendingUp, Heart, Zap, Filter, BarChart3 } from 'lucide-react'

export default function ActivityPage() {
  const { user } = useAuth()
  const { pets } = usePets()
  const [selectedPet, setSelectedPet] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    petId: '',
    activityType: '',
    duration: '',
    distance: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Mock activity data
  const [activities] = useState([
    {
      id: '1',
      petId: '1',
      type: 'walk',
      duration: 30,
      distance: 2.5,
      notes: 'Paseo por el parque',
      date: '2024-01-20T10:00:00',
      petName: 'Luna'
    },
    {
      id: '2',
      petId: '1',
      type: 'play',
      duration: 45,
      distance: 0,
      notes: 'Juego en el jardín',
      date: '2024-01-19T16:30:00',
      petName: 'Luna'
    },
    {
      id: '3',
      petId: '2',
      type: 'walk',
      duration: 20,
      distance: 1.2,
      notes: 'Paseo corto',
      date: '2024-01-19T08:00:00',
      petName: 'Max'
    },
    {
      id: '4',
      petId: '1',
      type: 'training',
      duration: 25,
      distance: 0,
      notes: 'Sesión de entrenamiento',
      date: '2024-01-18T14:00:00',
      petName: 'Luna'
    }
  ])

  const activityTypes = [
    { value: 'walk', label: 'Paseo', icon: '🚶', color: 'bg-blue-500' },
    { value: 'play', label: 'Juego', icon: '🎾', color: 'bg-green-500' },
    { value: 'training', label: 'Entrenamiento', icon: '🎯', color: 'bg-purple-500' },
    { value: 'exercise', label: 'Ejercicio', icon: '💪', color: 'bg-orange-500' },
    { value: 'social', label: 'Socialización', icon: '🐕', color: 'bg-pink-500' },
    { value: 'other', label: 'Otro', icon: '📝', color: 'bg-gray-500' }
  ]

  const filteredActivities = activities.filter(activity => {
    if (selectedPet && activity.petId !== selectedPet) return false
    return true
  })

  const stats = {
    totalActivities: filteredActivities.length,
    totalDuration: filteredActivities.reduce((sum, a) => sum + a.duration, 0),
    totalDistance: filteredActivities.reduce((sum, a) => sum + (a.distance || 0), 0),
    thisWeek: filteredActivities.filter(a => {
      const activityDate = new Date(a.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return activityDate >= weekAgo
    }).length
  }

  const getActivityIcon = (type: string) => {
    return activityTypes.find(t => t.value === type)?.icon || '📝'
  }

  const getActivityColor = (type: string) => {
    return activityTypes.find(t => t.value === type)?.color || 'bg-gray-500'
  }

  const getActivityLabel = (type: string) => {
    return activityTypes.find(t => t.value === type)?.label || 'Otro'
  }

  return (
    <div className="max-w-6xl mx-auto">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Total actividades</span>
            <Activity className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.totalActivities}</p>
          <p className="text-sm text-stone-500 mt-1">Registradas</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Tiempo total</span>
            <Clock className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.totalDuration}min</p>
          <p className="text-sm text-stone-500 mt-1">De actividad</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Distancia</span>
            <MapPin className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.totalDistance.toFixed(1)}km</p>
          <p className="text-sm text-stone-500 mt-1">Recorrida</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Esta semana</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.thisWeek}</p>
          <p className="text-sm text-stone-500 mt-1">Actividades</p>
        </div>
      </div>

      {/* Add Activity Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 border border-sage-200 mb-6">
          <h3 className="text-lg font-semibold text-sage-900 mb-4">Registrar Nueva Actividad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Mascota</label>
              <select
                value={formData.petId}
                onChange={(e) => setFormData({...formData, petId: e.target.value})}
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
                onChange={(e) => setFormData({...formData, activityType: e.target.value})}
                className="w-full"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Duración (minutos)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="30"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Distancia (km)</label>
              <input
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => setFormData({...formData, distance: e.target.value})}
                placeholder="2.5"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Notas</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Detalles de la actividad..."
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button className="btn-primary">
              Guardar Actividad
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-sage-200 mb-6">
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
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-sage-900">Por Tipo</h2>
            <BarChart3 className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-4">
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
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-sage-200">
          <h2 className="text-lg font-semibold text-sage-900 mb-4">Actividades Recientes</h2>
          <div className="space-y-3">
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
                        {getActivityLabel(activity.type)} • {activity.petName}
                      </p>
                      <p className="text-sm text-stone-500">{activity.notes}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.duration}min
                        </span>
                        {activity.distance > 0 && (
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.distance}km
                          </span>
                        )}
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Heart className="w-5 h-5 text-red-500" />
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(activity.date).toLocaleTimeString()}
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