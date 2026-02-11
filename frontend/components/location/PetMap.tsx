'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

// Fix default icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PetLocation {
    pet: {
        id: string
        name: string
        photoUrl?: string | null
        species: string
    }
    location: {
        latitude: number
        longitude: number
        timestamp: string
        battery?: number | null
    } | null
}

interface PetMapProps {
    petsWrapper: PetLocation[]
    center?: [number, number]
    zoom?: number
}

// Componente auxiliar para actualizar la vista cuando cambia el centro
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom, { animate: true });
    }, [center, zoom, map]);
    return null;
}

const createPetIcon = (photoUrl?: string | null) => {
    const url = photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop';

    return L.divIcon({
        className: 'custom-pet-marker',
        html: `
      <div style="
        width: 48px; 
        height: 48px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.3); 
        background-image: url('${url}'); 
        background-size: cover; 
        background-position: center;
        background-color: #eee;
        position: relative;
      ">
        <div style="
          position: absolute; 
          bottom: 0px; 
          right: 0px; 
          width: 12px; 
          height: 12px; 
          background-color: #34c759; 
          border: 2px solid white; 
          border-radius: 50%;
        "></div>
      </div>
    `,
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -24],
    });
};

export default function PetMap({ petsWrapper, center, zoom = 13 }: PetMapProps) {
    const activePets = petsWrapper.filter(p => p.location);

    // Determinar centro: prop > primera mascota > default
    const resolvedCenter: [number, number] = center
        ? center
        : (activePets.length > 0
            ? [activePets[0].location!.latitude, activePets[0].location!.longitude]
            : [-17.7833, -63.1821]);

    return (
        <MapContainer
            center={resolvedCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
        >
            <MapUpdater center={resolvedCenter} zoom={zoom} />

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {petsWrapper.map((item) => (
                item.location && (
                    <Marker
                        key={item.pet.id}
                        position={[item.location.latitude, item.location.longitude]}
                        icon={createPetIcon(item.pet.photoUrl)}
                    >
                        <Popup>
                            <div className="text-center p-2">
                                <img
                                    src={item.pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop'}
                                    alt={item.pet.name}
                                    className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                                />
                                <h3 className="font-bold text-lg">{item.pet.name}</h3>
                                <p className="text-xs text-gray-500">
                                    {new Date(item.location.timestamp).toLocaleTimeString()}
                                </p>
                                {item.location.battery && (
                                    <p className="text-xs font-semibold text-green-600 mt-1">
                                        🔋 {item.location.battery}% Batería
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    )
}
