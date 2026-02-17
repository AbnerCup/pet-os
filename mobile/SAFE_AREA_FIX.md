# Fix: Barra de Tabs y Botones del Sistema

## Problema
Los iconos del footer (barra de tabs) chocaban con los botones nativos del celular (3 líneas, círculo, triángulo).

## Causa
La barra de navegación inferior no estaba considerando el área segura (SafeArea) del dispositivo, especialmente en Android donde los botones de navegación del sistema ocupan espacio en la parte inferior.

## Soluciones Aplicadas

### 1. MainTabNavigator.tsx
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

// En las opciones de la barra de tabs:
tabBarStyle: {
  // Altura dinámica basada en los insets del dispositivo
  height: Platform.OS === 'ios' ? 80 : 60 + Math.max(insets.bottom, 8),
  paddingBottom: Platform.OS === 'ios' ? 25 : Math.max(insets.bottom, 8),
  // ...
}
```

### 2. App.tsx
El `SafeAreaProvider` ya está configurado en el nivel superior:
```typescript
<SafeAreaProvider>
  <QueryClientProvider client={queryClient}>
    <PaperProvider>
      <AppContent />
    </PaperProvider>
  </QueryClientProvider>
</SafeAreaProvider>
```

### 3. Componente SafeAreaWrapper (opcional)
Para pantallas que necesiten asegurar que el contenido no quede detrás de la barra de tabs.

## Requisitos
El paquete `react-native-safe-area-context` debe estar instalado:
```bash
npm install react-native-safe-area-context
```

## Configuración por Plataforma

### Android
- Usa `Math.max(insets.bottom, 8)` para asegurar un mínimo de padding
- La barra de tabs tiene altura dinámica basada en los insets

### iOS
- Altura fija de 80px con paddingBottom de 25px
- Los insets se manejan automáticamente por el sistema

## Para Probar

1. Ejecutar la app:
```bash
cd mobile
npm start
```

2. Verificar en diferentes dispositivos Android:
   - Con navegación por gestos (gesture navigation)
   - Con botones de navegación de 3 botones (3-button navigation)

3. Si el problema persiste, ajustar el valor de `bottomPadding` en las pantallas individuales.

## Ajustes Manuales (si es necesario)

Si en algún dispositivo específico sigue habiendo problema, puedes ajustar manualmente:

```typescript
// En MainTabNavigator.tsx
const BOTTOM_PADDING = Platform.OS === 'android' ? 16 : 0; // Ajustar este valor

tabBarStyle: {
  height: 60 + insets.bottom + BOTTOM_PADDING,
  paddingBottom: insets.bottom + BOTTOM_PADDING + 8,
}
```

## Pantallas Actualizadas
- MainTabNavigator - Barra de tabs principal
- SafeAreaWrapper - Componente auxiliar para contenido

## Estado
✅ Solución aplicada y lista para probar
