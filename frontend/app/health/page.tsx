'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { Stethoscope, Plus, Calendar, Weight, Heart, Pill, Syringe, ThermometerSun, FileText, Filter, AlertCircle } from 'lucide-react'

export default function HealthPage() {
  const { user } = useAuth()
  const { pets } = usePets()
  const [selectedPet, setSelectedPet] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    petId: '',
    type: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    veterinarian: '',
    weight: '',
    temperature: '',
    notes: '',
    nextAppointment: ''
  })

  // Mock health records data
  const [healthRecords] = useState([
    {
      id: '1',
      petId: '1',
      type: 'vaccination',
      title: 'Vacuna antirrábica',
      description: 'Dosis anual de vacuna antirrábica',
      date: '2024-01-15',
      veterinarian: 'Dr. Pérez',
      weight: '25.5',
      temperature: '38.5',
      notes: 'Sin reacciones adversas',
      nextAppointment: '2025-01-15',
      petName: 'Luna'
    },
    {
      id: '2',
      petId: '1',
      type: 'checkup',
      title: 'Chequeo anual',
      description: 'Examen físico completo',
      date: '2024-01-10',
      veterinarian: 'Dra. González',
      weight: '25.2',
      temperature: '38.2',
      notes: 'Salud general buena',
      nextAppointment: '2025-01-10',
      petName: 'Luna'
    },
    {
      id: '3',
      petId: '2',
      type: 'medication',
      title: 'Antibiótico',
      description: 'Tratamiento para infección',
      date: '2024-01-05',
      veterinarian: 'Dr. Pérez',
      weight: '15.8',
      temperature: '39.1',
      notes: 'Completar tratamiento 7 días',
      nextAppointment: '2024-01-12',
      petName: 'Max'
    },
    {
      id: '4',
      petId: '1',
      type: 'deworming',
      title: 'Desparasitación',
      description: 'Pastilla antiparasitaria interna',
      date: '2023-12-20',
      veterinarian: 'Dra. González',
      weight: '25.0',
      temperature: '38.3',
      notes: 'Próxima dosis en 3 meses',
      nextAppointment: '2024-03-20',
      petName: 'Luna'
    }
  ])

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

  const filteredRecords = healthRecords.filter(record => {
    if (selectedPet && record.petId !== selectedPet) return false
    return true
  })

  const stats = {
    totalRecords: filteredRecords.length,
    upcomingAppointments: filteredRecords.filter(r => {
      if (!r.nextAppointment) return false
      return new Date(r.nextAppointment) >= new Date()
    }).length,
    thisMonth: filteredRecords.filter(r => {
      const recordDate = new Date(r.date)
      const now = new Date()
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
    }).length,
    vaccinations: filteredRecords.filter(r => r.type === 'vaccination').length
  }

  const getRecordIcon = (type: string) => {
    return recordTypes.find(t => t.value === type)?.icon || '📝'
  }

  const getRecordColor = (type: string) => {
    return recordTypes.find(t => t.value === type)?.color || 'bg-gray-500'
  }

  const getRecordLabel = (type: string) => {
    return recordTypes.find(t => t.value === type)?.label || 'Otro'
  }

  const isUpcomingAppointment = (date: string) => {
    return new Date(date) >= new Date()
  }

  const getLatestWeight = (petId: string) => {
    const petRecords = healthRecords.filter(r => r.petId === petId && r.weight)
    if (petRecords.length === 0) return null
    return petRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].weight
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Registros de Salud</h1>
          <p className="text-stone-600">Historial médico completo de tus mascotas</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Registro
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Total registros</span>
            <FileText className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.totalRecords}</p>
          <p className="text-sm text-stone-500 mt-1">En historial</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Próximas citas</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.upcomingAppointments}</p>
          <p className="text-sm text-stone-500 mt-1">Programadas</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Este mes</span>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.thisMonth}</p>
          <p className="text-sm text-stone-500 mt-1">Registros</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Vacunas</span>
            <Syringe className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-sage-900">{stats.vaccinations}</p>
          <p className="text-sm text-stone-500 mt-1">Aplicadas</p>
        </div>
      </div>

      {/* Add Health Record Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 border border-sage-200 mb-6">
          <h3 className="text-lg font-semibold text-sage-900 mb-4">Nuevo Registro Médico</h3>
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
              <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de registro</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full"
              >
                {recordTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ej: Vacuna anual, chequeo..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Veterinario/a</label>
              <input
                type="text"
                value={formData.veterinarian}
                onChange={(e) => setFormData({...formData, veterinarian: e.target.value})}
                placeholder="Nombre del veterinario"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Peso (kg)</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="25.5"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Temperatura (°C)</label>
              <input
                type="text"
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                placeholder="38.5"
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
              <label className="block text-sm font-medium text-stone-700 mb-1">Próxima cita</label>
              <input
                type="date"
                value={formData.nextAppointment}
                onChange={(e) => setFormData({...formData, nextAppointment: e.target.value})}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detalles del procedimiento..."
              className="w-full"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-stone-700 mb-1">Notas adicionales</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observaciones, recomendaciones..."
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
              Guardar Registro
            </button>
          </div>
        </div>
      )}

      {/* Filters and Pet Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900">Filtros</h2>
            <Filter className="w-5 h-5 text-stone-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Mascota</label>
            <select
              value={selectedPet}
              onChange={(e) => setSelectedPet(e.target.value)}
              className="w-full"
            >
              <option value="">Todas las mascotas</option>
              {pets?.map(pet => {
                const latestWeight = getLatestWeight(pet.id)
                return (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} {latestWeight && `(${latestWeight}kg)`}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <h2 className="text-lg font-semibold text-sage-900 mb-4">Resumen Rápido</h2>
          <div className="space-y-3">
            {pets?.map(pet => {
              const petRecords = filteredRecords.filter(r => r.petId === pet.id)
              const latestWeight = getLatestWeight(pet.id)
              const upcomingAppointment = petRecords.find(r => r.nextAppointment && isUpcomingAppointment(r.nextAppointment))
              
              return (
                <div key={pet.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-sage-600" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{pet.name}</p>
                      <p className="text-xs text-stone-500">
                        {petRecords.length} registros
                        {latestWeight && ` • ${latestWeight}kg`}
                        {upcomingAppointment && ` • Próxima: ${new Date(upcomingAppointment.nextAppointment).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Health Records List */}
      <div className="bg-white rounded-2xl p-6 border border-sage-200">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">Historial Médico</h2>
        <div className="space-y-4">
          {filteredRecords.map(record => {
            const recordType = recordTypes.find(t => t.value === record.type)
            return (
              <div key={record.id} className="border border-stone-200 rounded-xl p-4 hover:bg-stone-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${recordType?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center text-white text-lg`}>
                      {getRecordIcon(record.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-stone-900">{record.title}</h3>
                        <span className="text-sm text-stone-500">• {record.petName}</span>
                        <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full">
                          {getRecordLabel(record.type)}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 mb-2">{record.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                        {record.veterinarian && (
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <Stethoscope className="w-3 h-3" />
                            {record.veterinarian}
                          </div>
                        )}
                        {record.weight && (
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <Weight className="w-3 h-3" />
                            {record.weight}kg
                          </div>
                        )}
                        {record.temperature && (
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <ThermometerSun className="w-3 h-3" />
                            {record.temperature}°C
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-stone-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {record.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
                          <div className="flex items-center gap-1 text-xs text-amber-700 mb-1">
                            <FileText className="w-3 h-3" />
                            Notas:
                          </div>
                          <p className="text-xs text-amber-600">{record.notes}</p>
                        </div>
                      )}
                      
                      {record.nextAppointment && (
                        <div className={`flex items-center gap-2 text-sm ${
                          isUpcomingAppointment(record.nextAppointment) ? 'text-blue-600' : 'text-stone-500'
                        }`}>
                          <Calendar className="w-4 h-4" />
                          <span>
                            {isUpcomingAppointment(record.nextAppointment) ? 'Próxima cita:' : 'Última cita:'}
                          </span>
                          <span className="font-medium">
                            {new Date(record.nextAppointment).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}