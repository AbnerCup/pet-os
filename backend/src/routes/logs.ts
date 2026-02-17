import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { logInfo, logError, logWarn } from '../utils/logger';

const router = Router();

/**
 * POST /api/logs/mobile
 * Recibe logs desde la aplicación móvil
 * Solo disponible en producción (NODE_ENV=production)
 */
router.post('/mobile', authenticate, (req, res) => {
  try {
    const { logs } = req.body;
    const userId = req.user?.userId;

    if (!Array.isArray(logs)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se esperaba un array de logs' 
      });
    }

    // Procesar cada log recibido
    logs.forEach((log: any) => {
      const logData = {
        source: 'mobile',
        userId: userId || log.userId,
        screen: log.screen,
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        data: log.data,
      };

      switch (log.level) {
        case 'ERROR':
          logError('[Mobile] ' + log.message, logData);
          break;
        case 'WARN':
          logWarn('[Mobile] ' + log.message, logData);
          break;
        case 'DEBUG':
          // Solo loguear debug si estamos en desarrollo
          if (process.env.NODE_ENV !== 'production') {
            logInfo('[Mobile][DEBUG] ' + log.message, logData);
          }
          break;
        default:
          logInfo('[Mobile] ' + log.message, logData);
      }
    });

    res.json({ 
      success: true, 
      message: `${logs.length} logs procesados` 
    });
  } catch (error) {
    logError('Error procesando logs mobile', { error });
    res.status(500).json({ 
      success: false, 
      error: 'Error procesando logs' 
    });
  }
});

/**
 * GET /api/logs/health
 * Verificación de que el servicio de logs está funcionando
 */
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Log service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
