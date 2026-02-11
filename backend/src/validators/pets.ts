import { z } from 'zod'

export const createPetSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    species: z.string().min(1, 'La especie es requerida'),
    breed: z.string().optional(),
    birthDate: z.string().optional(), // Más flexible para ISO strings
    weight: z.union([z.string(), z.number()]).transform((val) => typeof val === 'string' ? parseFloat(val) : val).optional(),
    photoUrl: z.string().optional().or(z.literal('')),
  })
})

export const updatePetSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'El nombre es requerido').optional(),
    species: z.string().min(1, 'La especie es requerida').optional(),
    breed: z.string().optional(),
    birthDate: z.string().optional(),
    weight: z.union([z.string(), z.number()]).transform((val) => typeof val === 'string' ? parseFloat(val) : val).optional(),
    photoUrl: z.string().optional().or(z.literal('')),
  }),
  params: z.object({
    id: z.string().min(1, 'ID de mascota requerido')
  })
})

export const getPetSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID de mascota requerido')
  })
})