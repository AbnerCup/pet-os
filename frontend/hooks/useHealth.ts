'use client'

import useSWR from 'swr'
import { fetcher, post, put, del } from '@/lib/api'

export function useHealth(petId?: string) {
    const { data, error, isLoading, mutate } = useSWR(petId ? `/api/pets/${petId}/health` : null, fetcher)

    return {
        records: data?.data || [],
        isLoading,
        isError: error,
        mutate,
        createRecord: async (recordData: any) => {
            const resp = await post('/api/health', recordData)
            mutate()
            return resp
        },
        updateRecord: async (id: string, recordData: any) => {
            const resp = await put(`/api/health/${id}`, recordData)
            mutate()
            return resp
        },
        deleteRecord: async (id: string) => {
            const resp = await del(`/api/health/${id}`)
            mutate()
            return resp
        }
    }
}
