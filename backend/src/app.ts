import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { httpLogger } from './middleware/logging'
import { morganStream } from './utils/logger'
import { logInfo } from './utils/logger'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'

import { corsConfig } from './config/cors'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Logging de la aplicación
logInfo('Starting Pet-OS Backend Server', {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  timestamp: new Date().toISOString()
})

// Middleware de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}))

// CORS y cabeceras de recursos
app.use(corsConfig)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
})
app.use(compression())

// Middleware de logging HTTP
app.use(morgan('combined', { stream: morganStream }))
app.use(httpLogger)

// Archivos estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Middleware básico
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Ruta de health check (pública)
app.get('/api/health-check', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

// Documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Rutas de la aplicación
app.use(routes)

// Manejo de errores (debe ir después de las rutas)
app.use(notFoundHandler)
app.use(errorHandler)

export default app