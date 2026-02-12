'use client'

import useSWR from 'swr'
import { fetcher, post, patch, del } from '@/lib/api'

export function useReminders() {
    const { data, error, isLoading, mutate } = useSWR('/api/reminders', fetcher)

    return {
        reminders: data?.data || [],
        isLoading,
        isError: error,
        mutate,
        createReminder: async (reminderData: any) => {
            const resp = await post('/api/reminders', reminderData)
            mutate()
            return resp
        },
        updateStatus: async (id: string, status: string) => {
            const resp = await patch(`/api/reminders/${id}/status`, { status })
            mutate()
            return resp
        },
        deleteReminder: async (id: string) => {
            const resp = await del(`/api/reminders/${id}`)
            mutate()
            return resp
        }
    }
}
