'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Battery, Info, Calendar, AlertTriangle } from 'lucide-react'
import { usePets } from '@/hooks/usePets'

// URL Helper
const ENV_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const BASE_URL = ENV_URL.endsWith('/api') ? ENV_URL : `${ENV_URL}/api`

interface Notification {
    id: string
    title: string
    message: string
    time: string
    type: 'info' | 'warning' | 'success' | 'activity'
    read: boolean
}

export function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const { pets } = usePets()

    // Cerrar al click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // Generar notificaciones dinámicas
    useEffect(() => {
        const fetchNotifications = async () => {
            const newNotifs: Notification[] = []

            // 1. Alertas de Batería (Real Fetch)
            try {
                const token = localStorage.getItem('token')
                if (token) {
                    const res = await fetch(`${BASE_URL}/location/latest`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    if (res.ok) {
                        const json = await res.json()
                        if (json.success) {
                            json.data.forEach((item: any) => {
                                if (item.location && item.location.battery !== null) {
                                    const batt = item.location.battery
                                    if (batt < 20) {
                                        newNotifs.push({
                                            id: `batt-low-${item.pet.id}`,
                                            title: 'Batería Crítica',
                                            message: `${item.pet.name} tiene solo ${batt}% de batería. ¡Cárgalo pronto!`,
                                            time: 'Hace un momento',
                                            type: 'warning',
                                            read: false
                                        })
                                    } else if (batt < 50) {
                                        newNotifs.push({
                                            id: `batt-mid-${item.pet.id}`,
                                            title: 'Batería Baja',
                                            message: `${item.pet.name} está al ${batt}% de batería.`,
                                            time: 'Hace 1h',
                                            type: 'info',
                                            read: false
                                        })
                                    }
                                }
                            })
                        }
                    }
                }
            } catch (e) {
                console.error('Error fetching battery status for notifications', e)
            }

            // 2. Recordatorios basados en mascotas
            if (pets && pets.length > 0) {
                // Ejemplo: Si hay mascotas, sugerir paseo
                newNotifs.push({
                    id: 'daily-walk',
                    title: 'Tiempo de actividad',
                    message: `Es un buen momento para sacar a pasear a ${pets[0].name}.`,
                    time: 'Sugerencia',
                    type: 'activity',
                    read: true
                })
            } else {
                // Si no hay mascotas
                newNotifs.push({
                    id: 'add-pet',
                    title: 'Completa tu perfil',
                    message: 'Añade tu primera mascota para comenzar a rastrearla.',
                    time: 'Ahora',
                    type: 'info',
                    read: false
                })
            }

            // 3. Notificación del sistema (Ejemplo fijo)
            newNotifs.push({
                id: 'sys-welcome',
                title: 'Bienvenido a PetOS',
                message: 'Sistema operativo de mascotas v1.0 activado.',
                time: 'Hoy',
                type: 'success',
                read: true
            })

            setNotifications(newNotifs)
            setUnreadCount(newNotifs.filter(n => !n.read).length)
        }

        fetchNotifications()
        // Intervalo de polling cada 60s
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)

    }, [pets])

    const handleOpen = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            // Marcar como leidas (visual)
            // Opcional: setUnreadCount(0)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5 text-red-500" />
            case 'success': return <Info className="w-5 h-5 text-green-500" />
            case 'activity': return <Calendar className="w-5 h-5 text-blue-500" />
            default: return <Bell className="w-5 h-5 text-sage-500" />
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleOpen}
                className={`relative p-2 rounded-xl transition-all duration-200 ${isOpen ? 'bg-sage-100 text-sage-700' : 'text-stone-600 hover:bg-sage-50'}`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-sage-100 overflow-hidden z-50 transform origin-top-right transition-all">
                    <div className="p-4 border-b border-sage-50 flex justify-between items-center bg-stone-50/50">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-sage-600" />
                            <h3 className="font-semibold text-sage-900">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className="bg-sage-100 text-sage-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                    {unreadCount} nuevas
                                </span>
                            )}
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-200/50 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center text-stone-400 flex flex-col items-center">
                                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="font-medium text-stone-500">Todo está tranquilo</p>
                                <p className="text-sm mt-1">No tienes notificaciones nuevas</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-100">
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-stone-50 transition-colors cursor-default relative group ${!notif.read ? 'bg-blue-50/40' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1 flex-shrink-0 bg-white p-2 rounded-full shadow-sm border border-stone-100 h-fit">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <h4 className={`text-sm font-semibold ${!notif.read ? 'text-sage-900' : 'text-stone-700'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <span className="text-[10px] text-stone-400 font-medium whitespace-nowrap ml-2">
                                                        {notif.time}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-stone-600 leading-relaxed">{notif.message}</p>
                                            </div>
                                        </div>
                                        {!notif.read && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
                            <button
                                onClick={() => {
                                    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                                    setUnreadCount(0)
                                }}
                                className="text-xs font-medium text-sage-600 hover:text-sage-800 transition-colors"
                            >
                                Marcar todas como leídas
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
