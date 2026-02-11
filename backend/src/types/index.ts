import { Request } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    plan: 'FREE' | 'BASIC' | 'FAMILY'
  }
}

export interface ApiError extends Error {
  status?: number
  details?: any
}

export interface PaginationQuery {
  page?: string
  limit?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}