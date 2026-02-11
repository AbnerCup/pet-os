import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ApiError } from '../types'
import { logError, logAPIError } from '../utils/logger'

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Logging estructurado del error
  logAPIError(req, err)

  // Errores de Zod (validación)
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: err.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message
      }))
    })
  }

  // Errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(400).json({
          success: false,
          error: 'Registro duplicado',
          details: 'Ya existe un registro con estos datos'
        })
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: 'Registro no encontrado'
        })
      default:
        return res.status(500).json({
          success: false,
          error: 'Error en la base de datos'
        })
    }
  }

  // Errores de API con status personalizado
  if ((err as ApiError).status) {
    const apiError = err as ApiError
    return res.status(apiError.status!).json({
      success: false,
      error: apiError.message,
      ...(apiError.details && { details: apiError.details })
    })
  }

  // Errores de Multer
  if (err.message === 'Unexpected field') {
    return res.status(400).json({
      success: false,
      error: 'Campo de archivo inválido',
      details: 'El servidor esperaba un campo llamado "file"'
    })
  }

  // Error genérico
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  })
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    details: `No se encontró la ruta ${req.method} ${req.path}`
  })
}