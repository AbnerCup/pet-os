import { Router } from 'express'
import * as petsController from '../controllers/petsController'
import { validate } from '../middleware/validation'
import { createPetSchema, updatePetSchema, getPetSchema } from '../validators/pets'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// GET /api/pets
router.get('/', petsController.getPets)

// POST /api/pets
router.post('/', validate(createPetSchema), petsController.createPet)

// GET /api/pets/:id
router.get('/:id', validate(getPetSchema), petsController.getPetById)

// PUT /api/pets/:id
router.put('/:id', validate(updatePetSchema), petsController.updatePet)

// DELETE /api/pets/:id
router.delete('/:id', validate(getPetSchema), petsController.deletePet)

export default router