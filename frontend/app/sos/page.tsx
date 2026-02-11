'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { Siren, Phone, MapPin, Clock, AlertTriangle, Crown, CheckCircle, Ambulance, Shield } from 'lucide-react'

export default function SOSPage() {
  const { user } = useAuth()
  const { pets } = usePets()
  const [selectedPet, setSelectedPet] = useState('')
  const [emergencyType, setEmergencyType] = useState('')
  const [isActivated, setIsActivated] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
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
    if (isActivated && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isActivated && countdown === 0) {
      activateEmergency()
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

  const activateEmergency = () => {
    // Simulate emergency activation
    console.log('Emergency activated for pet:', selectedPet, 'Type:', emergencyType)
    // In real app, this would send notifications, call contacts, etc.
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
      <div className="bg-white rounded-2xl p-8 border border-sage-200 mb-6">
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
              className="w-full"
            >
              <option value="">Seleccionar mascota...</option>
              {pets?.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">Tipo de emergencia</label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full"
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
              className="relative w-48 h-48 bg-red-500 hover:bg-red-600 disabled:bg-stone-300 rounded-full flex items-center justify-center transition-all transform hover:scale-105 disabled:scale-100"
            >
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping" />
              <div className="relative text-white">
                <Siren className="w-16 h-16 mb-2" />
                <span className="text-2xl font-bold">SOS</span>
              </div>
            </button>
          ) : (
            <div className="relative w-48 h-48 bg-red-600 rounded-full flex items-center justify-center mx-auto">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
              <div className="relative text-white text-center">
                <div className="text-5xl font-bold mb-2">{countdown}</div>
                <span className="text-sm">Cancelando...</span>
                <button
                  onClick={cancelEmergency}
                  className="mt-4 px-6 py-2 bg-white text-red-600 rounded-full text-sm font-medium hover:bg-stone-100"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          )}
          
          {!isActivated && (
            <p className="text-sm text-stone-500 mt-4">
              Mantén presionado para activar o presiona una vez
            </p>
          )}
        </div>
      </div>

      {/* Emergency Info */}
      {selectedPet && emergencyType && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 border border-sage-200">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Información de Emergencia</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  {emergencyTypes.find(t => t.id === emergencyType)?.icon}
                </div>
                <div>
                  <p className="font-medium text-stone-900">
                    {emergencyTypes.find(t => t.id === emergencyType)?.name}
                  </p>
                  <p className="text-sm text-stone-500">
                    {emergencyTypes.find(t => t.id === emergencyType)?.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-sage-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">Ubicación actual</p>
                  <p className="text-sm text-stone-500">
                    {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Obteniendo ubicación...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-sage-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">Tiempo de respuesta</p>
                  <p className="text-sm text-stone-500">Menos de 5 minutos</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-sage-200">
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
                  <button className="px-4 py-2 bg-sage-600 text-white rounded-lg text-sm font-medium hover:bg-sage-700">
                    Llamar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emergency History */}
      <div className="bg-white rounded-2xl p-6 border border-sage-200">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Historial de Emergencias</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-stone-900">Emergencia resuelta</p>
                <p className="text-sm text-stone-500">Luna • Intoxicación • 15 Ene 2024</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600 font-medium">Completado</p>
              <p className="text-xs text-stone-400">Tiempo: 3 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}