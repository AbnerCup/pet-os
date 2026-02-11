'use client'

import useSWR from 'swr'
import { fetcher, post, put, del } from '@/lib/api'

export function usePets() {
  const { data, error, isLoading, mutate } = useSWR('/api/pets', fetcher)

  return {
    pets: data?.data || [],
    isLoading,
    isError: error,
    mutate,
    createPet: async (petData: any) => {
      const resp = await post('/api/pets', petData)
      mutate()
      return resp
    }
  }
}

export function usePet(id: string) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/pets/${id}` : null, fetcher)

  return {
    pet: data?.data,
    isLoading,
    isError: error,
    updatePet: async (petData: any) => {
      const resp = await put(`/api/pets/${id}`, petData)
      mutate()
      return resp
    },
    deletePet: async () => {
      const resp = await del(`/api/pets/${id}`)
      mutate(null)
      return resp
    }
  }
}
