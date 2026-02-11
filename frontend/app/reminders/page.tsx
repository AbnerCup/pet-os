'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { Bell, Plus, Calendar, Clock, CheckCircle, AlertCircle, Filter, Pill, Stethoscope, Heart } from 'lucide-react'

export default function RemindersPage() {
  const { user } = useAuth()
  const { pets } = usePets()
  const [selectedPet, setSelectedPet] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    petId: '',
    title: '',
    type: '',
    frequency: 'once',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    notes: '',
    isRecurring: false
  })

  // Mock reminders data
  const [reminders] = useState([
    {
      id: '1',
      petId: '1',
      title: 'Vacuna antirrábica',
      type: 'medical',
      frequency: 'yearly',
      date: '2024-02-15',
      time: '10:00',
      notes: 'Recordatorio anual',
      isRecurring: true,
      isActive: true,
      petName: 'Luna'
    },
    {
      id: '2',
      petId: '1',
      title: 'Desparasitación',
      type: 'medical',
      frequency: 'monthly',
      date: '2024-01-25',
      time: '09:00',
      notes: 'Pastilla mensual',
      isRecurring: true,
      isActive: true,
      petName: 'Luna'
    },
    {
      id: '3',
      petId: '2',
      title: 'Baño y corte',
      type: 'grooming',
      frequency: 'monthly',
      date: '2024-01-30',
      time: '14:00',
      notes: 'Estética mensual',
      isRecurring: true,
      isActive: false,
      petName: 'Max'
    },
    {
      id: '4',
      petId: '1',
      title: 'Chequeo veterinario',
      type: 'checkup',
      frequency: 'once',
      date: '2024-01-20',
      time: '11:00',
      notes: 'Control general',
      isRecurring: false,
      isActive: false,
      petName: 'Luna'
    }
  ])

  const reminderTypes = [
    { value: 'medical', label: 'Salud', icon: '💊', color: 'bg-red-500' },
    { value: 'grooming', label: 'Estética', icon: '✂️', color: 'bg-purple-500' },
    { value: 'checkup', label: 'Chequeo', icon: '🩺', color: 'bg-blue-500' },
    { value: 'food', label: 'Alimentación', icon: '🍖', color: 'bg-green-500' },
    { value: 'exercise', label: 'Ejercicio', icon: '🏃', color: 'bg-orange-500' },
    { value: 'other', label: 'Otro', icon: '📝', color: 'bg-gray-500' }
  ]

  const frequencies = [
    { value: 'once', label: 'Una vez' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' }
  ]

  const filteredReminders = reminders.filter(reminder => {
    if (selectedPet && reminder.petId !== selectedPet) return false
    return true
  })

  const stats = {
    total: filteredReminders.length,
    active: filteredReminders.filter(r => r.isActive).length,
    today: filteredReminders.filter(r => {
      const today = new Date().toDateString()
      return new Date(r.date).toDateString() === today
    }).length,
    upcoming: filteredReminders.filter(r => {
      const reminderDate = new Date(r.date)
      const now = new Date()
      return reminderDate > now && reminderDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    }).length
  }

  const getReminderIcon = (type: string) => {
    return reminderTypes.find(t => t.value === type)?.icon || '📝'
  }

  const getReminderColor = (type: string) => {
    return reminderTypes.find(t => t.value === type)?.color || 'bg-gray-500'
  }

  const getReminderLabel = (type: string) => {
    return reminderTypes.find(t => t.value === type)?.label || 'Otro'
  }

  const getFrequencyLabel = (frequency: string) => {
    return frequencies.find(f => f.value === frequency)?.label || 'Una vez'
  }

  const isOverdue = (date: string) => {
    return new Date(date) < new Date()
  }

  const isToday = (date: string) => {
    return new Date(date).toDateString() === new Date().toDateString()
  }

  const isUpcoming = (date: string) => {
    const reminderDate = new Date(date)
    const now = new Date()
    return reminderDate > now && reminderDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Recordatorios</h1>
          <p className="text-stone-600">Gestiona los recordatorios de cuidado de tus mascotas</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Recordatorio
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Total</span>
            <Bell className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.total}</p>
          <p className="text-sm text-stone-500 mt-1">Recordatorios</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Activos</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.active}</p>
          <p className="text-sm text-stone-500 mt-1">En curso</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Hoy</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.today}</p>
          <p className="text-sm text-stone-500 mt-1">Pendientes</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Próximos 7 días</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.upcoming}</p>
          <p className="text-sm text-stone-500 mt-1">Próximos</p>
        </div>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 border border-sage-200 mb-6">
          <h3 className="text-lg font-semibold text-sage-900 mb-4">Nuevo Recordatorio</h3>
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
              <label className="block text-sm font-medium text-stone-700 mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ej: Vacuna, baño, medicación..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full"
              >
                {reminderTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Frecuencia</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full"
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
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
              <label className="block text-sm font-medium text-stone-700 mb-1">Hora</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-stone-700 mb-1">Notas</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Detalles adicionales..."
              className="w-full"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button className="btn-primary">
              Crear Recordatorio
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
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {filteredReminders.map(reminder => {
          const reminderType = reminderTypes.find(t => t.value === reminder.type)
          const overdue = isOverdue(reminder.date)
          const today = isToday(reminder.date)
          const upcoming = isUpcoming(reminder.date)
          
          return (
            <div key={reminder.id} className={`bg-white rounded-2xl p-6 border-2 ${
              overdue ? 'border-red-200 bg-red-50' : 
              today ? 'border-blue-200 bg-blue-50' : 
              upcoming ? 'border-amber-200 bg-amber-50' : 
              'border-sage-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${reminderType?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center text-white text-lg`}>
                    {getReminderIcon(reminder.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-stone-900">{reminder.title}</h3>
                      <span className="text-sm text-stone-500">• {reminder.petName}</span>
                      {reminder.isRecurring && (
                        <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full">
                          {getFrequencyLabel(reminder.frequency)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600 mb-2">{reminder.notes}</p>
                    <div className="flex items-center gap-4 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(reminder.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {reminder.time}
                      </span>
                      <span className="flex items-center gap-1">
                        {getReminderIcon(reminder.type)}
                        {getReminderLabel(reminder.type)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {overdue && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Vencido</span>
                    </div>
                  )}
                  {today && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Bell className="w-4 h-4" />
                      <span className="text-xs font-medium">Hoy</span>
                    </div>
                  )}
                  {upcoming && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Próximo</span>
                    </div>
                  )}
                  <div className={`w-3 h-3 rounded-full ${
                    reminder.isActive ? 'bg-green-500' : 'bg-stone-300'
                  }`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}