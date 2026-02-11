import { Router } from 'express'
import * as healthController from '../controllers/healthController'
import { validate } from '../middleware/validation'
import { createHealthSchema, updateHealthSchema, listHealthSchema } from '../validators/health'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// GET /api/health
router.get('/', validate(listHealthSchema), healthController.getHealthRecords)

// POST /api/health
router.post('/', validate(createHealthSchema), healthController.createHealthRecord)

// GET /api/health/:id
router.get('/:id', healthController.getHealthRecordById)

// PUT /api/health/:id
router.put('/:id', validate(updateHealthSchema), healthController.updateHealthRecord)

// DELETE /api/health/:id
router.delete('/:id', healthController.deleteHealthRecord)

export default router