# 📊 Análisis de Integración Pet-OS
## Backend ↔️ Frontend ↔️ Mobile

**Fecha:** 10 de Febrero, 2026  
**Estado:** ✅ Base Armónica Establecida

---

## 🎯 Resumen Ejecutivo

La arquitectura de Pet-OS está **correctamente estructurada** con una base armónica entre las tres aplicaciones:
- ✅ **Backend** (Node.js + Express + TypeScript + Prisma)
- ✅ **Frontend** (Next.js 14 + React + TypeScript)
- ✅ **Mobile** (React Native + Expo + TypeScript)

---

## 🔧 Configuración de Puertos y URLs

### Backend
```env
PORT=3002 (⚠️ INCONSISTENCIA - ver nota abajo)
DATABASE_URL=postgresql://postgres:123qwe@localhost:5432/pet_os
JWT_SECRET=tu-secreto-super-seguro-cambia-en-produccion
FRONTEND_URL=http://localhost:3000
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Mobile
```typescript
// Configuración dinámica según plataforma
Android Emulator: http://10.0.2.2:3001/api
iOS Simulator: http://localhost:3001/api
Producción: https://tu-api-produccion.com/api
```

### ⚠️ INCONSISTENCIA DETECTADA

**Problema:** El backend está configurado para correr en el puerto `3002` (`.env`), pero el frontend y mobile esperan que esté en el puerto `3001`.

**Soluciones:**
1. **Opción A (Recomendada):** Cambiar `PORT=3002` a `PORT=3001` en `backend/.env`
2. **Opción B:** Actualizar `NEXT_PUBLIC_API_URL` en frontend y `getBaseURL()` en mobile para usar puerto `3002`

---

## 🏗️ Arquitectura de Comunicación

### Flujo de Autenticación

```mermaid
sequenceDiagram
    participant F as Frontend/Mobile
    participant B as Backend
    participant DB as PostgreSQL
    
    F->>B: POST /api/auth/login
    B->>DB: Verificar credenciales
    DB-->>B: Usuario válido
    B-->>F: JWT Token
    F->>F: Guardar token (localStorage/SecureStore)
    F->>B: GET /api/pets (+ Bearer Token)
    B->>B: Verificar JWT
    B->>DB: Consultar mascotas
    DB-->>B: Datos
    B-->>F: Respuesta JSON
```

---

## 📡 Endpoints del Backend

### Rutas Principales
```
/api/health-check          [GET]    - Health check público
/api/auth/register         [POST]   - Registro de usuarios
/api/auth/login            [POST]   - Login
/api/auth/me               [GET]    - Perfil del usuario (autenticado)
/api/pets                  [GET]    - Listar mascotas (autenticado)
/api/pets                  [POST]   - Crear mascota (autenticado)
/api/pets/:id              [GET]    - Obtener mascota (autenticado)
/api/pets/:id              [PUT]    - Actualizar mascota (autenticado)
/api/pets/:id              [DELETE] - Eliminar mascota (autenticado)
/api/health                [...]    - Rutas de salud
/api/expenses              [...]    - Rutas de gastos
/api/activities            [...]    - Rutas de actividades
/api/location              [...]    - Rutas de ubicación
```

---

## 🎨 Frontend (Next.js)

### Estructura
```
frontend/
├── app/                    # App Router (Next.js 14)
├── components/             # Componentes reutilizables
├── hooks/                  # Custom hooks
├── lib/
│   └── api.ts             # Cliente API con autenticación
├── types/                  # TypeScript types
└── .env.local             # Variables de entorno
```

### Cliente API (`lib/api.ts`)
```typescript
// ✅ Implementa:
- Autenticación automática con JWT
- Headers correctos (Content-Type, Authorization)
- Manejo de errores
- Función fetcher para SWR
- Función post para peticiones POST
```

### Tecnologías
- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + Lucide Icons
- **Data Fetching:** SWR (stale-while-revalidate)
- **Animaciones:** Framer Motion
- **Gráficos:** Recharts
- **Autenticación:** JWT en localStorage

---

## 📱 Mobile (React Native + Expo)

### Estructura
```
mobile/
├── src/
│   ├── api/
│   │   ├── config.ts       # Configuración Axios + Interceptors
│   │   └── endpoints.ts    # Definición de endpoints tipados
│   ├── context/            # Context API
│   ├── hooks/              # Custom hooks
│   ├── navigation/         # React Navigation
│   ├── screens/            # Pantallas
│   ├── store/              # Zustand store
│   └── types/              # TypeScript types
├── assets/                 # Imágenes, fuentes
└── App.tsx                 # Entry point
```

### Cliente API (`api/config.ts`)
```typescript
// ✅ Implementa:
- Axios con configuración base
- Interceptor de request (agrega JWT automáticamente)
- Interceptor de response (maneja 401 y logout)
- Detección automática de plataforma (Android/iOS)
- Timeout de 10 segundos
- Almacenamiento seguro con expo-secure-store
```

### Endpoints Tipados (`api/endpoints.ts`)
```typescript
// ✅ Módulos disponibles:
- authApi: login, register, me, refreshToken
- petsApi: getAll, getById, create, update, delete, healthRecords
- locationApi: getCurrent, getHistory, updateLocation, safeZones
- dashboardApi: getStats, getAlerts, markAlertAsRead
- userApi: getProfile, updateProfile, changePassword
```

### Tecnologías
- **Framework:** Expo 54 + React Native 0.76
- **Navegación:** React Navigation 7
- **Estado:** Zustand + React Query (TanStack Query)
- **HTTP:** Axios
- **UI:** React Native Paper + Vector Icons
- **Mapas:** React Native Maps
- **Autenticación:** JWT en expo-secure-store

---

## 🔐 Seguridad Implementada

### Backend
✅ **Helmet** - Headers de seguridad HTTP  
✅ **CORS** - Configuración de orígenes permitidos  
✅ **Rate Limiting** - Protección contra ataques de fuerza bruta  
✅ **JWT** - Autenticación basada en tokens  
✅ **Bcrypt** - Hash de contraseñas  
✅ **Zod** - Validación de datos de entrada  
✅ **Compression** - Compresión de respuestas  
✅ **Morgan + Winston** - Logging completo  

### Frontend
✅ **JWT en localStorage** - Almacenamiento de tokens  
✅ **Interceptor de autenticación** - Headers automáticos  
✅ **Manejo de errores** - Captura y display de errores  

### Mobile
✅ **expo-secure-store** - Almacenamiento encriptado de tokens  
✅ **Interceptores Axios** - Autenticación y manejo de 401  
✅ **Timeout** - Prevención de requests colgados  

---

## 📊 Estado de Integración

### ✅ Aspectos Armónicos

1. **Estructura de Endpoints**
   - Backend expone rutas RESTful claras
   - Frontend y Mobile tienen clientes API bien estructurados
   - Tipado TypeScript en las tres aplicaciones

2. **Autenticación**
   - Flujo JWT consistente
   - Almacenamiento seguro de tokens
   - Interceptores automáticos en ambos clientes

3. **Manejo de Errores**
   - Backend responde con formato JSON consistente
   - Clientes manejan errores apropiadamente
   - Logout automático en caso de 401

4. **Tipado TypeScript**
   - Tipos compartidos entre aplicaciones
   - Endpoints tipados en mobile
   - Validación con Zod en backend

5. **Seguridad**
   - Múltiples capas de seguridad en backend
   - Almacenamiento seguro en clientes
   - Rate limiting y CORS configurados

### ⚠️ Puntos de Atención

1. **Inconsistencia de Puerto** (CRÍTICO)
   - Backend: `PORT=3002`
   - Frontend/Mobile: esperan `3001`
   - **Acción:** Unificar en puerto `3001`

2. **URL de Producción** (Mobile)
   - Placeholder: `https://tu-api-produccion.com/api`
   - **Acción:** Actualizar cuando tengas dominio

