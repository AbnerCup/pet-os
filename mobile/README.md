# Pet OS Mobile

Aplicación móvil de Pet OS desarrollada con React Native y Expo.

## 📱 Características

- **Autenticación JWT**: Login persistente con AsyncStorage
- **Dashboard**: Estadísticas y resumen de mascotas
- **Gestión de Mascotas**: CRUD completo con fotos
- **Mapa en Tiempo Real**: Ubicación GPS y zonas seguras
- **Centro de Salud**: Registro de vacunas, citas y medicación
- **Diseño Moderno**: Tema "Organic Medical" con colores verde salvia

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Backend corriendo en `localhost:3001`

### Pasos

1. **Clonar y entrar al directorio**
```bash
cd pet-os-mobile
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar IP del backend**
Edita `src/api/config.ts` y cambia la IP según tu red:
```typescript
// Para Android Emulator
const API_URL = 'http://10.0.2.2:3001/api';

// Para iOS Simulator
const API_URL = 'http://localhost:3001/api';

// Para dispositivo físico (usa tu IP local)
const API_URL = 'http://192.168.1.100:3001/api';
```

4. **Iniciar la app**
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📁 Estructura del Proyecto

```
pet-os-mobile/
├── App.tsx                 # Punto de entrada
├── src/
│   ├── api/               # Configuración de Axios
│   ├── components/        # Componentes reutilizables
│   ├── screens/           # Pantallas de la app
│   │   ├── auth/         # Login, Register
│   │   ├── dashboard/    # Home
│   │   ├── pets/         # Lista y detalle
│   │   ├── location/     # Mapa GPS
│   │   ├── health/       # Centro de salud
│   │   └── profile/      # Perfil usuario
│   ├── navigation/        # React Navigation
│   ├── hooks/            # Custom hooks
│   ├── store/            # Zustand store
│   ├── types/            # TypeScript types
│   └── utils/            # Helpers
└── assets/               # Imágenes y fuentes
```

## 🔧 Configuración Backend

Asegúrate de que tu backend Express tenga estos endpoints:

```
POST   /api/auth/login
GET    /api/auth/me
GET    /api/pets
GET    /api/pets/:id
POST   /api/pets
PUT    /api/pets/:id
DELETE /api/pets/:id
GET    /api/pets/:id/health
```

## 🎨 Tema de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Primary | `#7c9a6b` | Botones, headers, acentos |
| Secondary | `#4a90e2` | Links, información |
| Danger | `#e74c3c` | Alertas, botón SOS |
| Background | `#f5f5f5` | Fondos de pantalla |

## 📱 Funcionalidades por Fase

### Fase 1 (Actual)
- ✅ Login con JWT
- ✅ Lista de mascotas
- ✅ Detalle de mascota
- ✅ Mapa con ubicación
- ✅ Perfil de usuario

### Fase 2 (Próxima)
- 🔄 Registro de usuarios
- 🔄 Agregar/editar mascotas
- 🔄 Centro de salud completo
- 🔄 Notificaciones push
- 🔄 Sincronización offline

### Fase 3 (Futuro)
- 📋 Escáner de códigos de barras
- 📸 Cámara para mascotas
- 🔔 Geofencing avanzado
- 📊 Estadísticas de gastos
- 🌐 Soporte multiidioma

## 🐛 Solución de Problemas

### Error de conexión al backend
1. Verifica que el backend esté corriendo
2. Confirma la IP en `src/api/config.ts`
3. Para Android físico, usa la IP de tu computadora
4. Asegúrate de que el puerto 3001 esté abierto

### Mapa no se muestra
1. Registra tu API key de Google Maps en `app.json`
2. Para iOS, configura el pod de GoogleMaps
3. Para desarrollo, el mapa funciona sin API key

### Error con dependencias nativas
```bash
cd android && ./gradlew clean
cd ..
npx expo prebuild --clean
```

## 📄 Licencia

MIT License - Pet OS Team
