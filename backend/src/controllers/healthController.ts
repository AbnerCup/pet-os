import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'

export const getHealthRecords = async (req: AuthRequest, res: Response) => {
  const { petId, status, limit = 50, offset = 0 } = req.query

  const records = await prisma.healthRecord.findMany({
    where: {
      pet: {
        userId: req.user!.id,
        ...(petId && { id: petId as string })
      },
      ...(status && { status: status as string })
    },
    orderBy: { date: 'desc' },
    take: Number(limit),
    skip: Number(offset),
    include: { pet: { select: { name: true } } }
  })

  res.json({
    success: true,
    data: records
  })
}

export const getHealthRecordById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  const record = await prisma.healthRecord.findFirst({
    where: {
      id,
      pet: { userId: req.user!.id }
    },
    include: { pet: { select: { name: true, species: true } } }
  })

  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'Registro de salud no encontrado'
    })
  }

  res.json({
    success: true,
    data: record
  })
}

export const createHealthRecord = async (req: AuthRequest, res: Response) => {
  const { petId, type, title, date, nextDate, vetName, notes, status = 'pending' } = req.body

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

  const record = await prisma.healthRecord.create({
    data: {
      petId,
      type,
      title,
      date: new Date(date),
      nextDate: nextDate ? new Date(nextDate) : null,
      vetName,
      notes,
      status,
    }
  })

  res.status(201).json({
    success: true,
    message: 'Registro de salud creado exitosamente',
    data: record
  })
}

export const updateHealthRecord = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { type, title, date, nextDate, vetName, notes, status } = req.body

  // Verificar que el registro pertenece al usuario
  const existingRecord = await prisma.healthRecord.findFirst({
    where: {
      id,
      pet: { userId: req.user!.id }
    }
  })

  if (!existingRecord) {
    return res.status(404).json({
      success: false,
      error: 'Registro de salud no encontrado'
    })
  }

  const record = await prisma.healthRecord.update({
    where: { id },
    data: {
      ...(type && { type }),
      ...(title && { title }),
      ...(date && { date: new Date(date) }),
      ...(nextDate !== undefined && { nextDate: nextDate ? new Date(nextDate) : null }),
      ...(vetName !== undefined && { vetName }),
      ...(notes !== undefined && { notes }),
      ...(status && { status }),
    }
  })

  res.json({
    success: true,
    message: 'Registro de salud actualizado exitosamente',
    data: record
  })
}

export const deleteHealthRecord = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  // Verificar que el registro pertenece al usuario
  const existingRecord = await prisma.healthRecord.findFirst({
    where: {
      id,
      pet: { userId: req.user!.id }
    }
  })

  if (!existingRecord) {
    return res.status(404).json({
      success: false,
      error: 'Registro de salud no encontrado'
    })
  }

  await prisma.healthRecord.delete({
    where: { id }
  })

  res.json({
    success: true,
    message: 'Registro de salud eliminado exitosamente'
  })
}