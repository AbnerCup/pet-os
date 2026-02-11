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
router.get('/expenses', expensesController.getExpenses)

// POST /api/expenses
router.post('/expenses', validate(createExpenseSchema), expensesController.createExpense)

// GET /api/expenses/:id
router.get('/expenses/:id', expensesController.getExpenseById)

// PUT /api/expenses/:id
router.put('/expenses/:id', validate(updateExpenseSchema), expensesController.updateExpense)

// DELETE /api/expenses/:id
router.delete('/expenses/:id', expensesController.deleteExpense)

// ===== ACTIVITIES =====
// GET /api/activities
router.get('/activities', expensesController.getActivities)

// POST /api/activities
router.post('/activities', validate(createActivitySchema), expensesController.createActivity)

// PUT /api/activities/:id
router.put('/activities/:id', validate(updateActivitySchema), expensesController.updateActivity)

// DELETE /api/activities/:id
router.delete('/activities/:id', expensesController.deleteActivity)

export default router