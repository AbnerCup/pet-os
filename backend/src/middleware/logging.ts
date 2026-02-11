import { Request, Response, NextFunction } from 'express'
import { logUserAction, logAPIError, morganStream } from '../utils/logger'
import { AuthRequest } from '../types'

// Middleware para logging de peticiones HTTP
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  // Log inicial de la petición
  const userId = (req as AuthRequest).user?.id
  if (userId) {
    logUserAction(userId, `HTTP ${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
  }

  // Capturar respuesta
  res.on('finish', () => {
    const duration = Date.now() - start
    const message = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
    
    if (res.statusCode >= 400) {
      logAPIError(req, new Error(`HTTP ${res.statusCode}`))
    }
  })

  next()
}

// Middleware específico para acciones importantes
export const actionLogger = (action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    if (userId) {
      logUserAction(userId, action, {
        method: req.method,
        path: req.path,
        body: sanitizeBody(req.body),
        params: req.params,
        query: req.query
      })
    }
    next()
  }
}

// Función para sanitizar datos sensibles
const sanitizeBody = (body: any) => {
  if (!body) return {}
  
  const sensitiveFields = ['password', 'token', 'secret', 'key']
  const sanitized = { ...body }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}

export default httpLogger