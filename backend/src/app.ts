import express from 'express'
import dotenv from 'dotenv'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { httpLogger } from './middleware/logging'
import { morganStream } from './utils/logger'
import { logInfo } from './utils/logger'

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
app.use(helmet())
app.use(compression())

// Middleware de logging HTTP
app.use(morgan('combined', { stream: morganStream }))
app.use(httpLogger)

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

// Rutas de la aplicación
app.use(routes)

// Manejo de errores (debe ir después de las rutas)
app.use(notFoundHandler)
app.use(errorHandler)

export default app