'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { MapPin, Navigation, Clock, AlertTriangle, Crown } from 'lucide-react'

export default function LocationPage() {
  const { user } = useAuth()
  const { pets } = usePets()
  const [selectedPet, setSelectedPet] = useState('')
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationHistory, setLocationHistory] = useState<Array<{
    id: string
    petId: string
    lat: number
    lng: number
    timestamp: string
    address?: string
  }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const isLocked = user?.plan === 'FREE'

  useEffect(() => {
    if (!isLocked && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [isLocked])

  const trackLocation = async () => {
    if (!selectedPet || isLocked) return
    
    setIsLoading(true)
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        
        const newLocation = {
          id: Date.now().toString(),
          petId: selectedPet,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString(),
          address: 'Ubicación actual'
        }
        
        setLocationHistory(prev => [newLocation, ...prev])
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      }
    } catch (error) {
      console.error('Error tracking location:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLocked) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
          <div className="text-center">
            <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Seguimiento GPS</h1>
            <p className="text-stone-600 mb-6">
              Monitorea la ubicación de tus mascotas en tiempo real
            </p>
            <div className="bg-white rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-stone-900 mb-3">Características Premium:</h3>
              <ul className="space-y-2 text-stone-600">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Seguimiento en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Historial de ubicaciones
                </li>
                <li className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-500" />
                  Geocercas y alertas
                </li>
              </ul>
            </div>
            <a href="/pricing?upgrade=gps" className="btn-primary">
              Actualizar Plan
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
          <h1 className="text-2xl font-bold text-sage-900">Seguimiento GPS</h1>
          <p className="text-stone-600">Monitorea la ubicación de tus mascotas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map View */}
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <h2 className="text-lg font-semibold text-sage-900 mb-4">Mapa en vivo</h2>
          <div className="bg-sage-50 rounded-xl h-96 flex items-center justify-center border-2 border-dashed border-sage-300">
            {currentLocation ? (
              <div className="text-center">
                <MapPin className="w-12 h-12 text-sage-600 mx-auto mb-3" />
                <p className="text-stone-700 mb-1">Ubicación actual</p>
                <p className="text-sm text-stone-500">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="text-stone-500">Ubicación no disponible</p>
                <p className="text-sm text-stone-400">Activa el GPS del navegador</p>
              </div>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Pet Selection */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200">
            <h2 className="text-lg font-semibold text-sage-900 mb-4">Seleccionar Mascota</h2>
            <select
              value={selectedPet}
              onChange={(e) => setSelectedPet(e.target.value)}
              className="w-full"
            >
              <option value="">Elegir mascota...</option>
              {pets?.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.name}</option>
              ))}
            </select>
            <button
              onClick={trackLocation}
              disabled={!selectedPet || isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Actualizar Ubicación
                </>
              )}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200">
            <h2 className="text-lg font-semibold text-sage-900 mb-4">Resumen</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-sage-50 rounded-xl p-4">
                <p className="text-sm text-stone-600">Mascotas activas</p>
                <p className="text-2xl font-bold text-sage-900">{selectedPet ? '1' : '0'}</p>
              </div>
              <div className="bg-sage-50 rounded-xl p-4">
                <p className="text-sm text-stone-600">Registros hoy</p>
                <p className="text-2xl font-bold text-sage-900">
                  {locationHistory.filter(loc => {
                    const today = new Date().toDateString()
                    return new Date(loc.timestamp).toDateString() === today
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location History */}
      {locationHistory.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-sage-200 mt-6">
          <h2 className="text-lg font-semibold text-sage-900 mb-4">Historial de ubicaciones</h2>
          <div className="space-y-3">
            {locationHistory.map(location => {
              const pet = pets?.find(p => p.id === location.petId)
              return (
                <div key={location.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-sage-600" />
                    <div>
                      <p className="font-medium text-stone-900">{pet?.name || 'Mascota'}</p>
                      <p className="text-sm text-stone-500">{location.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-stone-600">
                      {new Date(location.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-stone-400">
                      {new Date(location.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}