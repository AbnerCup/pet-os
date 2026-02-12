'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { useHealth } from '@/hooks/useHealth'
import { Stethoscope, Plus, Calendar, Weight, Heart, Pill, Syringe, ThermometerSun, FileText, Filter, AlertCircle, Loader2, Trash2 } from 'lucide-react'

export default function HealthPage() {
  const { user } = useAuth()
  const { pets } = usePets()
  const { records, isLoading, createRecord, deleteRecord } = useHealth()
  const [selectedPet, setSelectedPet] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    petId: '',
    type: 'checkup',
    title: '',
    date: new Date().toISOString().split('T')[0],
    vetName: '',
    notes: '',
    nextDate: '',
    status: 'completed'
  })

  const recordTypes = [
    { value: 'checkup', label: 'Chequeo', icon: '🩺', color: 'bg-blue-500' },
    { value: 'vaccination', label: 'Vacuna', icon: '💉', color: 'bg-green-500' },
    { value: 'medication', label: 'Medicación', icon: '💊', color: 'bg-purple-500' },
    { value: 'deworming', label: 'Desparasitación', icon: '🐛', color: 'bg-orange-500' },
    { value: 'surgery', label: 'Cirugía', icon: '🏥', color: 'bg-red-500' },
    { value: 'dental', label: 'Dental', icon: '🦷', color: 'bg-cyan-500' },
    { value: 'test', label: 'Análisis', icon: '🔬', color: 'bg-indigo-500' },
    { value: 'other', label: 'Otro', icon: '📝', color: 'bg-gray-500' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.petId || !formData.title) return

    setIsSubmitting(true)
    try {
      await createRecord({
        ...formData,
        nextDate: formData.nextDate ? new Date(formData.nextDate).toISOString() : null
      })
      setShowAddForm(false)
      setFormData({
        petId: '',
        type: 'checkup',
        title: '',
        date: new Date().toISOString().split('T')[0],
        vetName: '',
        notes: '',
        nextDate: '',
        status: 'completed'
      })
    } catch (error) {
      console.error(error)
      alert('Error al crear el registro de salud')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este registro de salud?')) {
      await deleteRecord(id)
    }
  }

  const filteredRecords = records.filter((record: any) => {
    if (selectedPet && record.petId !== selectedPet) return false
    return true
  })

  const stats = {
    totalRecords: filteredRecords.length,
    upcomingAppointments: filteredRecords.filter((r: any) => {
      if (!r.nextDate) return false
      return new Date(r.nextDate) >= new Date()
    }).length,
    thisMonth: filteredRecords.filter((r: any) => {
      const recordDate = new Date(r.date)
      const now = new Date()
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
    }).length,
    vaccinations: filteredRecords.filter((r: any) => r.type === 'vaccination').length
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
        <p className="mt-4 text-stone-600">Cargando historial médico...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-sage-900">Historial de Salud</h1>
          <p className="text-stone-600">Gestiona las visitas al veterinario y vacunas</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Registro
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.totalRecords} icon={FileText} color="text-stone-600" />
        <StatCard label="Próximas Citas" value={stats.upcomingAppointments} icon={Calendar} color="text-blue-600" />
        <StatCard label="Este Mes" value={stats.thisMonth} icon={Heart} color="text-red-600" />
        <StatCard label="Vacunas" value={stats.vaccinations} icon={Syringe} color="text-green-600" />
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-sage-900 mb-6">Nuevo Registro de Salud</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Mascota</label>
              <select
                required
                value={formData.petId}
                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                className="w-full rounded-xl border-stone-200"
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
                placeholder="Ej: Vacuna Rabia, Revisión Anual"
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
                {recordTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Fecha de visita</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-xl border-stone-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Veterinario</label>
              <input
                type="text"
                value={formData.vetName}
                onChange={(e) => setFormData({ ...formData, vetName: e.target.value })}
                placeholder="Nombre del doctor"
                className="w-full rounded-xl border-stone-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Próxima cita (Opcional)</label>
              <input
                type="date"
                value={formData.nextDate}
                onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                className="w-full rounded-xl border-stone-200"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="text-sm font-medium text-stone-700">Notas y Observaciones</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalles de la visita, recomendaciones..."
              rows={3}
              className="w-full rounded-xl border-stone-200 mt-1"
            />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 flex items-center gap-4 bg-sage-50 p-4 rounded-2xl border border-sage-100">
          <Filter className="w-5 h-5 text-sage-600" />
          <select
            value={selectedPet}
            onChange={(e) => setSelectedPet(e.target.value)}
            className="bg-transparent border-none text-sage-900 font-medium focus:ring-0 cursor-pointer w-full"
          >
            <option value="">Todas las mascotas</option>
            {pets?.map((pet: any) => (
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-300">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-stone-400" />
            </div>
            <p className="text-stone-500 font-medium">No hay registros de salud encontrados</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-sage-600 font-semibold mt-2 hover:underline"
            >
              Crea el primero ahora
            </button>
          </div>
        ) : (
          filteredRecords.map((record: any) => {
            const typeInfo = recordTypes.find(t => t.value === record.type) || recordTypes[7]

            return (
              <div
                key={record.id}
                className="group bg-white rounded-2xl p-5 border border-stone-100 transition-all hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shrink-0 ${typeInfo.color}`}>
                      {typeInfo.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-stone-900">{record.title}</h3>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full font-medium">
                          {record.pet?.name}
                        </span>
                        <span className="px-2 py-0.5 bg-sage-50 text-sage-600 text-xs rounded-full font-bold uppercase tracking-wider">
                          {typeInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-stone-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        {record.vetName && (
                          <span className="flex items-center gap-1.5">
                            <Stethoscope className="w-4 h-4" />
                            {record.vetName}
                          </span>
                        )}
                        {record.nextDate && (
                          <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                            <Calendar className="w-4 h-4" />
                            Próxima: {new Date(record.nextDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {record.notes && (
                        <p className="mt-3 text-sm text-stone-600 bg-stone-50 p-3 rounded-xl italic">
                          "{record.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-start">
                    <button
                      onClick={() => handleDelete(record.id)}
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
    <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm transition-all hover:border-sage-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-3xl font-black text-stone-800">{value}</p>
    </div>
  )
}