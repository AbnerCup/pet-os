import { Router } from 'express'
import * as expensesController from '../controllers/expensesController'
import { validate } from '../middleware/validation'
import { createExpenseSchema, updateExpenseSchema } from '../validators/expenses'
import { createActivitySchema, updateActivitySchema } from '../validators/activities'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// ===== EXPENSES =====
// GET /api/expenses
/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Obtener lista de gastos
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: petId
 *         schema:
 *           type: string
 *         description: Filtrar por mascota
 *     responses:
 *       200:
 *         description: Lista de gastos
 */
router.get('/expenses', expensesController.getExpenses)

// POST /api/expenses
/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Registrar un nuevo gasto
 *     tags: [Expenses]
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
 *               - category
 *               - amount
 *               - date
 *             properties:
 *               petId:
 *                 type: string
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gasto registrado exitosamente
 */
router.post('/expenses', validate(createExpenseSchema), expensesController.createExpense)

// GET /api/expenses/:id
/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Obtener un gasto por ID
 *     tags: [Expenses]
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
 *         description: Detalle del gasto
 */
router.get('/expenses/:id', expensesController.getExpenseById)

// PUT /api/expenses/:id
/**
 * @swagger
 * /expenses/{id}:
 *   put:
 *     summary: Actualizar un gasto
 *     tags: [Expenses]
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
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gasto actualizado
 */
router.put('/expenses/:id', validate(updateExpenseSchema), expensesController.updateExpense)

// DELETE /api/expenses/:id
/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Eliminar un gasto
 *     tags: [Expenses]
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
 *         description: Gasto eliminado
 */
router.delete('/expenses/:id', expensesController.deleteExpense)

// ===== ACTIVITIES =====
// GET /api/activities
/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Obtener lista de actividades
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: petId
 *         schema:
 *           type: string
 *         description: Filtrar por mascota
 *     responses:
 *       200:
 *         description: Lista de actividades
 */
router.get('/activities', expensesController.getActivities)

// POST /api/activities
/**
 * @swagger
 * /activities:
 *   post:
 *     summary: Registrar una nueva actividad
 *     tags: [Activities]
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
 *               - duration
 *               - date
 *             properties:
 *               petId:
 *                 type: string
 *               type:
 *                 type: string
 *               duration:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Actividad registrada exitosamente
 */
router.post('/activities', validate(createActivitySchema), expensesController.createActivity)

// PUT /api/activities/:id
/**
 * @swagger
 * /activities/{id}:
 *   put:
 *     summary: Actualizar una actividad
 *     tags: [Activities]
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
 *               duration:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Actividad actualizada
 */
router.put('/activities/:id', validate(updateActivitySchema), expensesController.updateActivity)

// DELETE /api/activities/:id
/**
 * @swagger
 * /activities/{id}:
 *   delete:
 *     summary: Eliminar una actividad
 *     tags: [Activities]
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
 *         description: Actividad eliminada
 */
router.delete('/activities/:id', expensesController.deleteActivity)

export default router