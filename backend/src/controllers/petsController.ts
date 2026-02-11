import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'

export const getPets = async (req: AuthRequest, res: Response) => {
  const pets = await prisma.pet.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' }
  })

  res.json({
    success: true,
    data: pets
  })
}

export const getPetById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  const pet = await prisma.pet.findFirst({
    where: { id, userId: req.user!.id },
    include: {
      healthRecords: { orderBy: { date: 'desc' } },
      activities: { orderBy: { date: 'desc' }, take: 10 },
      expenses: { orderBy: { date: 'desc' }, take: 5 },
    }
  })

  if (!pet) {
    return res.status(404).json({
      success: false,
      error: 'Mascota no encontrada'
    })
  }

  res.json({
    success: true,
    data: pet
  })
}

export const createPet = async (req: AuthRequest, res: Response) => {
  const { name, species, breed, birthDate, weight, photoUrl } = req.body

  // Validar límite según plan
  const petCount = await prisma.pet.count({ where: { userId: req.user!.id } })
  const maxPets = req.user!.plan === 'FREE' ? 1 : req.user!.plan === 'BASIC' ? 3 : 999

  if (petCount >= maxPets) {
    return res.status(403).json({
      success: false,
      error: 'Límite de mascotas alcanzado',
      details: { limit: maxPets, current: petCount }
    })
  }

  const pet = await prisma.pet.create({
    data: {
      name,
      species,
      breed,
      birthDate: birthDate ? new Date(birthDate) : null,
      weight: weight ? parseFloat(weight) : null,
      photoUrl: photoUrl || null,
      userId: req.user!.id,
    }
  })

  res.status(201).json({
    success: true,
    message: 'Mascota creada exitosamente',
    data: pet
  })
}

export const updatePet = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { name, species, breed, birthDate, weight, photoUrl } = req.body

  // Verificar que la mascota pertenece al usuario
  const existingPet = await prisma.pet.findFirst({
    where: { id, userId: req.user!.id }
  })

  if (!existingPet) {
    return res.status(404).json({
      success: false,
      error: 'Mascota no encontrada'
    })
  }

  const pet = await prisma.pet.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(species && { species }),
      ...(breed !== undefined && { breed }),
      ...(birthDate && { birthDate: new Date(birthDate) }),
      ...(weight !== undefined && { weight: parseFloat(weight) }),
      ...(photoUrl !== undefined && { photoUrl: photoUrl || null }),
    }
  })

  res.json({
    success: true,
    message: 'Mascota actualizada exitosamente',
    data: pet
  })
}

export const deletePet = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  // Verificar que la mascota pertenece al usuario
  const existingPet = await prisma.pet.findFirst({
    where: { id, userId: req.user!.id }
  })

  if (!existingPet) {
    return res.status(404).json({
      success: false,
      error: 'Mascota no encontrada'
    })
  }

  // Soft delete - actualizar con un flag o archivar
  // Por ahora usamos hard delete con confirmación
  await prisma.pet.delete({
    where: { id }
  })

  res.json({
    success: true,
    message: 'Mascota eliminada exitosamente'
  })
}