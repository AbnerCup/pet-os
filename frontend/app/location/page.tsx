'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Battery, RefreshCw, AlertTriangle } from 'lucide-react'

// Importar mapa dinámicamente (solo cliente)
const PetMap = dynamic(
  () => import('../../components/location/PetMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-sage-50 rounded-xl flex items-center justify-center animate-pulse">
        <MapPin className="w-12 h-12 text-sage-300" />
      </div>
    )
  }
)

interface PetLocationData {
  pet: {
    id: string
    name: string
    photoUrl?: string | null
    species: string
    breed?: string
  }
  location: {
    latitude: number
    longitude: number
    timestamp: string
    battery?: number | null
    accuracy?: number | null
  } | null
}

const ENV_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const API_URL = ENV_URL.endsWith('/api') ? ENV_URL : `${ENV_URL}/api`

export default function LocationPage() {
  const [locations, setLocations] = useState<PetLocationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No has iniciado sesión. Por favor ingresa a tu cuenta.')
        setIsLoading(false)
        return
      }

      const res = await fetch(`${API_URL}/location/latest`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        if (res.status === 401) setError('Sesión expirada. Por favor recarga o inicia sesión nuevamente.')
        else if (res.status === 404) setError(`Ruta no encontrada (${API_URL}/location/latest). Intenta reiniciar el Backend.`)
        else setError(`Error del servidor: ${res.status}`)
        return
      }

      const json = await res.json()
      if (json.success) {
        // Normalizar URLs de fotos
        const processedData = json.data.map((item: any) => ({
          ...item,
          pet: {
            ...item.pet,
            photoUrl: item.pet.photoUrl
              ? (item.pet.photoUrl.startsWith('http') ? item.pet.photoUrl : `${ENV_URL}${item.pet.photoUrl}`)
              : null
          }
        }))
        setLocations(processedData)
        setLastUpdated(new Date())
        setError(null)
      } else {
        setError(json.message || 'Error al obtener datos')
      }
    } catch (err) {
      console.error(err)
      setError('Error de conexión con el servidor backend (revisa que esté corriendo)')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
    const interval = setInterval(fetchLocations, 10000) // Cada 10s
    return () => clearInterval(interval)
  }, [])

  const activePets = locations.filter(l => l.location)
  const selectedPetData = selectedPetId
    ? locations.find(l => l.pet.id === selectedPetId)
    : (activePets.length > 0 ? activePets[0] : null)

  const handleRefresh = () => {
    setIsLoading(true)
    fetchLocations()
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rastreo GPS en vivo</h1>
          <p className="text-gray-500 mt-1">Monitorea la ubicación de todas tus mascotas en tiempo real</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-400">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Actualizar ahora"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel Izquierdo: Lista de Mascotas */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Tus Mascotas</h2>
            <div className="space-y-3">
              {locations.length === 0 && !isLoading && !error && (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="font-medium">No se encontraron mascotas</p>
                  <p className="text-xs mt-2 px-4">Asegúrate de usar la misma cuenta (email) en la Web y en la App Móvil.</p>
                </div>
              )}

              {locations.map((item) => (
                <div
                  key={item.pet.id}
                  onClick={() => setSelectedPetId(item.pet.id)}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${selectedPetId === item.pet.id || (!selectedPetId && item === selectedPetData)
                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <img
                    src={item.pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop'}
                    alt={item.pet.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-800">{item.pet.name}</h3>
                      {item.location && item.location.battery && (
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${item.location.battery > 20 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          <Battery className="w-3 h-3" />
                          {item.location.battery}%
                        </div>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      {item.location ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                          <span className="text-xs text-gray-500">
                            Hace {Math.floor((Date.now() - new Date(item.location.timestamp).getTime()) / 60000)} min
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-gray-300 mr-2" />
                          <span className="text-xs text-gray-400">Sin señal</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-semibold">En línea</p>
              <p className="text-2xl font-bold text-green-600">{activePets.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
              <p className="text-2xl font-bold text-gray-800">{locations.length}</p>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Mapa */}
        <div className="lg:col-span-2 h-[600px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
          <PetMap
            petsWrapper={locations}
            center={selectedPetData?.location ? [selectedPetData.location.latitude, selectedPetData.location.longitude] : [-17.9647, -67.1060]}
            zoom={selectedPetData ? 15 : 12}
          />

          {/* Badge flotante */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-[1000] border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-bold text-gray-700">Live GPS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}