3. **JWT Secret** (Backend)
   - Valor placeholder en `.env`
   - **Acción:** Cambiar en producción

4. **Sincronización de Tipos**
   - Los tipos están definidos en cada proyecto
   - **Recomendación:** Considerar un paquete compartido de tipos

5. **Refresh Token**
   - Mobile tiene endpoint de refresh
   - **Verificar:** Implementación en backend

---

## 🚀 Próximos Pasos Recomendados

### 1. Corrección Inmediata
```bash
# En backend/.env
PORT=3001  # Cambiar de 3002 a 3001
```

### 2. Verificar Conectividad
```bash
# Terminal 1: Iniciar backend
cd backend
npm run dev

# Terminal 2: Iniciar frontend
cd frontend
npm run dev

# Terminal 3: Iniciar mobile
cd mobile
npm start
```

### 3. Pruebas de Integración
- [ ] Registro de usuario desde frontend
- [ ] Login desde frontend
- [ ] Crear mascota desde frontend
- [ ] Registro de usuario desde mobile
- [ ] Login desde mobile
- [ ] Crear mascota desde mobile
- [ ] Verificar que el token se guarda correctamente
- [ ] Verificar que las rutas protegidas funcionan

### 4. Mejoras Futuras
- [ ] Implementar refresh token en backend
- [ ] Crear paquete compartido de tipos TypeScript
- [ ] Agregar tests de integración
- [ ] Configurar CI/CD
- [ ] Documentar API con Swagger/OpenAPI
- [ ] Implementar WebSockets para notificaciones en tiempo real
- [ ] Agregar manejo de imágenes (upload de fotos de mascotas)

---

## 📝 Conclusión

**Estado General:** ✅ **ARMÓNICO CON CORRECCIÓN MENOR REQUERIDA**

La base de las tres aplicaciones está **bien estructurada y lista para desarrollo**. Solo necesitas:

1. **Corregir el puerto del backend** (3002 → 3001)
2. **Verificar que el backend esté corriendo**
3. **Probar el flujo completo de autenticación**

Una vez corregido el puerto, tendrás una arquitectura sólida y escalable para continuar desarrollando Pet-OS.

---

## 🛠️ Comandos Rápidos

```bash
# Backend
cd backend
npm run dev              # Desarrollo
npm run build            # Compilar
npm run start            # Producción
npm run db:migrate       # Migraciones
npm run db:studio        # Prisma Studio

# Frontend
cd frontend
npm run dev              # Desarrollo
npm run build            # Build producción
npm run start            # Servir build

# Mobile
cd mobile
npm start                # Expo dev server
npm run android          # Android
npm run ios              # iOS
npm run web              # Web
```

---

**Generado el:** 10 de Febrero, 2026  
**Versión:** 1.0  
**Autor:** Análisis de Integración Pet-OS
