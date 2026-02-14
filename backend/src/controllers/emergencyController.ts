import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'

export const createEmergency = async (req: AuthRequest, res: Response) => {
    const { petId, type, latitude, longitude } = req.body
    const userId = req.user?.id

    if (req.user?.plan !== 'FAMILY') {
        return res.status(403).json({
            success: false,
            error: 'El sistema SOS solo está disponible para el plan Family'
        })
    }

    try {
        const emergency = await prisma.emergency.create({
            data: {
                userId: userId!,
                petId,
                type,
                latitude,
                longitude,
                status: 'ACTIVE'
            },
            include: {
                pet: true
            }
        })

        // Aquí se podrían enviar notificaciones Push o SMS en el futuro
        console.log(`[SOS] Emergencia activada para ${emergency.pet.name}: ${type}`)

        res.status(201).json({
            success: true,
            data: emergency
        })
    } catch (error) {
        console.error('[EMERGENCY_ERROR]', error)
        res.status(500).json({
            success: false,
            error: 'Error al activar la emergencia'
        })
    }
}

export const getActiveEmergencies = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id

    try {
        const emergencies = await prisma.emergency.findMany({
            where: {
                userId,
                status: 'ACTIVE'
            },
            include: {
                pet: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        res.json({
            success: true,
            data: emergencies
        })
    } catch (error) {
        console.error('[GET_EMERGENCY_ERROR]', error)
        res.status(500).json({
            success: false,
            error: 'Error al obtener emergencias activas'
        })
    }
}

export const resolveEmergency = async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const userId = req.user?.id

    try {
        const emergency = await prisma.emergency.findFirst({
            where: { id, userId }
        })

        if (!emergency) {
            return res.status(404).json({
                success: false,
                error: 'Emergencia no encontrada'
            })
        }

        const updated = await prisma.emergency.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date()
            }
        })

        res.json({
            success: true,
            data: updated
        })
    } catch (error) {
        console.error('[RESOLVE_EMERGENCY_ERROR]', error)
        res.status(500).json({
            success: false,
            error: 'Error al resolver la emergencia'
        })
    }
}
