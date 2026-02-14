import { Router } from 'express'
import { corsConfig } from '../config/cors'
import { generalLimiter } from '../middleware/rateLimiter'

// Importar rutas
import authRoutes from './auth'
import petsRoutes from './pets'
import healthRoutes from './health'
import expensesRoutes from './expenses'
import locationRoutes from './location'
import remindersRoutes from './reminders'

import uploadRoutes from './upload'
import chatbotRoutes from './chatbot'
import emergencyRoutes from './emergency'

const router = Router()

// Middleware de seguridad y Rate Limiting
router.use(generalLimiter)

// Rutas de la API
router.use('/api/auth', authRoutes)
router.use('/api/pets', petsRoutes)
router.use('/api/health', healthRoutes)
router.use('/api', expensesRoutes) // expenses/ y activities/
router.use('/api/location', locationRoutes)
router.use('/api/reminders', remindersRoutes)
router.use('/api/upload', uploadRoutes)
router.use('/api/chatbot', chatbotRoutes)
router.use('/api/sos', emergencyRoutes)



export default router