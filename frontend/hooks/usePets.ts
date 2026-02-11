'use client'

import useSWR from 'swr'
import { fetcher, post } from '@/lib/api'

export function usePets() {
  const { data, error, isLoading, mutate } = useSWR('/api/pets', fetcher)

  return {
    pets: data || [],
    isLoading,
    isError: error,
    mutate,
    createPet: async (petData: any) => {
      const newPet = await post('/api/pets', petData)
      mutate()
      return newPet
    }
  }
}

export function usePet(id: string) {
  const { data, error, isLoading } = useSWR(id ? `/api/pets/${id}` : null, fetcher)
  return { pet: data, isLoading, isError: error }
}
