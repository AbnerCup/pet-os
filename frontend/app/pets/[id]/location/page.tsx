'use client';

import { useParams } from 'next/navigation';
import { usePet } from '@/hooks/usePets';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Navigation, Battery, Clock, AlertTriangle, Plus, Loader2, Crown } from 'lucide-react';
import Link from 'next/link';

export default function LocationPage() {
  const params = useParams();
  const { user } = useAuth();
  const { pet, isLoading } = usePet(params.id as string);

  // Validar plan
  if (user?.plan === 'FREE') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-white rounded-2xl p-8 border border-sage-200 text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-sage-900 mb-2">GPS Premium</h2>
          <p className="text-stone-600 mb-6">El GPS en tiempo real requiere un plan Básico o superior.</p>
          <Link href="/pricing" className="btn-primary inline-block">
            Ver Planes
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Ubicación GPS</h1>
          <p className="text-stone-600 mt-1">{pet?.name} • Seguimiento en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-sage-600 bg-sage-100 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            GPS Activo
          </span>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-2xl border border-sage-200 overflow-hidden">
        <div className="h-96 bg-stone-100 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-sage-50 to-stone-100">
            <svg className="w-full h-full opacity-30" viewBox="0 0 100 100">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#7c9a6b" strokeWidth="0.5"/>
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>

            {/* Pet Location */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-20 h-20 bg-sage-500/30 rounded-full animate-ping absolute" />
                <div className="w-12 h-12 bg-sage-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-md whitespace-nowrap">
                  <p className="text-sm font-bold text-sage-900">{pet?.name}</p>
                  <p className="text-xs text-stone-600">Hace 2 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-sage-200">
          <div className="flex items-center gap-2 text-stone-600 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Precisión</span>
          </div>
          <p className="text-lg font-semibold text-sage-900">±5m</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-sage-200">
          <div className="flex items-center gap-2 text-stone-600 mb-1">
            <Battery className="w-4 h-4" />
            <span className="text-sm">Batería Collar</span>
          </div>
          <p className="text-lg font-semibold text-sage-900">78%</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-sage-200">
          <div className="flex items-center gap-2 text-stone-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Actualizado</span>
          </div>
          <p className="text-lg font-semibold text-sage-900">2 min</p>
        </div>
      </div>
    </div>
  );
}
