import { Router } from 'express'
import * as locationController from '../controllers/locationController'
import { authenticateToken, requirePlan } from '../middleware/auth'

const router = Router()

// Requiere autenticación y plan BASIC o FAMILY
router.use(authenticateToken)
router.use(requirePlan(['BASIC', 'FAMILY']))

// GET /api/location
router.get('/', locationController.getLocationLogs)

// POST /api/location
router.post('/', locationController.createLocationLog)

export default router