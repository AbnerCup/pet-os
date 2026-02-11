# 🏗️ Arquitectura de Pet-OS

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                         │
├──────────────────────────────┬──────────────────────────────────────┤
│                              │                                      │
│   📱 MOBILE APP              │   🌐 WEB APP                         │
│   (React Native + Expo)      │   (Next.js 14)                       │
│                              │                                      │
│   • React Native 0.76        │   • React 18                         │
│   • Expo 54                  │   • App Router                       │
│   • React Navigation 7       │   • Server Components                │
│   • Zustand + React Query    │   • SWR                              │
│   • React Native Paper       │   • Tailwind CSS                     │
│   • Expo Secure Store        │   • Framer Motion                    │
│   • Axios                    │   • Recharts                         │
│                              │                                      │
│   Plataformas:               │   Plataformas:                       │
│   • Android                  │   • Desktop (Chrome, Firefox, etc)   │
│   • iOS                      │   • Mobile Web                       │
│                              │                                      │
└──────────────┬───────────────┴──────────────┬───────────────────────┘
               │                              │
               │ HTTP/REST                    │ HTTP/REST
               │ JSON                         │ JSON
               │ JWT Bearer Token             │ JWT Bearer Token
               │                              │
               └──────────────┬───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         CAPA DE APLICACIÓN                           │
│                                                                      │
│                    ⚙️ BACKEND API (Node.js)                         │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │  Express.js Server (TypeScript)                              │ │
│   │  Puerto: 3001                                                │ │
│   └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │  MIDDLEWARE LAYER                                            │ │
│   │  • Helmet (Security Headers)                                 │ │
│   │  • CORS (Cross-Origin Resource Sharing)                      │ │
│   │  • Rate Limiting (Protección DDoS)                           │ │
│   │  • Morgan + Winston (Logging)                                │ │
│   │  • Compression (Gzip)                                        │ │
│   │  • JWT Authentication                                        │ │
│   │  • Zod Validation                                            │ │
│   └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │  ROUTES                                                      │ │
│   │  /api/auth      → AuthController                             │ │
│   │  /api/pets      → PetsController                             │ │
│   │  /api/health    → HealthController                           │ │
│   │  /api/expenses  → ExpensesController                         │ │
│   │  /api/location  → LocationController                         │ │
│   └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │  CONTROLLERS                                                 │ │
│   │  • Business Logic                                            │ │
│   │  • Request/Response Handling                                 │ │
│   │  • Error Handling                                            │ │
│   └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │  PRISMA ORM                                                  │ │
│   │  • Type-safe Database Client                                 │ │
│   │  • Schema Management                                         │ │
│   │  • Migrations                                                │ │
│   └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               │ SQL Queries
                               │ Connection Pool
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         CAPA DE DATOS                                │
│                                                                      │
│                    🗄️ PostgreSQL Database                           │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │  TABLAS PRINCIPALES                                          │ │
│   │                                                              │ │
│   │  • users          (Usuarios del sistema)                     │ │
│   │  • pets           (Mascotas)                                 │ │
│   │  • health_records (Registros de salud)                       │ │
│   │  • expenses       (Gastos)                                   │ │
│   │  • activities     (Actividades)                              │ │
│   │  • locations      (Ubicaciones GPS)                          │ │
│   │  • safe_zones     (Zonas seguras)                            │ │
│   │  • alerts         (Alertas y notificaciones)                 │ │
│   │                                                              │ │
│   └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│   Puerto: 5432                                                       │
│   Base de datos: pet_os                                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Flujo de Autenticación

```
┌──────────┐                                    ┌──────────┐
│          │  1. POST /api/auth/login           │          │
│  Client  │───────────────────────────────────>│ Backend  │
│ (Web/App)│    { email, password }             │   API    │
│          │                                    │          │
└──────────┘                                    └────┬─────┘
     ▲                                               │
     │                                               │ 2. Verificar
     │                                               │    credenciales
     │                                               ▼
     │                                          ┌─────────┐
     │                                          │PostgreSQL│
     │                                          └────┬────┘
     │                                               │
     │  4. Guardar token                             │ 3. Usuario
     │     localStorage/SecureStore                  │    válido
     │                                               ▼
     │                                          ┌─────────┐
     │  5. { token, user }                     │  JWT    │
     │<─────────────────────────────────────────│Generator│
     │                                          └─────────┘
     │
     │
     │  6. GET /api/pets
     │     Authorization: Bearer <token>
     ├──────────────────────────────────────────>
     │                                          
     │  7. Verificar JWT
     │                                          
     │  8. { pets: [...] }
     │<──────────────────────────────────────────
     │
```

## Flujo de Datos - Crear Mascota

```
┌─────────┐                                      ┌─────────┐
│ Mobile  │                                      │   Web   │
│   App   │                                      │   App   │
└────┬────┘                                      └────┬────┘
     │                                                │
     │ POST /api/pets                                 │ POST /api/pets
     │ { name, species, breed, ... }                  │ { name, species, breed, ... }
     │ Authorization: Bearer <token>                  │ Authorization: Bearer <token>
     │                                                │
     └────────────────────┬───────────────────────────┘
                          │
                          ▼
                    ┌──────────┐
                    │ Backend  │
                    │   API    │
                    └────┬─────┘
                         │
                         │ 1. Verificar JWT
                         │
                         ▼
                    ┌──────────┐
                    │   Auth   │
                    │Middleware│
                    └────┬─────┘
                         │
                         │ 2. Validar datos (Zod)
                         │
                         ▼
                    ┌──────────┐
                    │Validation│
                    │Middleware│
                    └────┬─────┘
                         │
                         │ 3. Ejecutar lógica
                         │
                         ▼
                    ┌──────────┐
                    │  Pets    │
                    │Controller│
                    └────┬─────┘
                         │
                         │ 4. Crear registro
                         │    prisma.pet.create()
                         │
                         ▼
                    ┌──────────┐
                    │  Prisma  │
                    │   ORM    │
                    └────┬─────┘
                         │
                         │ 5. INSERT INTO pets
                         │
                         ▼
                    ┌──────────┐
                    │PostgreSQL│
                    └────┬─────┘
                         │
                         │ 6. Retornar pet creado
                         │
                         ▼
     ┌───────────────────┴───────────────────┐
     │                                       │
     ▼                                       ▼
┌─────────┐                             ┌─────────┐
│ Mobile  │ { id, name, species, ... }  │   Web   │
│   App   │                             │   App   │
└─────────┘                             └─────────┘
```

