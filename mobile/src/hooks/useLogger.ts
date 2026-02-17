import { useEffect, useCallback } from 'react';
import { logger, LogLevel } from '../utils/logger';

interface UseLoggerOptions {
  screenName: string;
  logMount?: boolean;
  userId?: string;
}

/**
 * Hook para usar el logger en componentes React
 * Automáticamente establece el contexto de pantalla
 * 
 * @example
 * const { debug, info, error } = useLogger({ screenName: 'LoginScreen' });
 * 
 * useEffect(() => {
 *   info('Componente montado');
 * }, []);
 * 
 * const handleLogin = () => {
 *   debug('Intentando login', { email });
 *   try {
 *     // ... login
 *     info('Login exitoso');
 *   } catch (err) {
 *     error('Error en login', err);
 *   }
 * };
 */
export const useLogger = (options: UseLoggerOptions) => {
  const { screenName, logMount = true, userId } = options;

  // Establecer screen y userId al montar
  useEffect(() => {
    logger.setScreen(screenName);
    
    if (userId) {
      logger.setUserId(userId);
    }

    if (logMount) {
      logger.debug(`${screenName} montado`);
    }

    return () => {
      logger.debug(`${screenName} desmontado`);
    };
  }, [screenName, userId, logMount]);

  const debug = useCallback((message: string, data?: any) => {
    logger.setScreen(screenName);
    logger.debug(message, data);
  }, [screenName]);

  const info = useCallback((message: string, data?: any) => {
    logger.setScreen(screenName);
    logger.info(message, data);
  }, [screenName]);

  const warn = useCallback((message: string, data?: any) => {
    logger.setScreen(screenName);
    logger.warn(message, data);
  }, [screenName]);

  const error = useCallback((message: string, err?: any) => {
    logger.setScreen(screenName);
    logger.error(message, err);
  }, [screenName]);

  return {
    debug,
    info,
    warn,
    error,
  };
};

export { LogLevel };
export default useLogger;
