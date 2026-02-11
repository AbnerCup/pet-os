import { Router } from 'express'
import * as locationController from '../controllers/locationController'
import { authenticateToken, requirePlan } from '../middleware/auth'

const router = Router()

// Requiere autenticación y plan BASIC o FAMILY
router.use(authenticateToken)
router.use(requirePlan(['BASIC', 'FAMILY']))

// GET /api/location
/**
 * @swagger
 * /location:
 *   get:
 *     summary: Obtener historial de ubicaciones
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: petId
 *         schema:
 *           type: string
 *         description: Filtrar por mascota
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de registros
 *     responses:
 *       200:
 *         description: Historial de ubicaciones
 */
router.get('/', locationController.getLocationLogs)

// POST /api/location
/**
 * @swagger
 * /location:
 *   post:
 *     summary: Registrar ubicación de una mascota
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - latitude
 *               - longitude
 *             properties:
 *               petId:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               accuracy:
 *                 type: number
 *               battery:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ubicación registrada exitosamente
 */
router.post('/', locationController.createLocationLog)

export default router