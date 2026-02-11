import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Asegurar que existe el directorio de subidas
const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        // Generar nombre único: timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)

        if (extname && mimetype) {
            return cb(null, true)
        } else {
            cb(new Error('Solo se permiten imágenes'))
        }
    }
})

router.post('/', upload.single('file'), (req, res) => {
    console.log('--- Backend: Recibida petición de subida ---')
    console.log('Archivo recibido:', req.file ? req.file.originalname : 'NINGUNO')
    try {
        if (!req.file) {
            console.error('Error: Multer no capturó el archivo')
            return res.status(400).json({ success: false, error: 'No se subió ningún archivo' })
        }

        // Construir ruta relativa
        const imageUrl = `/uploads/${req.file.filename}`

        res.json({
            success: true,
            message: 'Imagen subida exitosamente',
            imageUrl: imageUrl
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al procesar la subida'
        })
    }
})

export default router
