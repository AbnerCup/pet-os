# Iconos Unificados - Pet OS ✅

## 🎯 Objetivo Logrado
El icono de **huella de Lucide** (SVG) ahora es el mismo en:
- ✅ Web (Next.js)
- ✅ Mobile (React Native / Expo Go)
- ✅ APK (Android)
- ✅ iOS

## 🎨 Diseño Base (SVG)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="11" cy="4" r="2"/>
  <circle cx="18" cy="8" r="2"/>
  <circle cx="20" cy="16" r="2"/>
  <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>
</svg>
```

**Colores:**
- Fondo: `#7c9a6b` (Verde salvia)
- Huella: `#ffffff` (Blanco)

## 📁 Archivos Generados

### Mobile (`mobile/assets/`)
| Archivo | Uso | Especificaciones |
|---------|-----|------------------|
| `icon.png` | iOS, Web, Legacy Android | 1024x1024, con fondo verde |
| `adaptive-icon-foreground.png` | Android 8.0+ | 1024x1024, **sin fondo** (transparente) |
| `adaptive-icon.png` | Legacy | 1024x1024, con fondo verde |
| `splash.png` | Splash screen | 1242x2436, con fondo verde |

### Frontend (`frontend/public/`)
| Archivo | Uso |
|---------|-----|
| `favicon.png` | Favicon del navegador |
| `icon.png` | Apple touch icon |

### Componentes
| Archivo | Uso |
|---------|-----|
| `frontend/components/Logo.tsx` | Componente reutilizable con SVG |

## 🚀 Cómo se Generaron

Script Python que convierte el SVG a PNG:
```bash
cd mobile
python scripts/generate-paw-icon.py
```

El script:
1. Dibuja 4 círculos (dedos) en posiciones específicas
2. Dibuja 1 óvalo grande (palma)
3. Crea versión con fondo (icon.png)
4. Crea versión sin fondo (adaptive-icon-foreground.png)
5. Crea splash screen

## 📱 Implementación por Plataforma

### Web (Next.js)
```tsx
// Componente Logo
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="11" cy="4" r="2" />
  <circle cx="18" cy="8" r="2" />
  <circle cx="20" cy="16" r="2" />
  <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
</svg>
```

Ubicaciones:
- `frontend/components/Logo.tsx` - Componente reutilizable
- `frontend/components/layout/Sidebar.tsx` - Sidebar
- `frontend/app/auth/login/page.tsx` - Login

### Mobile (React Native)
Los iconos PNG se usan en:
- **Expo Go**: `icon.png`
- **APK Android**: `adaptive-icon-foreground.png` + color de fondo
- **iOS**: `icon.png`

Configuración en `app.json`:
```json
{
  "icon": "./assets/icon.png",
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon-foreground.png",
      "backgroundColor": "#7c9a6b"
    }
  }
}
```

## 🔧 Para Reconstruir los Iconos

Si necesitas regenerar los iconos:

```bash
# 1. Ejecutar script generador
cd mobile
python scripts/generate-paw-icon.py

# 2. Copiar a frontend
Copy-Item assets/icon.png ../frontend/public/favicon.png
Copy-Item assets/icon.png ../frontend/public/icon.png

# 3. Limpiar caché de Expo
expo prebuild --clean

# 4. Construir APK
eas build -p android --profile preview
```

## 📊 Comparación Visual

| Plataforma | Tipo | Apariencia |
|------------|------|------------|
| Web | SVG | Huella blanca sobre fondo verde |
| iOS | PNG | Huella blanca sobre fondo verde |
| Android < 8.0 | PNG | Huella blanca sobre fondo verde |
| Android 8.0+ | Adaptive | Huella blanca (foreground) + verde (background) |

## ✅ Verificación

Para verificar que todo está correcto:

```bash
cd mobile
node scripts/generate-icons.js
```

Salida esperada:
```
✅ icon.png
✅ adaptive-icon.png
✅ splash.png
✅ adaptive-icon-foreground.png
```

## 🎨 Características del Diseño

- **4 dedos**: Representados por círculos
- **1 palma**: Representada por óvalo grande
- **Estilo**: Minimalista y limpio
- **Consistencia**: Mismo diseño en todas las plataformas
- **Colores**: Verde salvia (#7c9a6b) + Blanco

## 📚 Documentación Relacionada

- `mobile/ICON_SETUP.md` - Guía completa de iconos
- `mobile/scripts/generate-paw-icon.py` - Generador de iconos
- `mobile/scripts/generate-icons.js` - Verificador

---

**Estado**: ✅ COMPLETADO - Icono unificado en todas las plataformas
