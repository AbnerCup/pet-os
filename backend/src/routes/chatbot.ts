import { Router } from 'express'
import * as chatbotController from '../controllers/chatbotController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Todas las rutas del chatbot requieren autenticación
router.use(authenticateToken)

/**
 * @swagger
 * /chatbot/ask:
 *   post:
 *     summary: Realizar una consulta al asistente virtual (Gemini)
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: La pregunta del usuario
 *     responses:
 *       200:
 *         description: Respuesta del asistente
 *       401:
 *         description: No autorizado
 */
router.post('/ask', chatbotController.askChatbot)

export default router