## Estructura de Archivos

```
pet-os/
│
├── backend/                          # API Backend
│   ├── src/
│   │   ├── app.ts                   # Configuración Express
│   │   ├── config/                  # Configuraciones
│   │   │   └── cors.ts
│   │   ├── controllers/             # Lógica de negocio
│   │   │   ├── authController.ts
│   │   │   ├── petsController.ts
│   │   │   ├── healthController.ts
│   │   │   ├── expensesController.ts
│   │   │   └── locationController.ts
│   │   ├── middleware/              # Middleware
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── logging.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validation.ts
│   │   ├── routes/                  # Definición de rutas
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── pets.ts
│   │   │   ├── health.ts
│   │   │   ├── expenses.ts
│   │   │   └── location.ts
│   │   ├── types/                   # TypeScript types
│   │   ├── utils/                   # Utilidades
│   │   │   └── logger.ts
│   │   └── validators/              # Schemas Zod
│   │       ├── auth.ts
│   │       ├── pets.ts
│   │       ├── health.ts
│   │       ├── expenses.ts
│   │       └── location.ts
│   ├── prisma/
│   │   ├── schema.prisma           # Esquema de base de datos
│   │   ├── migrations/             # Migraciones
│   │   └── seed.ts                 # Datos de prueba
│   ├── server.ts                   # Entry point
│   ├── .env                        # Variables de entorno
│   └── package.json
│
├── frontend/                        # Aplicación Web
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── pets/
│   │   └── ...
│   ├── components/                 # Componentes React
│   │   ├── ui/
│   │   ├── layout/
│   │   └── features/
│   ├── hooks/                      # Custom hooks
│   ├── lib/
│   │   └── api.ts                 # Cliente API
│   ├── types/                      # TypeScript types
│   ├── .env.local                 # Variables de entorno
│   └── package.json
│
├── mobile/                          # Aplicación Móvil
│   ├── src/
│   │   ├── api/                    # Configuración API
│   │   │   ├── config.ts
│   │   │   └── endpoints.ts
│   │   ├── context/                # React Context
│   │   ├── hooks/                  # Custom hooks
│   │   ├── navigation/             # React Navigation
│   │   ├── screens/                # Pantallas
│   │   │   ├── Auth/
│   │   │   ├── Home/
│   │   │   ├── Pets/
│   │   │   └── ...
│   │   ├── store/                  # Zustand store
│   │   └── types/                  # TypeScript types
│   ├── App.tsx                     # Entry point
│   ├── app.json                    # Configuración Expo
│   └── package.json
│
├── scripts/                         # Scripts de utilidad
│   └── verify-integration.cjs
│
├── INTEGRATION_ANALYSIS.md          # Análisis de integración
└── README.md                        # Documentación principal
```

## Tecnologías por Capa

### Frontend (Web)
- **Framework:** Next.js 14 con App Router
- **Lenguaje:** TypeScript
- **UI:** Tailwind CSS
- **State Management:** SWR (stale-while-revalidate)
- **Animaciones:** Framer Motion
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **HTTP Client:** Fetch API

### Mobile
- **Framework:** React Native + Expo
- **Lenguaje:** TypeScript
- **Navegación:** React Navigation 7
- **State Management:** Zustand + TanStack Query
- **UI:** React Native Paper
- **HTTP Client:** Axios
- **Storage:** Expo Secure Store
- **Mapas:** React Native Maps

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **ORM:** Prisma
- **Validación:** Zod
- **Autenticación:** JWT (jsonwebtoken)
- **Seguridad:** Helmet, CORS, Rate Limiting
- **Logging:** Winston + Morgan
- **Compresión:** compression

### Base de Datos
- **DBMS:** PostgreSQL 14+
- **ORM:** Prisma
- **Migraciones:** Prisma Migrate

## Seguridad

### Backend
1. **Helmet** - Headers HTTP seguros
2. **CORS** - Control de orígenes
3. **Rate Limiting** - Protección contra ataques
4. **JWT** - Autenticación stateless
5. **Bcrypt** - Hash de contraseñas
6. **Zod** - Validación de entrada
7. **HTTPS** - Encriptación en tránsito (producción)

### Frontend/Mobile
1. **JWT Storage** - localStorage (web) / SecureStore (mobile)
2. **HTTPS Only** - Comunicación encriptada
3. **Input Validation** - Validación en cliente
4. **XSS Protection** - Sanitización de datos

## Escalabilidad

### Horizontal
- Backend puede escalarse con múltiples instancias
- Load balancer (Nginx/HAProxy)
- Session storage en Redis (futuro)

### Vertical
- PostgreSQL con índices optimizados
- Connection pooling con Prisma
- Caching con Redis (futuro)

### CDN
- Assets estáticos en CDN
- Next.js Image Optimization
- Compresión Gzip/Brotli

---

**Última actualización:** Febrero 2026
