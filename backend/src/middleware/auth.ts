import jwt from 'jsonwebtoken'
import { Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { AuthRequest, ApiError } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      const error: ApiError = new Error('Token requerido')
      error.status = 401
      throw error
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Verificar que el usuario todavía existe y obtener plan actualizado
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, plan: true }
    })

    if (!user) {
      const error: ApiError = new Error('Usuario no encontrado')
      error.status = 401
      throw error
    }

    req.user = user
    next()
  } catch (err) {
    const error: ApiError = err as ApiError
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error.status = 403
      error.message = 'Token inválido o expirado'
    }
    next(error)
  }
}

export const requirePlan = (plans: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !plans.includes(req.user.plan)) {
      const error: ApiError = new Error('Plan requerido')
      error.status = 403
      error.details = {
        required: plans,
        current: req.user?.plan
      }
      return next(error)
    }
    next()
  }
}