'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { post, fetcher, put } from '@/lib/api'
import { Siren, Phone, MapPin, Clock, AlertTriangle, Crown, CheckCircle, Shield } from 'lucide-react'

export default function SOSPage() {
  const { user } = useAuth()
  const { pets } = usePets()
  const [selectedPet, setSelectedPet] = useState('')
  const [emergencyType, setEmergencyType] = useState('')
  const [isActivated, setIsActivated] = useState(false)
  const [activeEmergency, setActiveEmergency] = useState<any>(null)
  const [countdown, setCountdown] = useState(10)
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [emergencies, setEmergencies] = useState<any[]>([])

  const [emergencyContacts] = useState([
    { name: 'Veterinaria Central', phone: '+591 2 123456', type: 'veterinary' },
    { name: 'Hospital Animal', phone: '+591 2 654321', type: 'veterinary' },
    { name: 'Emergencia 24h', phone: '+591 70000000', type: 'emergency' },
    { name: 'Protección Animal', phone: '+591 80012345', type: 'protection' }
  ])

  const isLocked = user?.plan !== 'FAMILY'

  const emergencyTypes = [
    { id: 'accident', name: 'Accidente', icon: '🚗', color: 'bg-red-500', description: 'Atropellamiento, caída, golpe' },
    { id: 'poisoning', name: 'Intoxicación', icon: '☠️', color: 'bg-purple-500', description: 'Consumo de sustancias tóxicas' },
    { id: 'illness', name: 'Enfermedad grave', icon: '🤒', color: 'bg-orange-500', description: 'Síntomas severos, dificultad respiratoria' },
    { id: 'lost', name: 'Mascota perdida', icon: '🔍', color: 'bg-blue-500', description: 'No encuentra a su mascota' },
    { id: 'aggression', name: 'Agresión', icon: '⚠️', color: 'bg-yellow-500', description: 'Pelea con otro animal' }
  ]

  useEffect(() => {
    if (!isLocked) {
      fetchEmergencies()
    }
  }, [isLocked])

  useEffect(() => {
    if (isActivated && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isActivated && countdown === 0) {
      handleActivateEmergency()
    }
  }, [isActivated, countdown])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  const fetchEmergencies = async () => {
    try {
      const response = await fetcher('/api/sos/active')
      if (response.success) {
        setEmergencies(response.data)
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error)
    }
  }

  const handleActivateEmergency = async () => {
    try {
      const response = await post('/api/sos', {
        petId: selectedPet,
        type: emergencyType,
        latitude: location?.lat,
        longitude: location?.lng
      })
      if (response.success) {
        setActiveEmergency(response.data)
        fetchEmergencies()
        setIsActivated(false)
        setCountdown(10)
      }
    } catch (error) {
      console.error('Error activating emergency:', error)
      setIsActivated(false)
      setCountdown(10)
    }
  }

  const resolveEmergency = async (id: string) => {
    try {
      const response = await put(`/api/sos/${id}/resolve`, {})
      if (response.success) {
        fetchEmergencies()
      }
    } catch (error) {
      console.error('Error resolving emergency:', error)
    }
  }

  const cancelEmergency = () => {
    setIsActivated(false)
    setCountdown(10)
  }

  const handleSOSPress = () => {
    if (!selectedPet || !emergencyType || isLocked) return
    setIsActivated(true)
  }

  if (isLocked) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl p-8 border border-red-200">
          <div className="text-center">
            <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Emergencia SOS</h1>
            <p className="text-stone-600 mb-6">
              Sistema de emergencia inmediata para tus mascotas
            </p>
            <div className="bg-white rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-stone-900 mb-3">Características Premium:</h3>
              <ul className="space-y-2 text-stone-600">
                <li className="flex items-center gap-2">
                  <Siren className="w-4 h-4 text-red-500" />
                  Alerta de emergencia con un clic
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500" />
                  Contactos veterinarios automáticos
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Envío de ubicación GPS
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  Historial de emergencias
                </li>
              </ul>
            </div>
            <a href="/pricing?upgrade=sos" className="btn-primary">
              Actualizar a Plan Family
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Emergencia SOS</h1>
          <p className="text-stone-600">Sistema de emergencia inmediata</p>
        </div>
        <div className="flex items-center gap-2 text-amber-600">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Activo</span>
        </div>
      </div>

      {/* Emergency Activation */}
      <div className="bg-white rounded-2xl p-8 border border-sage-200 mb-6 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-stone-900 mb-2">Activar Emergencia</h2>
          <p className="text-stone-600">Selecciona la mascota y tipo de emergencia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">Mascota en emergencia</label>
            <select
              value={selectedPet}
              onChange={(e) => setSelectedPet(e.target.value)}
              className="w-full rounded-xl border-sage-200 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Seleccionar mascota...</option>
              {pets?.map((pet: any) => (
                <option key={pet.id} value={pet.id}>{pet.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">Tipo de emergencia</label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full rounded-xl border-sage-200 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Seleccionar tipo...</option>
              {emergencyTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SOS Button */}
        <div className="text-center">
          {!isActivated ? (
            <button
              onClick={handleSOSPress}
              disabled={!selectedPet || !emergencyType}
              className="relative w-48 h-48 bg-red-500 hover:bg-red-600 disabled:bg-stone-300 rounded-full flex items-center justify-center transition-all transform hover:scale-105 disabled:scale-100 shadow-xl"
            >
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-25" />
              <div className="relative text-white">
                <Siren className="w-16 h-16 mb-2" />
                <span className="text-2xl font-bold">SOS</span>
              </div>
            </button>
          ) : (
            <div className="relative w-48 h-48 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
              <div className="relative text-white text-center">
                <div className="text-5xl font-bold mb-2">{countdown}</div>
                <span className="text-sm">Activando...</span>
                <button
                  onClick={cancelEmergency}
                  className="mt-4 px-6 py-2 bg-white text-red-600 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors shadow-lg"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          )}

          {!isActivated && (
            <p className="text-sm text-stone-500 mt-6 font-medium animate-pulse">
              Presiona para activar alerta inmediata
            </p>
          )}
        </div>
      </div>

      {/* Emergency Info and Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Contactos de Emergencia</h3>
            <div className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-sage-600" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{contact.name}</p>
                      <p className="text-sm text-stone-500">{contact.phone}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-sage-600 text-white rounded-lg text-sm font-medium hover:bg-sage-700 transition-colors">
                    Llamar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Alertas Activas</h3>
          <div className="space-y-4">
            {emergencies.filter(e => e.status === 'ACTIVE').length === 0 ? (
              <p className="text-stone-500 text-center py-8">No hay alertas activas en este momento</p>
            ) : (
              emergencies.filter(e => e.status === 'ACTIVE').map((e) => (
                <div key={e.id} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-red-900">{e.pet.name}</p>
                        <p className="text-xs text-red-700 uppercase font-bold tracking-wider">{e.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => resolveEmergency(e.id)}
                      className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      RESOLVER
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 text-xs mt-2">
                    <MapPin className="w-3 h-3" />
                    <span>Ubicación enviada • {new Date(e.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Emergency History */}
      <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Historial Reciente</h3>
        <div className="space-y-3">
          {emergencies.filter(e => e.status !== 'ACTIVE').map((e) => (
            <div key={e.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">{e.pet.name} • {e.type}</p>
                  <p className="text-sm text-stone-500">
                    {new Date(e.createdAt).toLocaleDateString()} • {new Date(e.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600 font-medium tracking-tight">RESUELTA</p>
                <p className="text-xs text-stone-400">
                  {e.resolvedAt ? `En ${Math.round((new Date(e.resolvedAt).getTime() - new Date(e.createdAt).getTime()) / 60000)} min` : ''}
                </p>
              </div>
            </div>
          ))}
          {emergencies.filter(e => e.status !== 'ACTIVE').length === 0 && (
            <p className="text-stone-400 text-center py-4 text-sm">No hay registros previos</p>
          )}
        </div>
      </div>
    </div>
  )
}