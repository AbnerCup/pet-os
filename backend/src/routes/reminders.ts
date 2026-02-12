import { Router } from 'express'
import * as remindersController from '../controllers/remindersController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.use(authenticateToken)

router.get('/', remindersController.getReminders)
router.post('/', remindersController.createReminder)
router.patch('/:id/status', remindersController.updateReminderStatus)
router.delete('/:id', remindersController.deleteReminder)

export default router
