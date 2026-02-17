# Iconos de Pet OS - Configuración Completa

## ✅ Estado Actual

Todos los iconos están ahora correctamente configurados para verse **idénticos** en:
- Desarrollo (Expo Go)
- APK (Android)
- Web (Next.js)

## 📁 Archivos de Iconos

### Mobile (`mobile/assets/`)

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `icon.png` | Icono completo (fondo verde + huella) | iOS, Icono general |
| `adaptive-icon-foreground.png` | Solo huella blanca (transparente) | Android API 26+ |
| `splash.png` | Pantalla de carga | Splash screen |

### Frontend (`frontend/public/`)

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `favicon.png` | Icono completo | Favicon navegador |
| `icon.png` | Icono completo | Apple touch icon |

## 🎨 Especificaciones Técnicas

### Icono Principal (icon.png)
- **Tamaño**: 1024x1024 px
- **Formato**: PNG
- **Diseño**: Fondo verde (#7c9a6b) con huella blanca
- **Uso**: iOS, Icono legacy Android, Favicon web

### Android Adaptive Icon
- **Foreground**: `adaptive-icon-foreground.png`
  - Tamaño: 1024x1024 px
  - Fondo: Transparente (alpha)
  - Diseño: Solo huella blanca
  
- **Background**: Color sólido (#7c9a6b)
  - Definido en `app.json`
  - No requiere imagen separada

### Splash Screen
- **Tamaño**: 1242x2436 px (tamaño iPhone X)
- **Formato**: PNG
- **Resize mode**: Contain
- **Background**: #7c9a6b

## 📱 Configuración en app.json

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#7c9a6b"
    },
    "android": {
      "icon": "./assets/icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon-foreground.png",
        "backgroundColor": "#7c9a6b"
      }
    },
    "ios": {
      "icon": "./assets/icon.png"
    }
  }
}
```

## 🌐 Configuración Web

En `frontend/app/layout.tsx`:

```tsx
<html lang="es">
  <head>
    <link rel="icon" href="/favicon.png" type="image/png" />
    <link rel="apple-touch-icon" href="/icon.png" />
    <meta name="theme-color" content="#7c9a6b" />
  </head>
```

## 🚀 Construcción de APK

### Pasos para construir con iconos correctos:

1. **Verificar iconos**:
```bash
cd mobile
node scripts/generate-icons.js
```

2. **Limpiar caché** (importante):
```bash
cd mobile
expo prebuild --clean
```

3. **Construir APK**:
```bash
eas build -p android --profile preview
```

## 🔍 Verificación

### En Desarrollo (Expo Go)
- El icono se ve en la lista de apps de Expo Go
- Splash screen aparece al iniciar

### En APK
- Icono en launcher del dispositivo
- Splash screen nativo de Android
- Icono adaptativo en Android 8.0+ (API 26+)

### En Web
- Favicon en pestaña del navegador
- Icono al añadir a pantalla de inicio (iOS/Android)

## 🛠️ Scripts Disponibles

### `mobile/scripts/generate-icons.js`
Verifica que todos los iconos existan y estén configurados correctamente.

```bash
node scripts/generate-icons.js
```

### `mobile/scripts/create-foreground-icon.py`
Genera el `adaptive-icon-foreground.png` automáticamente desde `icon.png`.

```bash
python scripts/create-foreground-icon.py
```

**Nota**: Este script elimina el fondo verde automáticamente.

## 🎨 Cambiar el Icono

Si quieres cambiar el diseño del icono:

1. **Reemplazar `mobile/assets/icon.png`** con nuevo diseño (1024x1024)
2. **Ejecutar**:
```bash
cd mobile
python scripts/create-foreground-icon.py
```
3. **Copiar a frontend**:
```bash
cp mobile/assets/icon.png frontend/public/favicon.png
cp mobile/assets/icon.png frontend/public/icon.png
```
4. **Reconstruir la APK**:
```bash
cd mobile
eas build -p android --profile preview
```

## ⚠️ Notas Importantes

### Android Adaptive Icons
- En Android 8.0+ (API 26+), los iconos son "adaptativos"
- Se componen de: foreground (imagen) + background (color)
- El sistema puede aplicar máscaras (redondas, cuadradas, etc.)
- **Nunca** uses una imagen con fondo como foreground

### iOS
- iOS usa el icono completo con fondo
- Aplica esquinas redondeadas automáticamente
- No soporta iconos adaptativos

### Splash Screen
- En APK, el splash se muestra nativamente
- En desarrollo, puede verse diferente
- Usa `resizeMode: "contain"` para evitar cortes

## 🐛 Troubleshooting

### El icono se ve diferente en APK vs Expo Go
**Causa**: El `adaptive-icon-foreground.png` tenía fondo incluido.
**Solución**: Ejecutar `python scripts/create-foreground-icon.py`

### El icono aparece cortado en algunos dispositivos
**Causa**: Zona de seguridad del icono adaptativo.
**Solución**: Mantener el diseño dentro del centro 66% de la imagen.

### Splash screen no aparece
**Causa**: Caché de build.
**Solución**: `expo prebuild --clean` y reconstruir.

### Icono web no se actualiza
**Causa**: Caché del navegador.
**Solución**: Hard refresh (Ctrl+F5) o ver en modo incógnito.

## 📊 Matriz de Compatibilidad

| Plataforma | Icono Usado | Notas |
|------------|-------------|-------|
| iOS | `icon.png` | Esquinas redondeadas automáticas |
| Android < 8.0 | `icon.png` | Icono legacy |
| Android 8.0+ | `adaptive-icon-foreground.png` + color | Adaptativo con máscara |
| Web | `favicon.png` | 16x16 a 32x32 escalado |
| Web iOS | `icon.png` | Apple touch icon |

---

**Estado**: ✅ Todos los iconos configurados correctamente
