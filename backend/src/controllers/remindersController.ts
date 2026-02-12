import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'

export const getReminders = async (req: AuthRequest, res: Response) => {
    try {
        const reminders = await prisma.reminder.findMany({
            where: {
                pet: {
                    userId: req.user!.id
                }
            },
            include: {
                pet: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        })

        res.json({
            success: true,
            data: reminders
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al obtener recordatorios'
        })
    }
}

export const createReminder = async (req: AuthRequest, res: Response) => {
    const { petId, type, title, dueDate, isRecurring, frequencyMonths } = req.body

    try {
        // Verificar que la mascota pertenece al usuario
        const pet = await prisma.pet.findFirst({
            where: { id: petId, userId: req.user!.id }
        })

        if (!pet) {
            return res.status(404).json({
                success: false,
                error: 'Mascota no encontrada'
            })
        }

        const reminder = await prisma.reminder.create({
            data: {
                petId,
                type,
                title,
                dueDate: new Date(dueDate),
                isRecurring: isRecurring || false,
                frequencyMonths: frequencyMonths ? parseInt(frequencyMonths) : null,
            }
        })

        res.status(201).json({
            success: true,
            data: reminder
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al crear recordatorio'
        })
    }
}

export const updateReminderStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { status } = req.body

    try {
        const reminder = await prisma.reminder.findFirst({
            where: {
                id,
                pet: { userId: req.user!.id }
            }
        })

        if (!reminder) {
            return res.status(404).json({
                success: false,
                error: 'Recordatorio no encontrado'
            })
        }

        const updated = await prisma.reminder.update({
            where: { id },
            data: { status }
        })

        res.json({
            success: true,
            data: updated
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al actualizar recordatorio'
        })
    }
}

export const deleteReminder = async (req: AuthRequest, res: Response) => {
    const { id } = req.params

    try {
        const reminder = await prisma.reminder.findFirst({
            where: {
                id,
                pet: { userId: req.user!.id }
            }
        })

        if (!reminder) {
            return res.status(404).json({
                success: false,
                error: 'Recordatorio no encontrado'
            })
        }

        await prisma.reminder.delete({
            where: { id }
        })

        res.json({
            success: true,
            message: 'Recordatorio eliminado'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al eliminar recordatorio'
        })
    }
}
