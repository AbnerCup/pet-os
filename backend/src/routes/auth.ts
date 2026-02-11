import { Router } from 'express'
import * as authController from '../controllers/authController'
import { validate } from '../middleware/validation'
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth'
import { authenticateToken } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimiter'

const router = Router()

// POST /api/auth/register
router.post('/register', authLimiter, validate(registerSchema), authController.register)

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), authController.login)

// GET /api/me
router.get('/me', authenticateToken, authController.getProfile)

// PUT /api/me
router.put('/me', authenticateToken, validate(updateProfileSchema), authController.updateProfile)

export default router