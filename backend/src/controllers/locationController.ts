import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'

export const getLocationLogs = async (req: AuthRequest, res: Response) => {
  const { petId, limit = 100 } = req.query

  const locations = await prisma.locationLog.findMany({
    where: {
      pet: {
        userId: req.user!.id,
        ...(petId && { id: petId as string })
      }
    },
    orderBy: { timestamp: 'desc' },
    take: Number(limit),
    include: { pet: { select: { name: true } } }
  })

  res.json({
    success: true,
    data: locations
  })
}

export const createLocationLog = async (req: AuthRequest, res: Response) => {
  const { petId, latitude, longitude, accuracy, battery } = req.body

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

  const location = await prisma.locationLog.create({
    data: {
      petId,
      latitude,
      longitude,
      accuracy,
      battery,
    }
  })

  res.status(201).json({
    success: true,
    message: 'Ubicación registrada exitosamente',
    data: location
  })
}