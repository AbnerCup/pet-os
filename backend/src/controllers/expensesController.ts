import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'

// ===== EXPENSES =====
export const getExpenses = async (req: AuthRequest, res: Response) => {
  const { petId, limit = 50, offset = 0 } = req.query

  const expenses = await prisma.expense.findMany({
    where: { 
      userId: req.user!.id,
      ...(petId && { petId: petId as string })
    },
    orderBy: { date: 'desc' },
    take: Number(limit),
    skip: Number(offset),
    include: { pet: { select: { name: true, photoUrl: true } } }
  })

  res.json({
    success: true,
    data: expenses
  })
}

export const getExpenseById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  const expense = await prisma.expense.findFirst({
    where: { id, userId: req.user!.id },
    include: { pet: { select: { name: true, species: true } } }
  })

  if (!expense) {
    return res.status(404).json({
      success: false,
      error: 'Gasto no encontrado'
    })
  }

  res.json({
    success: true,
    data: expense
  })
}

export const createExpense = async (req: AuthRequest, res: Response) => {
  const { petId, category, amount, date, description } = req.body

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

  const expense = await prisma.expense.create({
    data: {
      petId,
      userId: req.user!.id,
      category,
      amount,
      date: new Date(date),
      description,
    }
  })

  res.status(201).json({
    success: true,
    message: 'Gasto creado exitosamente',
    data: expense
  })
}

export const updateExpense = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { category, amount, date, description } = req.body

  // Verificar que el gasto pertenece al usuario
  const existingExpense = await prisma.expense.findFirst({
    where: { id, userId: req.user!.id }
  })

  if (!existingExpense) {
    return res.status(404).json({
      success: false,
      error: 'Gasto no encontrado'
    })
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...(category && { category }),
      ...(amount && { amount }),
      ...(date && { date: new Date(date) }),
      ...(description !== undefined && { description }),
    }
  })

  res.json({
    success: true,
    message: 'Gasto actualizado exitosamente',
    data: expense
  })
}

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  // Verificar que el gasto pertenece al usuario
  const existingExpense = await prisma.expense.findFirst({
    where: { id, userId: req.user!.id }
  })

  if (!existingExpense) {
    return res.status(404).json({
      success: false,
      error: 'Gasto no encontrado'
    })
  }

  await prisma.expense.delete({
    where: { id }
  })

  res.json({
    success: true,
    message: 'Gasto eliminado exitosamente'
  })
}

// ===== ACTIVITIES =====
export const getActivities = async (req: AuthRequest, res: Response) => {
  const { petId, type, dateFrom, dateTo, limit = 50, offset = 0 } = req.query

  const activities = await prisma.activity.findMany({
    where: {
      pet: {
        userId: req.user!.id,
        ...(petId && { id: petId as string })
      },
      ...(type && { type: type as string }),
      ...(dateFrom && { date: { gte: new Date(dateFrom as string) } }),
      ...(dateTo && { date: { lte: new Date(dateTo as string) } }),
    },
    orderBy: { date: 'desc' },
    take: Number(limit),
    skip: Number(offset),
    include: { pet: { select: { name: true } } }
  })

  res.json({
    success: true,
    data: activities
  })
}

export const createActivity = async (req: AuthRequest, res: Response) => {
  const { petId, type, duration, date, notes } = req.body

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

  const activity = await prisma.activity.create({
    data: {
      petId,
      type,
      duration: Number(duration),
      date: new Date(date),
      notes,
    }
  })

  res.status(201).json({
    success: true,
    message: 'Actividad creada exitosamente',
    data: activity
  })
}

export const updateActivity = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { type, duration, date, notes } = req.body

  // Verificar que la actividad pertenece al usuario
  const existingActivity = await prisma.activity.findFirst({
    where: {
      id,
      pet: { userId: req.user!.id }
    }
  })

  if (!existingActivity) {
    return res.status(404).json({
      success: false,
      error: 'Actividad no encontrada'
    })
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      ...(type && { type }),
      ...(duration && { duration }),
      ...(date && { date: new Date(date) }),
      ...(notes !== undefined && { notes }),
    }
  })

  res.json({
    success: true,
    message: 'Actividad actualizada exitosamente',
    data: activity
  })
}

export const deleteActivity = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  // Verificar que la actividad pertenece al usuario
  const existingActivity = await prisma.activity.findFirst({
    where: {
      id,
      pet: { userId: req.user!.id }
    }
  })

  if (!existingActivity) {
    return res.status(404).json({
      success: false,
      error: 'Actividad no encontrada'
    })
  }

  await prisma.activity.delete({
    where: { id }
  })

  res.json({
    success: true,
    message: 'Actividad eliminada exitosamente'
  })
}