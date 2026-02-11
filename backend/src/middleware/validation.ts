import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { ApiError } from '../types'

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const apiError: ApiError = new Error('Datos inválidos')
        apiError.status = 400
        apiError.details = error.errors
        return next(apiError)
      }
      next(error)
    }
  }
}