'use client';

import { useParams } from 'next/navigation';
import { usePet } from '@/hooks/usePets';
import { formatDate } from '@/lib/utils';
import { Plus, Activity, Footprints, Gamepad2, GraduationCap, Sparkles, Loader2 } from 'lucide-react';

const getIcon = (type: string) => {
  switch(type) {
    case 'walk': return Footprints;
    case 'play': return Gamepad2;
    case 'training': return GraduationCap;
    default: return Activity;
  }
};

export default function ActivityPage() {
  const params = useParams();
  const { pet, isLoading } = usePet(params.id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    );
  }

  const activities = pet?.activities || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Actividad</h1>
          <p className="text-stone-600 mt-1">{pet?.name} - Registro de ejercicio</p>
        </div>
        <button className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          Registrar Actividad
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-sage-600 to-sage-700 rounded-2xl p-6 text-white">
          <Footprints className="w-6 h-6 mb-4" />
          <p className="text-3xl font-bold">{activities.reduce((sum: number, a: any) => sum + (a.type === 'walk' ? a.duration : 0), 0)} min</p>
          <p className="text-sm opacity-90 mt-1">Paseos totales</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <Sparkles className="w-6 h-6 mb-4 text-amber-500" />
          <p className="text-3xl font-bold text-sage-900">{activities.length}</p>
          <p className="text-sm text-stone-600 mt-1">Total actividades</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <Activity className="w-6 h-6 mb-4 text-blue-500" />
          <p className="text-3xl font-bold text-sage-900">{Math.round(activities.reduce((sum: number, a: any) => sum + a.duration, 0) / 60)}h</p>
          <p className="text-sm text-stone-600 mt-1">Tiempo total</p>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-2xl border border-sage-200 overflow-hidden">
        <div className="p-6 border-b border-sage-100">
          <h3 className="font-semibold text-sage-900">Historial</h3>
        </div>
        {activities.length > 0 ? (
          <div className="divide-y divide-sage-100">
            {activities.map((activity: any) => {
              const Icon = getIcon(activity.type);
              return (
                <div key={activity.id} className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-sage-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sage-900 capitalize">{activity.type}</p>
                    {activity.notes && <p className="text-sm text-stone-600">{activity.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sage-900">{activity.duration} min</p>
                    <p className="text-sm text-stone-500">{formatDate(activity.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-stone-500 py-8">Sin actividades registradas</p>
        )}
      </div>
    </div>
  );
}
