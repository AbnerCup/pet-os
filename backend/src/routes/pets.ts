import { Router } from 'express'
import * as petsController from '../controllers/petsController'
import { validate } from '../middleware/validation'
import { createPetSchema, updatePetSchema, getPetSchema } from '../validators/pets'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// GET /api/pets
/**
 * @swagger
 * /pets:
 *   get:
 *     summary: Obtener todas las mascotas del usuario
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mascotas
 */
router.get('/', petsController.getPets)

// POST /api/pets
/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Crear una nueva mascota
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - species
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *               breed:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date-time
 *               weight:
 *                 type: number
 *               photoUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mascota creada exitosamente
 */
router.post('/', validate(createPetSchema), petsController.createPet)

// GET /api/pets/:id
/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Obtener detalle de una mascota
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Detalle de la mascota
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/:id', validate(getPetSchema), petsController.getPetById)

// PUT /api/pets/:id
/**
 * @swagger
 * /pets/{id}:
 *   put:
 *     summary: Actualizar una mascota
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *               breed:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date-time
 *               weight:
 *                 type: number
 *               photoUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mascota actualizada exitosamente
 */
router.put('/:id', validate(updatePetSchema), petsController.updatePet)

// DELETE /api/pets/:id
/**
 * @swagger
 * /pets/{id}:
 *   delete:
 *     summary: Eliminar una mascota
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Mascota eliminada exitosamente
 */
router.delete('/:id', validate(getPetSchema), petsController.deletePet)

export default router