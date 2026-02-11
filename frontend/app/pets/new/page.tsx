'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePets } from '@/hooks/usePets';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';

export default function NewPetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createPet } = usePets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    birthDate: '',
    weight: '',
    photoUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await createPet({
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
      });
      router.push('/pets');
    } catch (err: any) {
      setError(err.message || 'Error al crear mascota');
    } finally {
      setIsLoading(false);
    }
  };

  const maxPets = user?.plan === 'FREE' ? 1 : user?.plan === 'BASIC' ? 3 : 999;

  const handleImageChange = (photoUrl: string) => {
    setFormData({...formData, photoUrl});
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/pets" className="inline-flex items-center gap-2 text-stone-600 hover:text-sage-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <div className="bg-white rounded-2xl p-8 border border-sage-200">
        <h1 className="text-2xl font-bold text-sage-900 mb-2">Agregar Nueva Mascota</h1>
        <p className="text-stone-600 mb-6">
          Plan {user?.plan}: {maxPets === 999 ? 'Mascotas ilimitadas' : `Máximo ${maxPets} mascotas`}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Luna"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Foto</label>
            <ImageUpload
              value={formData.photoUrl}
              onChange={handleImageChange}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Especie *</label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({...formData, species: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
              >
                <option value="dog">Perro</option>
                <option value="cat">Gato</option>
                <option value="bird">Ave</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Raza</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({...formData, breed: e.target.value})}
                placeholder="Golden Retriever"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Fecha de nacimiento</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="25.5"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/pets" className="flex-1 btn-secondary text-center py-3">
              Cancelar
            </Link>
            <button type="submit" disabled={isLoading} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 py-3">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Mascota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}