'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function RootPage() {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                router.push('/dashboard')
            } else {
                router.push('/auth/login')
            }
        }
    }, [isAuthenticated, loading, router])

    return (
        <div className="flex items-center justify-center min-h-screen bg-stone-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
        </div>
    )
}
