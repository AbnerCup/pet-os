import { Router } from 'express'
import * as emergencyController from '../controllers/emergencyController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.use(authenticateToken)

/**
 * @swagger
 * /sos:
 *   post:
 *     summary: Activar una emergencia SOS
 *     tags: [SOS]
 */
router.post('/', emergencyController.createEmergency)

/**
 * @swagger
 * /sos/active:
 *   get:
 *     summary: Obtener emergencias activas del usuario
 *     tags: [SOS]
 */
router.get('/active', emergencyController.getActiveEmergencies)

/**
 * @swagger
 * /sos/:id/resolve:
 *   put:
 *     summary: Marcar una emergencia como resuelta
 *     tags: [SOS]
 */
router.put('/:id/resolve', emergencyController.resolveEmergency)

export default router
