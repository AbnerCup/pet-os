import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/config';

// Configuración del logger
const LOG_CONFIG = {
  // En desarrollo, muestra todos los logs en consola
  // En producción (APK), solo envía logs importantes al servidor
  ENABLE_CONSOLE: __DEV__,
  ENABLE_REMOTE_LOGGING: !__DEV__, // En producción, envía logs al backend
  MAX_LOGS_STORAGE: 100, // Máximo de logs guardados localmente
  BATCH_SIZE: 10, // Enviar logs en lotes de 10
  FLUSH_INTERVAL: 30000, // Enviar logs cada 30 segundos
};

// Niveles de log
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Interfaz para entradas de log
interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  screen?: string;
  userId?: string;
}

// Cola de logs pendientes para enviar al servidor
let pendingLogs: LogEntry[] = [];
let flushInterval: NodeJS.Timeout | null = null;

/**
 * Genera un ID único para cada log
 */
const generateLogId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Guarda logs en AsyncStorage para debugging offline
 */
const saveLogToStorage = async (entry: LogEntry): Promise<void> => {
  try {
    const existingLogs = await AsyncStorage.getItem('app_logs');
    const logs: LogEntry[] = existingLogs ? JSON.parse(existingLogs) : [];
    
    // Agregar nuevo log al inicio
    logs.unshift(entry);
    
    // Mantener solo los últimos N logs
    if (logs.length > LOG_CONFIG.MAX_LOGS_STORAGE) {
      logs.splice(LOG_CONFIG.MAX_LOGS_STORAGE);
    }
    
    await AsyncStorage.setItem('app_logs', JSON.stringify(logs));
  } catch (error) {
    // Silenciar errores de storage
    if (__DEV__) {
      console.error('Error saving log to storage:', error);
    }
  }
};

/**
 * Envía logs al servidor en producción
 */
const sendLogsToServer = async (logs: LogEntry[]): Promise<void> => {
  if (!LOG_CONFIG.ENABLE_REMOTE_LOGGING || logs.length === 0) return;
  
  try {
    // Intenta enviar logs al backend
    // Nota: Necesitarás crear este endpoint en el backend
    await api.post('/logs/mobile', { logs }).catch(() => {
      // Si falla, no hacer nada (los logs se quedan en pending)
    });
  } catch (error) {
    // En producción, no mostrar errores de logging
    if (__DEV__) {
      console.error('Error sending logs to server:', error);
    }
  }
};

/**
 * Procesa la cola de logs pendientes
 */
const flushLogs = async (): Promise<void> => {
  if (pendingLogs.length === 0) return;
  
  const logsToSend = [...pendingLogs];
  pendingLogs = [];
  
  await sendLogsToServer(logsToSend);
};

/**
 * Inicia el intervalo de envío automático de logs
 */
const startFlushInterval = (): void => {
  if (flushInterval) return;
  
  flushInterval = setInterval(() => {
    flushLogs();
  }, LOG_CONFIG.FLUSH_INTERVAL);
};

/**
 * Detiene el intervalo de envío de logs
 */
const stopFlushInterval = (): void => {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
};

/**
 * Logger principal - funciona igual en dev y producción
 */
class Logger {
  private static instance: Logger;
  private currentScreen: string = 'Unknown';
  private userId: string | undefined;

  private constructor() {
    if (!__DEV__) {
      startFlushInterval();
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Establece la pantalla actual para contexto en los logs
   */
  setScreen(screenName: string): void {
    this.currentScreen = screenName;
  }

  /**
   * Establece el ID de usuario para contexto
   */
  setUserId(userId: string | undefined): void {
    this.userId = userId;
  }

  /**
   * Método base para crear un log
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      id: generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? this.sanitizeData(data) : undefined,
      screen: this.currentScreen,
      userId: this.userId,
    };

    // Siempre guardar en AsyncStorage (útil para debugging)
    saveLogToStorage(entry);

    // En desarrollo: mostrar en consola
    if (LOG_CONFIG.ENABLE_CONSOLE) {
      this.printToConsole(entry);
    }

    // En producción: agregar a cola para enviar al servidor
    if (!__DEV__ && LOG_CONFIG.ENABLE_REMOTE_LOGGING) {
      pendingLogs.push(entry);
      
      // Si hay muchos logs pendientes, enviarlos inmediatamente
      if (pendingLogs.length >= LOG_CONFIG.BATCH_SIZE) {
        flushLogs();
      }
    }
  }

  /**
   * Imprime el log en consola con formato
   */
  private printToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level}] [${entry.screen}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data || '');
        break;
    }
  }

  /**
   * Sanitiza datos sensibles antes de enviarlos
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sensitiveFields = ['password', 'token', 'authorization', 'apiKey', 'secret'];
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  // Métodos públicos de logging
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: any): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error;
    
    this.log(LogLevel.ERROR, message, errorData);
    
    // En producción, enviar errores inmediatamente
    if (!__DEV__) {
      flushLogs();
    }
  }

  /**
   * Obtiene los logs almacenados localmente
   */
  async getStoredLogs(): Promise<LogEntry[]> {
    try {
      const logs = await AsyncStorage.getItem('app_logs');
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  /**
   * Limpia los logs almacenados
   */
  async clearLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem('app_logs');
    } catch {
      // Ignorar errores
    }
  }

  /**
   * Envía logs pendientes manualmente
   */
  async flush(): Promise<void> {
    await flushLogs();
  }
}

// Exportar instancia singleton
export const logger = Logger.getInstance();

// Exportar función helper para usar en componentes
export const useLogger = (screenName: string) => {
  logger.setScreen(screenName);
  
  return {
    debug: (msg: string, data?: any) => logger.debug(msg, data),
    info: (msg: string, data?: any) => logger.info(msg, data),
    warn: (msg: string, data?: any) => logger.warn(msg, data),
    error: (msg: string, error?: any) => logger.error(msg, error),
  };
};

// Exportar para usar directamente
export default logger;
