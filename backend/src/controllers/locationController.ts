import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'

// GET /api/location — historial general (filtrable por petId)
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
    include: { pet: { select: { name: true, species: true, photoUrl: true } } }
  })

  res.json({
    success: true,
    data: locations
  })
}

// POST /api/location — registrar nueva ubicación
export const createLocationLog = async (req: AuthRequest, res: Response) => {
  const { petId, latitude, longitude, accuracy, battery } = req.body

  if (!petId || latitude == null || longitude == null) {
    return res.status(400).json({
      success: false,
      error: 'petId, latitude y longitude son requeridos'
    })
  }

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
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracy: accuracy != null ? Number(accuracy) : null,
      battery: battery != null ? Number(battery) : null,
    }
  })

  res.status(201).json({
    success: true,
    message: 'Ubicación registrada exitosamente',
    data: location
  })
}

// GET /api/location/latest — última ubicación de TODAS las mascotas del usuario
export const getLatestLocations = async (req: AuthRequest, res: Response) => {
  // Obtener todas las mascotas del usuario
  const pets = await prisma.pet.findMany({
    where: { userId: req.user!.id },
    select: { id: true, name: true, species: true, photoUrl: true }
  })

  // Para cada mascota, obtener la última ubicación
  const results = await Promise.all(
    pets.map(async (pet) => {
      const lastLocation = await prisma.locationLog.findFirst({
        where: { petId: pet.id },
        orderBy: { timestamp: 'desc' },
      })

      return {
        pet,
        location: lastLocation || null,
      }
    })
  )

  res.json({
    success: true,
    data: results
  })
}

// GET /api/location/latest/:petId — última ubicación de UNA mascota
export const getLatestPetLocation = async (req: AuthRequest, res: Response) => {
  const { petId } = req.params

  // Verificar que la mascota pertenece al usuario
  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId: req.user!.id },
    select: { id: true, name: true, species: true, photoUrl: true }
  })

  if (!pet) {
    return res.status(404).json({
      success: false,
      error: 'Mascota no encontrada'
    })
  }

  const lastLocation = await prisma.locationLog.findFirst({
    where: { petId },
    orderBy: { timestamp: 'desc' },
  })

  res.json({
    success: true,
    data: {
      pet,
      location: lastLocation || null,
    }
  })
}

// POST /api/location/bulk — registrar múltiples ubicaciones de golpe 
// (útil para IoT que envía batch de posiciones acumuladas)
export const createBulkLocationLogs = async (req: AuthRequest, res: Response) => {
  const { locations } = req.body
  // locations = [{ petId, latitude, longitude, accuracy?, battery?, timestamp? }, ...]

  if (!Array.isArray(locations) || locations.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Se requiere un array de ubicaciones'
    })
  }

  if (locations.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Máximo 100 ubicaciones por lote'
    })
  }

  // Verificar que todas las mascotas pertenecen al usuario
  const petIds = [...new Set(locations.map((l: any) => l.petId))]
  const userPets = await prisma.pet.findMany({
    where: { id: { in: petIds }, userId: req.user!.id },
    select: { id: true }
  })
  const validPetIds = new Set(userPets.map(p => p.id))

  const invalidPets = petIds.filter(id => !validPetIds.has(id))
  if (invalidPets.length > 0) {
    return res.status(403).json({
      success: false,
      error: `Mascotas no válidas: ${invalidPets.join(', ')}`
    })
  }

  // Crear todas las ubicaciones
  const created = await prisma.locationLog.createMany({
    data: locations.map((l: any) => ({
      petId: l.petId,
      latitude: Number(l.latitude),
      longitude: Number(l.longitude),
      accuracy: l.accuracy != null ? Number(l.accuracy) : null,
      battery: l.battery != null ? Number(l.battery) : null,
      ...(l.timestamp && { timestamp: new Date(l.timestamp) }),
    }))
  })

  res.status(201).json({
    success: true,
    message: `${created.count} ubicaciones registradas`,
    data: { count: created.count }
  })
}