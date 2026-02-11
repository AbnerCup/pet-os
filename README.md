# 🐾 Pet-OS

Sistema operativo completo para el cuidado y monitoreo de mascotas.

## 📋 Descripción

Pet-OS es una plataforma integral que conecta dueños de mascotas con sus compañeros a través de:
- 🌐 **Aplicación Web** (Next.js)
- 📱 **Aplicación Móvil** (React Native + Expo)
- ⚙️ **Backend API** (Node.js + Express + PostgreSQL)

## 🏗️ Arquitectura

```
pet-os/
├── backend/          # API REST con Node.js + Express + TypeScript + Prisma
├── frontend/         # Aplicación web con Next.js 14 + React + TypeScript
├── mobile/           # App móvil con React Native + Expo
├── scripts/          # Scripts de utilidad
└── docs/             # Documentación adicional
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### 1. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL

# Ejecutar migraciones
npm run db:migrate

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:3001`

### 2. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### 3. Configurar Mobile

```bash
cd mobile

# Instalar dependencias
npm install

# Iniciar Expo
npm start
```

Escanea el código QR con Expo Go (Android/iOS)

## 🔧 Verificar Integración

Ejecuta el script de verificación para comprobar que todo está correctamente configurado:

```bash
node scripts/verify-integration.js
```

Este script verifica:
- ✅ Estructura de carpetas
- ✅ Archivos de configuración
- ✅ Consistencia de puertos
- ✅ Dependencias instaladas
- ✅ Conectividad de servicios

## 📚 Documentación

- **[INTEGRATION_ANALYSIS.md](./INTEGRATION_ANALYSIS.md)** - Análisis completo de la integración entre aplicaciones
- **[backend/docs/](./backend/docs/)** - Documentación del backend
- **[frontend/README.md](./frontend/README.md)** - Documentación del frontend
- **[mobile/README.md](./mobile/README.md)** - Documentación de la app móvil

## 🛠️ Tecnologías

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Base de datos:** PostgreSQL + Prisma ORM
- **Autenticación:** JWT (jsonwebtoken)
- **Seguridad:** Helmet, CORS, Rate Limiting
- **Validación:** Zod
- **Logging:** Winston + Morgan

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18 + TypeScript
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Data Fetching:** SWR
- **Animaciones:** Framer Motion
- **Gráficos:** Recharts

### Mobile
- **Framework:** React Native + Expo 54
- **Navegación:** React Navigation 7
- **Estado:** Zustand + TanStack Query
- **HTTP:** Axios
- **UI:** React Native Paper
- **Mapas:** React Native Maps
- **Almacenamiento:** Expo Secure Store

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Rate limiting en endpoints críticos
- ✅ Headers de seguridad con Helmet
- ✅ CORS configurado
- ✅ Validación de entrada con Zod
- ✅ Almacenamiento seguro de tokens

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil del usuario

### Mascotas
- `GET /api/pets` - Listar mascotas
- `POST /api/pets` - Crear mascota
- `GET /api/pets/:id` - Obtener mascota
- `PUT /api/pets/:id` - Actualizar mascota
- `DELETE /api/pets/:id` - Eliminar mascota

### Salud
- `GET /api/health` - Registros de salud
- `POST /api/health` - Crear registro de salud

### Gastos
- `GET /api/expenses` - Listar gastos
- `POST /api/expenses` - Crear gasto

### Ubicación
- `GET /api/location` - Obtener ubicación
- `POST /api/location` - Actualizar ubicación

Ver documentación completa en [backend/docs/API.md](./backend/docs/API.md)

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Mobile
cd mobile
npm test
```

## 📦 Build para Producción

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Mobile
```bash
cd mobile
# Android
npm run android

# iOS
npm run ios
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- **Abner** - Desarrollo inicial

## 🙏 Agradecimientos

- A todos los que contribuyen al proyecto
- A la comunidad de React, Next.js y React Native

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0.0