# Guía de Migración al Nuevo Sistema de Logging

## 🎯 Objetivo
Unificar el sistema de logs para que funcione igual en desarrollo y en la APK de producción.

## 📁 Archivos Creados

1. **`src/utils/logger.ts`** - Logger principal
2. **`src/hooks/useLogger.ts`** - Hook para React
3. **`src/utils/index.ts`** - Exportaciones
4. **`src/screens/profile/DevLogsScreen.tsx`** - Pantalla para ver logs
5. **`src/navigation/types.ts`** - Actualizado con tipo DevLogs

## 🔧 Archivos Modificados

### Backend
- `backend/src/routes/logs.ts` - Endpoint para recibir logs
- `backend/src/routes/index.ts` - Registro de ruta

### Mobile (Ejemplos actualizados)
- `src/screens/pets/AddPetScreen.tsx` - ✅ Migrado
- `src/screens/location/PetTrackingScreen.tsx` - ✅ Migrado
- `src/store/authStore.ts` - ✅ Migrado
- `src/context/AuthContext.tsx` - ✅ Migrado
- `src/screens/profile/SettingsScreen.tsx` - ✅ Agregado acceso a DevLogs
- `src/navigation/RootNavigator.tsx` - ✅ Agregada pantalla DevLogs

## 🚀 Cómo Usar el Logger

### Opción 1: Hook useLogger (Recomendado para componentes)

```tsx
import { useLogger } from '../hooks/useLogger';

export const MiComponente = () => {
  const { debug, info, warn, error } = useLogger({ screenName: 'MiComponente' });

  useEffect(() => {
    info('Componente montado');
  }, []);

  const handleClick = () => {
    debug('Botón clickeado', { userId: '123' });
    
    try {
      // ... operación
      info('Operación exitosa');
    } catch (err) {
      error('Error en operación', err);
    }
  };
};
```

### Opción 2: Logger directo (Para stores/utilidades)

```tsx
import { logger } from '../utils/logger';

// En cualquier lugar:
logger.debug('Mensaje debug', { data: 'value' });
logger.info('Mensaje info');
logger.warn('Advertencia');
logger.error('Error', error);
```

## 📱 Comportamiento

### En Desarrollo (`__DEV__ = true`)
- ✅ Logs visibles en consola de Metro
- ✅ Logs almacenados en AsyncStorage
- ✅ Pantalla DevLogs accesible desde Settings
- ❌ No se envían al servidor

### En Producción (APK)
- ❌ Sin logs en consola (mejor rendimiento)
- ✅ Logs almacenados en AsyncStorage
- ✅ Logs enviados al servidor en lotes
- ✅ Errores enviados inmediatamente
- ✅ Pantalla DevLogs disponible (si se habilita)

## 🎨 Pantalla de Logs (DevLogsScreen)

Accede desde: **Settings → Ver Logs de Desarrollo** (solo en modo dev)

Características:
- 📊 Estadísticas de logs (total, errores, warnings, etc.)
- 🔍 Filtros por nivel (ALL, ERROR, WARN, INFO, DEBUG)
- 📤 Botón para enviar logs al servidor
- 📋 Exportar logs (compartir)
- 🗑️ Limpiar logs almacenados
- 🔽 Expandir/contraer detalles

## 🔌 Endpoint del Backend

```
POST /api/logs/mobile
Authorization: Bearer <token>
Body: { logs: LogEntry[] }
```

## 📝 Migrar Console.log Restantes

Buscar archivos con console.log:
```bash
cd mobile
grep -r "console\." src/ --include="*.ts" --include="*.tsx"
```

### Patrones de reemplazo:

```tsx
// ANTES ❌
console.log('[DEBUG] Mensaje', data);
console.error('Error:', error);

// DESPUÉS ✅
const { debug, error } = useLogger({ screenName: 'MiScreen' });
debug('Mensaje', data);
error('Error', error);
```

## 🧪 Probar en Desarrollo

1. Usa la app normalmente
2. Ve a **Settings → Ver Logs de Desarrollo**
3. Verifica que los logs aparecen
4. Prueba los filtros y acciones

## 🚀 Probar en APK

1. Construye la APK:
```bash
cd mobile
eas build -p android --profile preview
```

2. Instala en dispositivo físico

3. Usa la app

4. Para ver logs:
   - Opción A: Conecta con `adb logcat` (solo errores nativos)
   - Opción B: Agrega un botón oculto para abrir DevLogs
   - Opción C: Revisa los logs en el servidor

## 💡 Tips

1. **No uses console.log directamente** - Siempre usa el logger
2. **Sé específico en los mensajes** - Incluye contexto
3. **No logues datos sensibles** - El logger sanitiza automáticamente
4. **Errores críticos** - Usa `error()` para enviarlos inmediatamente
5. **Debug detallado** - Usa `debug()` para información temporal

## 🔒 Seguridad

El logger automáticamente oculta campos sensibles:
- password
- token
- authorization
- apiKey
- secret

## 📚 Ejemplos Completos

### Ejemplo 1: Formulario
```tsx
export const FormScreen = () => {
  const { debug, info, error } = useLogger({ screenName: 'FormScreen' });

  const handleSubmit = async (values) => {
    debug('Enviando formulario', { formData: values });
    
    try {
      await api.submit(values);
      info('Formulario enviado exitosamente');
    } catch (err) {
      error('Error al enviar formulario', { error: err, values });
    }
  };
};
```

### Ejemplo 2: Fetch de datos
```tsx
export const DataScreen = () => {
  const { debug, info, error } = useLogger({ screenName: 'DataScreen' });

  useEffect(() => {
    const fetchData = async () => {
      debug('Iniciando fetch de datos');
      
      try {
        const data = await api.getData();
        info('Datos cargados', { count: data.length });
      } catch (err) {
        error('Error cargando datos', err);
      }
    };

    fetchData();
  }, []);
};
```

### Ejemplo 3: Store (Zustand)
```tsx
import { logger } from '../utils/logger';

export const useStore = create((set) => ({
  action: async () => {
    try {
      // ...
      logger.info('Acción completada');
    } catch (error) {
      logger.error('Error en acción', error);
    }
  }
}));
```

## ✅ Checklist de Migración

- [ ] Reemplazar todos los `console.log` en screens
- [ ] Reemplazar todos los `console.error` en screens
- [ ] Reemplazar todos los `console.warn` en screens
- [ ] Actualizar stores (Zustand)
- [ ] Actualizar hooks personalizados
- [ ] Actualizar contextos
- [ ] Probar en desarrollo
- [ ] Probar en APK
- [ ] Verificar que los logs llegan al servidor (prod)

## 🆘 Solución de Problemas

### Los logs no aparecen en DevLogsScreen
1. Verifica que `AsyncStorage` funciona
2. Reinicia la app
3. Revisa que el logger está importado correctamente

### Los logs no se envían al servidor
1. Verifica que `__DEV__` es false
2. Revisa la conexión a internet
3. Verifica que el endpoint `/api/logs/mobile` existe
4. Revisa los logs del backend

### La APK muestra logs en consola
- Asegúrate de que `LOG_CONFIG.ENABLE_CONSOLE` sea `false` en prod
- El logger ya maneja esto automáticamente con `__DEV__`
