import { Router } from 'express'
import * as locationController from '../controllers/locationController'
import { authenticateToken, requirePlan } from '../middleware/auth'

const router = Router()

// Requiere autenticación y plan BASIC o FAMILY
router.use(authenticateToken)
router.use(requirePlan(['BASIC', 'FAMILY']))

// ─────────────────────────────────────────────────────────
//  GET /api/location
//  Historial de ubicaciones (filtrable por petId y limit)
// ─────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────
//  GET /api/location/latest
//  Última ubicación de TODAS las mascotas del usuario
// ─────────────────────────────────────────────────────────
/**
 * @swagger
 * /location/latest:
 *   get:
 *     summary: Obtener la última ubicación de todas las mascotas
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array con { pet, location } por cada mascota
 */
router.get('/latest', locationController.getLatestLocations)

// ─────────────────────────────────────────────────────────
//  GET /api/location/latest/:petId
//  Última ubicación de UNA mascota específica
// ─────────────────────────────────────────────────────────
/**
 * @swagger
 * /location/latest/{petId}:
 *   get:
 *     summary: Obtener la última ubicación de una mascota
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Objeto { pet, location }
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/latest/:petId', locationController.getLatestPetLocation)

// ─────────────────────────────────────────────────────────
//  POST /api/location
//  Registrar UNA ubicación
// ─────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────
//  POST /api/location/bulk
//  Registrar MÚLTIPLES ubicaciones (lote para IoT)
// ─────────────────────────────────────────────────────────
/**
 * @swagger
 * /location/bulk:
 *   post:
 *     summary: Registrar múltiples ubicaciones en lote (IoT)
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
 *               - locations
 *             properties:
 *               locations:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   type: object
 *                   required:
 *                     - petId
 *                     - latitude
 *                     - longitude
 *                   properties:
 *                     petId:
 *                       type: string
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *                     accuracy:
 *                       type: number
 *                     battery:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       201:
 *         description: Ubicaciones registradas
 */
router.post('/bulk', locationController.createBulkLocationLogs)

export default router