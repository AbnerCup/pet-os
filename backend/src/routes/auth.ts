import { Router } from 'express'
import * as authController from '../controllers/authController'
import { validate } from '../middleware/validation'
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth'
import { authenticateToken } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimiter'

const router = Router()

// POST /api/auth/register
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register)

// POST /api/auth/login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el token
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login)

// GET /api/me
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de usuario recuperado exitosamente
 */
router.get('/me', authenticateToken, authController.getProfile)

// PUT /api/me
/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 */
router.put('/me', authenticateToken, validate(updateProfileSchema), authController.updateProfile)

export default router