'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePets } from '@/hooks/usePets';
import { useAuth } from '@/hooks/useAuth';
import { calculateAge, getPetImage } from '@/lib/utils';
import { Plus, Search, Filter, ChevronRight, Heart, Activity, MapPin, Loader2, AlertCircle } from 'lucide-react';

export default function PetsPage() {
  const { user } = useAuth();
  const { pets, isLoading, isError, createPet } = usePets();

  const maxPets = user?.plan === 'FREE' ? 1 : user?.plan === 'BASIC' ? 3 : 999;
  const canAddMore = pets.length < maxPets;

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
        <AlertCircle className="w-6 h-6 mr-2" />
        Error al cargar mascotas
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Mis Mascotas</h1>
          <p className="text-stone-600 mt-1">
            {pets.length} de {maxPets === 999 ? '∞' : maxPets} mascotas permitidas
          </p>
        </div>
        {canAddMore ? (
          <Link href="/pets/new" className="btn-primary flex items-center gap-2 self-start">
            <Plus className="w-4 h-4" />
            Agregar Mascota
          </Link>
        ) : (
          <Link href="/pricing" className="btn-secondary flex items-center gap-2 self-start">
            <MapPin className="w-4 h-4" />
            Actualizar Plan
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o raza..."
            className="pl-10"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet: any, index: number) => (
          <motion.div
            key={pet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/pets/${pet.id}`}>
              <div className="bg-white rounded-2xl overflow-hidden border border-sage-200 hover:shadow-lg transition-shadow group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getPetImage(pet.photoUrl, pet.species)}
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-sage-800">
                      {pet.species === 'dog' ? 'Perro' : pet.species === 'cat' ? 'Gato' : 'Otro'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-sage-900 group-hover:text-sage-700 transition-colors">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-stone-600">{pet.breed || 'Raza desconocida'}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-sage-600 transition-colors" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-stone-50 rounded-lg p-3">
                      <p className="text-xs text-stone-600">Edad</p>
                      <p className="font-semibold text-sage-900">
                        {pet.birthDate ? calculateAge(pet.birthDate) : '-'} años
                      </p>
                    </div>
                    <div className="bg-stone-50 rounded-lg p-3">
                      <p className="text-xs text-stone-600">Peso</p>
                      <p className="font-semibold text-sage-900">{pet.weight || '-'} kg</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-stone-600">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-sage-500" />
                      {pet.healthRecords?.length || 0} registros
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-sage-500" />
                      {pet.activities?.length || 0} actividades
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Add New Card */}
        {canAddMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pets.length * 0.1 }}
          >
            <Link href="/pets/new">
              <div className="w-full h-full min-h-[400px] border-2 border-dashed border-sage-300 rounded-2xl flex flex-col items-center justify-center gap-4 text-sage-600 hover:border-sage-500 hover:bg-sage-50 transition-all group">
                <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center group-hover:bg-sage-200 transition-colors">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Agregar Nueva Mascota</p>
                  <p className="text-sm text-stone-500 mt-1">
                    {pets.length} de {maxPets === 999 ? 'ilimitadas' : maxPets}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
