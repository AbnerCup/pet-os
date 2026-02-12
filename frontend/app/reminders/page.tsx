'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { useReminders } from '@/hooks/useReminders'
import { Bell, Plus, Calendar, Clock, CheckCircle, AlertCircle, Filter, Trash2, Loader2 } from 'lucide-react'

export default function RemindersPage() {
  const { user } = useAuth()
  const { pets } = usePets()
  const { reminders, isLoading, createReminder, updateStatus, deleteReminder } = useReminders()
  const [selectedPet, setSelectedPet] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    petId: '',
    title: '',
    type: 'medical',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    notes: '',
    isRecurring: false,
    frequencyMonths: 0
  })

  const reminderTypes = [
    { value: 'medical', label: 'Salud', icon: '💊', color: 'bg-red-500' },
    { value: 'grooming', label: 'Estética', icon: '✂️', color: 'bg-purple-500' },
    { value: 'checkup', label: 'Chequeo', icon: '🩺', color: 'bg-blue-500' },
    { value: 'food', label: 'Alimentación', icon: '🍖', color: 'bg-green-500' },
    { value: 'exercise', label: 'Ejercicio', icon: '🏃', color: 'bg-orange-500' },
    { value: 'other', label: 'Otro', icon: '📝', color: 'bg-gray-500' },
    { value: 'VACUNA', label: 'Vacuna', icon: '💉', color: 'bg-blue-600' },
    { value: 'DESPARASITACION', label: 'Desparasitación', icon: '🦠', color: 'bg-green-600' },
    { value: 'HIGIENE', label: 'Higiene', icon: '🧼', color: 'bg-cyan-500' },
    { value: 'CASTRACION', label: 'Esterilización', icon: '✂️', color: 'bg-pink-500' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.petId || !formData.title) return

    setIsSubmitting(true)
    try {
      await createReminder({
        ...formData,
        dueDate: `${formData.date}T${formData.time}:00.000Z`,
        frequencyMonths: formData.isRecurring ? formData.frequencyMonths : null
      })
      setShowAddForm(false)
      setFormData({
        petId: '',
        title: '',
        type: 'medical',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        notes: '',
        isRecurring: false,
        frequencyMonths: 0
      })
    } catch (error) {
      console.error(error)
      alert('Error al crear el recordatorio')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este recordatorio?')) {
      await deleteReminder(id)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PENDIENTE' ? 'COMPLETADO' : 'PENDIENTE'
    await updateStatus(id, newStatus)
  }

  const filteredReminders = reminders.filter((reminder: any) => {
    if (selectedPet && reminder.petId !== selectedPet) return false
    return true
  })

  const isOverdue = (date: string) => new Date(date) < new Date() && !isToday(date)
  const isToday = (date: string) => new Date(date).toDateString() === new Date().toDateString()

  const stats = {
    total: filteredReminders.length,
    pending: filteredReminders.filter((r: any) => r.status === 'PENDIENTE').length,
    today: filteredReminders.filter((r: any) => isToday(r.dueDate)).length,
    completed: filteredReminders.filter((r: any) => r.status === 'COMPLETADO').length
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
        <p className="mt-4 text-stone-600">Cargando recordatorios...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-sage-900">Recordatorios</h1>
          <p className="text-stone-600 mt-1">Sigue el plan de salud de tus mascotas</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Recordatorio
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} icon={Bell} color="text-stone-600" />
        <StatCard label="Pendientes" value={stats.pending} icon={Clock} color="text-amber-600" />
        <StatCard label="Para Hoy" value={stats.today} icon={Calendar} color="text-blue-600" />
        <StatCard label="Completados" value={stats.completed} icon={CheckCircle} color="text-green-600" />
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-sage-900 mb-6">Nuevo Recordatorio</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Mascota</label>
              <select
                required
                value={formData.petId}
                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                className="w-full rounded-xl border-stone-200 focus:ring-sage-500 focus:border-sage-500"
              >
                <option value="">Seleccionar mascota...</option>
                {pets?.map((pet: any) => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Título</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Vacuna Rabia"
                className="w-full rounded-xl border-stone-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl border-stone-200"
              >
                {reminderTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Fecha</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-xl border-stone-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Hora</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full rounded-xl border-stone-200"
              />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="rounded text-sage-600 focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-stone-700">¿Es recurrente?</span>
              </label>
            </div>
            {formData.isRecurring && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-stone-700">Frecuencia (meses)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.frequencyMonths}
                  onChange={(e) => setFormData({ ...formData, frequencyMonths: parseInt(e.target.value) })}
                  className="w-full rounded-xl border-stone-200"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Creando...' : 'Guardar Recordatorio'}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8 bg-sage-50 p-4 rounded-2xl border border-sage-100">
        <Filter className="w-5 h-5 text-sage-600" />
        <select
          value={selectedPet}
          onChange={(e) => setSelectedPet(e.target.value)}
          className="bg-transparent border-none text-sage-900 font-medium focus:ring-0 cursor-pointer"
        >
          <option value="">Todas las mascotas</option>
          {pets?.map((pet: any) => (
            <option key={pet.id} value={pet.id}>{pet.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-300">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-stone-400" />
            </div>
            <p className="text-stone-500 font-medium">No hay recordatorios encontrados</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-sage-600 font-semibold mt-2 hover:underline"
            >
              Crea el primero ahora
            </button>
          </div>
        ) : (
          filteredReminders.map((reminder: any) => {
            const typeInfo = reminderTypes.find(t => t.value === reminder.type) || reminderTypes[5]
            const overdue = isOverdue(reminder.dueDate) && reminder.status === 'PENDIENTE'
            const today = isToday(reminder.dueDate) && reminder.status === 'PENDIENTE'

            return (
              <div
                key={reminder.id}
                className={`group bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${overdue ? 'border-red-200 shadow-sm shadow-red-50' :
                    today ? 'border-blue-200 shadow-sm shadow-blue-50' :
                      'border-stone-100'
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${typeInfo.color}`}>
                      {typeInfo.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-bold transition-all ${reminder.status === 'COMPLETADO' ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                          {reminder.title}
                        </h3>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full font-medium">
                          {reminder.pet?.name}
                        </span>
                        {overdue && <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded">Atrasado</span>}
                        {today && <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Para Hoy</span>}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-stone-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className={`w-4 h-4 ${overdue ? 'text-red-400' : ''}`} />
                          {new Date(reminder.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle className={`w-4 h-4 cursor-pointer transition-colors ${reminder.status === 'COMPLETADO' ? 'text-green-500' : 'text-stone-300'}`}
                            onClick={() => handleToggleStatus(reminder.id, reminder.status)}
                          />
                          {reminder.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleStatus(reminder.id, reminder.status)}
                      className={`p-2 rounded-xl border transition-all ${reminder.status === 'COMPLETADO'
                          ? 'bg-green-50 border-green-100 text-green-600'
                          : 'bg-stone-50 border-stone-100 text-stone-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                      title="Marcar como completado"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-2 rounded-xl border border-stone-100 bg-stone-50 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-3xl font-black text-stone-800">{value}</p>
    </div>
  )
}