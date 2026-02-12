import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'
import { seedReminders } from '../utils/reminderSeeds'

export const getPets = async (req: AuthRequest, res: Response) => {
  const pets = await prisma.pet.findMany({
    where: { userId: req.user!.id },
    include: {
      expenses: { select: { amount: true } },
      healthRecords: {
        select: { id: true, type: true, status: true, date: true, nextDate: true, notes: true },
        orderBy: { date: 'desc' },
        take: 5
      },
      activities: {
        select: { id: true, type: true, date: true, duration: true },
        orderBy: { date: 'desc' },
        take: 5
      },
      reminders: {
        where: { status: 'PENDIENTE' },
        orderBy: { dueDate: 'asc' },
        take: 3
      }
    },
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
      reminders: { orderBy: { dueDate: 'asc' } }
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

  console.log('[BACKEND] CreatePet Check:', {
    userId: req.user!.id,
    userEmail: req.user!.email,
    plan: req.user!.plan,
    petCount,
    maxPets,
    canAdd: petCount < maxPets
  })

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

  // Generar recordatorios automáticos
  await seedReminders(pet)

  // Determinar si es adulto para el flag requiresOnboarding
  const requiresOnboarding = pet.birthDate
    ? (new Date().getTime() - new Date(pet.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365) >= 1
    : false

  res.status(201).json({
    success: true,
    message: 'Mascota creada exitosamente y recordatorios programados',
    data: {
      ...pet,
      requiresOnboarding
    }
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