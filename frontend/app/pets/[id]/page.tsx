'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePet } from '@/hooks/usePets';
import { useHealth } from '@/hooks/useHealth';
import { calculateAge, formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Calendar, Activity, MapPin, Weight, Loader2, AlertCircle } from 'lucide-react';

export default function PetDetailPage() {
  const params = useParams();
  const { pet, isLoading, isError } = usePet(params.id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    );
  }

  if (isError || !pet) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        <AlertCircle className="w-6 h-6 mr-2" />
        Mascota no encontrada
      </div>
    );
  }

  const age = pet.birthDate ? calculateAge(pet.birthDate) : '-';

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link href="/pets" className="inline-flex items-center gap-2 text-stone-600 hover:text-sage-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a mascotas
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-sage-200">
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={pet.photoUrl || 'https://via.placeholder.com/150'}
            alt={pet.name}
            className="w-32 h-32 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-sage-900">{pet.name}</h1>
                <p className="text-lg text-stone-600 mt-1">{pet.breed || pet.species}</p>
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <InfoCard icon={Calendar} label="Edad" value={`${age} años`} />
              <InfoCard icon={Weight} label="Peso" value={`${pet.weight || '-'} kg`} />
              <InfoCard icon={Activity} label="Actividades" value={pet.activities?.length || 0} />
              <InfoCard icon={Calendar} label="Registros" value={pet.healthRecords?.length || 0} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard icon={Activity} title="Salud" description="Vacunas y citas" href={`/pets/${pet.id}/health`} color="bg-blue-50 text-blue-600" />
        <QuickActionCard icon={Activity} title="Actividad" description="Paseos y juegos" href={`/pets/${pet.id}/activity`} color="bg-green-50 text-green-600" />
        <QuickActionCard icon={MapPin} title="Ubicación" description="GPS y zonas" href={`/pets/${pet.id}/location`} color="bg-purple-50 text-purple-600" />
        <QuickActionCard icon={Calendar} title="Historial" description="Documentos" href="#" color="bg-orange-50 text-orange-600" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <h3 className="font-semibold text-sage-900 mb-4">Últimas Actividades</h3>
          {pet.activities?.length > 0 ? (
            <div className="space-y-3">
              {pet.activities.slice(0, 3).map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <Activity className="w-5 h-5 text-sage-500" />
                  <div className="flex-1">
                    <p className="font-medium text-sage-900 capitalize">{activity.type}</p>
                    <p className="text-sm text-stone-600">{activity.duration} minutos</p>
                  </div>
                  <span className="text-xs text-stone-500">{formatDate(activity.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-4">Sin actividades registradas</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <h3 className="font-semibold text-sage-900 mb-4">Próximas Citas</h3>
          {pet.healthRecords?.filter((h: any) => h.status === 'pending').length > 0 ? (
            <div className="space-y-3">
              {pet.healthRecords.filter((h: any) => h.status === 'pending').slice(0, 3).map((record: any) => (
                <div key={record.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-medium text-sage-900">{record.title}</p>
                    <p className="text-sm text-stone-600">{record.vetName || 'Sin veterinario'}</p>
                  </div>
                  <span className="text-xs text-amber-600 font-medium">
                    {record.nextDate ? formatDate(record.nextDate) : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-4">Sin citas pendientes</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-sage-100 rounded-lg">
        <Icon className="w-5 h-5 text-sage-600" />
      </div>
      <div>
        <p className="text-xs text-stone-600">{label}</p>
        <p className="font-semibold text-sage-900">{value}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, href, color }: any) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl p-5 border border-sage-200 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-sage-900">{title}</h3>
        <p className="text-sm text-stone-600 mt-1">{description}</p>
      </div>
    </Link>
  );
}
