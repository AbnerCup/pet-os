import { z } from 'zod'

export const createHealthSchema = z.object({
  body: z.object({
    petId: z.string().min(1, 'ID de mascota requerido'),
    type: z.string().min(1, 'El tipo es requerido'),
    title: z.string().min(1, 'El título es requerido'),
    date: z.string().datetime('Fecha inválida'),
    nextDate: z.string().datetime().optional(),
    vetName: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['pending', 'completed', 'overdue']).default('pending'),
  })
})

export const updateHealthSchema = z.object({
  body: z.object({
    type: z.string().min(1, 'El tipo es requerido').optional(),
    title: z.string().min(1, 'El título es requerido').optional(),
    date: z.string().datetime('Fecha inválida').optional(),
    nextDate: z.string().datetime().optional(),
    vetName: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['pending', 'completed', 'overdue']).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID de registro requerido')
  })
})

export const listHealthSchema = z.object({
  query: z.object({
    petId: z.string().optional(),
    status: z.enum(['pending', 'completed', 'overdue']).optional(),
    limit: z.string().transform(Number).optional(),
    offset: z.string().transform(Number).optional(),
  })
})