'use client';

import { useParams } from 'next/navigation';
import { usePet } from '@/hooks/usePets';
import { useHealth } from '@/hooks/useHealth';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Plus, Calendar, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';

export default function HealthPage() {
  const params = useParams();
  const { pet, isLoading: petLoading } = usePet(params.id as string);
  const { records, isLoading: healthLoading } = useHealth(params.id as string);

  if (petLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    );
  }

  const upcoming = records.filter((r: any) => r.status === 'pending' || r.status === 'overdue');
  const completed = records.filter((r: any) => r.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Historial de Salud</h1>
          <p className="text-stone-600 mt-1">{pet?.name} • {pet?.breed}</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Registro
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-sage-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Pendientes</p>
              <p className="text-2xl font-bold text-sage-900">{upcoming.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sage-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Completados</p>
              <p className="text-2xl font-bold text-sage-900">{completed.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sage-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Total</p>
              <p className="text-2xl font-bold text-sage-900">{records.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-sage-200">
        <h3 className="font-semibold text-sage-900 mb-6">Línea de Tiempo</h3>
        {records.length > 0 ? (
          <div className="space-y-6">
            {records.map((record: any, index: number) => (
              <div key={record.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      record.status === 'overdue' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                    }`}>
                    {record.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                      record.status === 'overdue' ? <AlertCircle className="w-5 h-5" /> :
                        <Clock className="w-5 h-5" />}
                  </div>
                  {index < records.length - 1 && <div className="w-0.5 h-full bg-sage-200 mt-2" />}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sage-900">{record.title}</h4>
                      <p className="text-sm text-stone-600 capitalize">{record.type} • {record.vetName}</p>
                      {record.notes && <p className="text-sm text-stone-500 mt-2 bg-stone-50 p-2 rounded-lg inline-block">{record.notes}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status === 'completed' ? 'Completado' : record.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                      </span>
                      <p className="text-sm text-stone-500 mt-2">{formatDate(record.date)}</p>
                      {record.nextDate && <p className="text-xs text-amber-600 mt-1">Próximo: {formatDate(record.nextDate)}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-stone-500 py-8">Sin registros de salud</p>
        )}
      </div>
    </div>
  );
}
