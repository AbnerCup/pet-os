'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { usePets } from '@/hooks/usePets';
import { formatDate, calculateAge } from '@/lib/utils';
import {
  PawPrint,
  Calendar,
  Wallet,
  Activity,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { pets, isLoading, isError } = usePets();
  const [selectedPet, setSelectedPet] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        Error al cargar datos. Intenta recargar la página.
      </div>
    );
  }

  const totalExpenses = pets.reduce((sum: number, pet: any) => {
    return sum + (pet.expenses?.reduce((s: number, e: any) => s + parseFloat(e.amount), 0) || 0);
  }, 0);

  const pendingHealth = pets.reduce((count: number, pet: any) => {
    return count + (pet.healthRecords?.filter((h: any) => h.status === 'pending').length || 0);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">¡Hola, {user?.name}! 👋</h1>
          <p className="text-stone-600 mt-1">Aquí está el resumen de tus mascotas</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-sage-600">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={PawPrint}
          label="Total Mascotas"
          value={pets.length}
          color="sage"
        />
        <StatCard
          icon={Calendar}
          label="Pendientes"
          value={pendingHealth}
          color="amber"
        />
        <StatCard
          icon={Wallet}
          label="Gastos Totales"
          value={`€${totalExpenses.toFixed(2)}`}
          color="sage"
        />
        <StatCard
          icon={Activity}
          label="Actividades"
          value={pets.reduce((sum: number, p: any) => sum + (p.activities?.length || 0), 0)}
          color="sage"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pets Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-sage-900">Tus Mascotas</h2>
            <Link href="/pets" className="text-sm text-sage-600 hover:text-sage-700 flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map((pet: any, index: number) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PetCard 
                  pet={pet} 
                  isSelected={selectedPet?.id === pet.id} 
                  onClick={() => setSelectedPet(pet)} 
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-sage-600 to-sage-700 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-4">Acceso Rápido</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton icon={MapPin} label="Ver GPS" href="/location" />
              <QuickActionButton icon={Calendar} label="Agendar Cita" href="/health" />
              <QuickActionButton icon={Wallet} label="Registrar Gasto" href="/expenses" />
              <QuickActionButton icon={Activity} label="Log Actividad" href="/activity" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-sage-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color === 'sage' ? 'bg-sage-100' : 'bg-amber-100'}`}>
          <Icon className={`w-5 h-5 ${color === 'sage' ? 'text-sage-600' : 'text-amber-600'}`} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-sage-900">{value}</p>
        <p className="text-sm text-stone-600">{label}</p>
      </div>
    </div>
  );
}

function PetCard({ pet, isSelected, onClick }: any) {
  const age = pet.birthDate ? calculateAge(pet.birthDate) : '-';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 border-2 cursor-pointer transition-all ${
        isSelected ? 'border-sage-600 shadow-md' : 'border-sage-200 hover:border-sage-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <img
          src={pet.photoUrl || 'https://via.placeholder.com/150'}
          alt={pet.name}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-sage-900">{pet.name}</h3>
          <p className="text-sm text-stone-600">{pet.breed || pet.species}</p>
          <p className="text-xs text-stone-500">{age} años • {pet.weight}kg</p>
        </div>
        <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'rotate-90 text-sage-600' : 'text-stone-400'}`} />
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, href }: any) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-center"
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
