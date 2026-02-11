import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 intentos por IP (aumentado para testing)
  message: {
    error: 'Demasiados intentos. Inténtalo nuevamente en 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Demasiados intentos. Inténtalo nuevamente en 15 minutos.',
      retryAfter: '15 minutos'
    })
  }
})

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  message: {
    error: 'Demasiadas peticiones. Inténtalo nuevamente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})