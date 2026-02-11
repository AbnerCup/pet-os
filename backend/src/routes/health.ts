import { Router } from 'express'
import * as healthController from '../controllers/healthController'
import { validate } from '../middleware/validation'
import { createHealthSchema, updateHealthSchema, listHealthSchema } from '../validators/health'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// GET /api/health
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Obtener lista de registros de salud
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: petId
 *         schema:
 *           type: string
 *         description: Filtrar por mascota
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, overdue]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de registros recuperada exitosamente
 */
router.get('/', validate(listHealthSchema), healthController.getHealthRecords)

// POST /api/health
/**
 * @swagger
 * /health:
 *   post:
 *     summary: Registrar un nuevo evento de salud
 *     tags: [Health]
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
 *               - type
 *               - title
 *               - date
 *             properties:
 *               petId:
 *                 type: string
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               nextDate:
 *                 type: string
 *                 format: date-time
 *               vetName:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, completed, overdue]
 *     responses:
 *       201:
 *         description: Registro de salud creado exitosamente
 */
router.post('/', validate(createHealthSchema), healthController.createHealthRecord)

// GET /api/health/:id
/**
 * @swagger
 * /health/{id}:
 *   get:
 *     summary: Obtener detalle de un registro de salud
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del registro de salud
 */
router.get('/:id', healthController.getHealthRecordById)

// PUT /api/health/:id
/**
 * @swagger
 * /health/{id}:
 *   put:
 *     summary: Actualizar un registro de salud
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               nextDate:
 *                 type: string
 *                 format: date-time
 *               vetName:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, completed, overdue]
 *     responses:
 *       200:
 *         description: Registro actualizado
 */
router.put('/:id', validate(updateHealthSchema), healthController.updateHealthRecord)

// DELETE /api/health/:id
/**
 * @swagger
 * /health/{id}:
 *   delete:
 *     summary: Eliminar un registro de salud
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro eliminado
 */
router.delete('/:id', healthController.deleteHealthRecord)

export default router