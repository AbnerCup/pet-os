import { z } from 'zod'

// GASTOS
export const createExpenseSchema = z.object({
  body: z.object({
    petId: z.string().min(1, 'ID de mascota requerido'),
    category: z.string().min(1, 'La categoría es requerida'),
    amount: z.string().transform((val) => parseFloat(val)).refine(val => val > 0, 'El monto debe ser mayor a 0'),
    date: z.string().datetime('Fecha inválida'),
    description: z.string().optional(),
  })
})

export const updateExpenseSchema = z.object({
  body: z.object({
    category: z.string().min(1, 'La categoría es requerida').optional(),
    amount: z.string().transform(parseFloat).refine(val => val > 0, 'El monto debe ser mayor a 0').optional(),
    date: z.string().datetime('Fecha inválida').optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID de gasto requerido')
  })
})

// ACTIVIDADES
export const createActivitySchema = z.object({
  body: z.object({
    petId: z.string().min(1, 'ID de mascota requerido'),
    type: z.string().min(1, 'El tipo es requerido'),
    duration: z.string().transform(Number).refine(val => val > 0, 'La duración debe ser mayor a 0'),
    date: z.string().datetime('Fecha inválida'),
    notes: z.string().optional(),
  })
})

export const updateActivitySchema = z.object({
  body: z.object({
    type: z.string().min(1, 'El tipo es requerido').optional(),
    duration: z.string().transform(Number).refine(val => val > 0, 'La duración debe ser mayor a 0').optional(),
    date: z.string().datetime('Fecha inválida').optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID de actividad requerido')
  })
})

export const listActivitiesSchema = z.object({
  query: z.object({
    petId: z.string().optional(),
    type: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    limit: z.string().transform(Number).optional(),
    offset: z.string().transform(Number).optional(),
  })
})