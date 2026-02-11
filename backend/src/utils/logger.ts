import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

// Niveles de logging personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Colores para consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

// Formato personalizado
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

// Formato para archivos (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

// Transportes
const transports = [
  // Console - para desarrollo
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format,
  }),
  
  // Archivo de errores
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  
  // Archivo combinado
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),
]

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
})

// Stream para Morgan (HTTP logging)
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

// Funciones helper para logging estructurado
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta)
}

export const logError = (message: string, error?: Error | any) => {
  logger.error(message, {
    error: error?.message || error,
    stack: error?.stack,
    ...error
  })
}

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta)
}

export const logHTTP = (message: string) => {
  logger.http(message)
}

// Logging de operaciones de usuario
export const logUserAction = (userId: string, action: string, details?: any) => {
  logger.info(`User Action: ${action}`, {
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details
  })
}

// Logging de operaciones de base de datos
export const logDatabase = (operation: string, table: string, details?: any) => {
  logger.debug(`DB Operation: ${operation} on ${table}`, {
    operation,
    table,
    timestamp: new Date().toISOString(),
    ...details
  })
}

// Logging de seguridad
export const logSecurity = (event: string, details?: any) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details
  })
}

// Logging de errores de API
export const logAPIError = (req: any, error: Error | any) => {
  logger.error('API Error', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })
}

export default logger