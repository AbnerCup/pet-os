# 📚 Ejemplos de Integración Frontend - Pet-OS

Esta carpeta contiene ejemplos completos y listos para usar para integrar tu frontend (web o mobile) con el backend Pet-OS.

---

## 📁 Archivos Disponibles

### **Configuración de API**

#### 1. `api-config-mobile.ts`
Configuración completa de Axios para **React Native / Expo**
- ✅ Interceptors de request/response
- ✅ Manejo automático de tokens con SecureStore
- ✅ Manejo de errores centralizado
- ✅ Logging en desarrollo
- ✅ Utilidades (checkConnection, tokenManager)

**Uso:**
```typescript
import api from './config/api'

const response = await api.get('/api/pets')
```

#### 2. `api-config-web.ts`
Configuración completa de Axios para **React / Next.js / Vite**
- ✅ Interceptors de request/response
- ✅ Manejo automático de tokens con Cookies
- ✅ Manejo de errores centralizado
- ✅ Redirección automática al login en 401
- ✅ Utilidades (checkConnection, tokenManager)

**Uso:**
```typescript
import api from './config/api'

const response = await api.get('/api/pets')
```

---

### **Servicios de API**

#### 3. `mobile-services.ts`
Servicios completos para **React Native / Expo**
- ✅ authService - Autenticación
- ✅ petsService - Gestión de mascotas
- ✅ healthService - Registros médicos
- ✅ expensesService - Control de gastos
- ✅ activitiesService - Registro de actividades
- ✅ locationService - Rastreo GPS
- ✅ healthCheckService - Estado del servidor

**Uso:**
```typescript
import { authService, petsService } from './services'

// Login
const result = await authService.login({
  email: 'user@example.com',
  password: '123456'
})

// Obtener mascotas
const pets = await petsService.getPets()
```

#### 4. `web-services.ts`
Servicios completos para **React / Next.js / Vite**
- ✅ Mismas funcionalidades que mobile-services.ts
- ✅ Adaptado para usar Cookies en lugar de SecureStore

**Uso:**
```typescript
import { authService, petsService } from './services'

const result = await authService.login({
  email: 'user@example.com',
  password: '123456'
})
```

---

### **React Hooks**

#### 5. `react-hooks.ts`
Hooks personalizados para facilitar el desarrollo
- ✅ `useAuth()` - Manejo de autenticación
- ✅ `usePets()` - Gestión de mascotas
- ✅ `useHealthRecords()` - Registros médicos
- ✅ `useExpenses()` - Control de gastos
- ✅ `useActivities()` - Registro de actividades
- ✅ `useLocation()` - Rastreo GPS

**Uso:**
```typescript
import { useAuth, usePets } from './hooks'

function MyComponent() {
  const { user, login, logout } = useAuth()
  const { pets, loading, addPet } = usePets()

  // Tu lógica aquí
}
```

---

### **Componentes de Ejemplo**

#### 6. `react-components.tsx`
Componentes completos de ejemplo
- ✅ LoginPage - Página de inicio de sesión
- ✅ RegisterPage - Página de registro
- ✅ PetsList - Lista de mascotas
- ✅ AddPetModal - Modal para agregar mascota
- ✅ PetDetailPage - Detalle de mascota con tabs
- ✅ HealthTab - Tab de registros médicos
- ✅ ExpensesTab - Tab de gastos
- ✅ ActivitiesTab - Tab de actividades

**Uso:**
```typescript
import { LoginPage, PetsList } from './components'

function App() {
  return (
    <div>
      <LoginPage />
      <PetsList />
    </div>
  )
}
```

---

## 🚀 Guía Rápida de Integración

### **Para Mobile (Expo/React Native)**

#### 1. Instalar dependencias
```bash
npm install axios expo-secure-store
```

#### 2. Copiar archivos necesarios
```bash
# Estructura recomendada:
src/
├── config/
│   └── api.ts              # Copiar api-config-mobile.ts
├── services/
│   └── index.ts            # Copiar mobile-services.ts
├── hooks/
│   └── index.ts            # Copiar react-hooks.ts
└── components/
    └── ...                 # Copiar componentes que necesites
```

#### 3. Configurar variables de entorno
```bash
# .env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
```

#### 4. Usar en tu app
```typescript
import { useAuth } from './hooks'

export default function App() {
  const { user, login } = useAuth()

  if (!user) {
    return <LoginScreen onLogin={login} />
  }

  return <HomeScreen user={user} />
}
```

---

### **Para Web (React/Next.js/Vite)**

#### 1. Instalar dependencias
```bash
npm install axios js-cookie
npm install -D @types/js-cookie
```

#### 2. Copiar archivos necesarios
```bash
# Estructura recomendada:
src/
├── config/
│   └── api.ts              # Copiar api-config-web.ts
├── services/
│   └── index.ts            # Copiar web-services.ts
├── hooks/
│   └── index.ts            # Copiar react-hooks.ts
└── components/
    └── ...                 # Copiar componentes que necesites
```

#### 3. Configurar variables de entorno
```bash
# .env
VITE_API_URL=http://localhost:3001
```

#### 4. Usar en tu app
```typescript
import { useAuth, usePets } from './hooks'

export default function Dashboard() {
  const { user } = useAuth()
  const { pets, loading } = usePets()

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <h1>Bienvenido, {user?.name}</h1>
      <PetsList pets={pets} />
    </div>
  )
}
```

---

## 📋 Checklist de Integración

### **Configuración Inicial**
- [ ] Backend corriendo en puerto 3001
- [ ] Health check funcionando (`curl http://localhost:3001/api/health-check`)
- [ ] Dependencias instaladas (axios, expo-secure-store o js-cookie)
- [ ] Variables de entorno configuradas

### **Archivos Copiados**
- [ ] Configuración de API (`api-config-*.ts`)
- [ ] Servicios (`*-services.ts`)
- [ ] Hooks (`react-hooks.ts`)
- [ ] Componentes necesarios (`react-components.tsx`)

### **Funcionalidades Probadas**
- [ ] Login funciona correctamente
- [ ] Token se guarda automáticamente
- [ ] Requests incluyen token en headers
- [ ] Logout limpia el token
- [ ] Redirección a login en 401
- [ ] CRUD de mascotas funciona
- [ ] Manejo de errores implementado
- [ ] Estados de carga implementados

---

## 🎯 Ejemplos de Uso Rápido

### **Login**
```typescript
import { authService } from './services'

const result = await authService.login({
  email: 'test@example.com',
  password: '123456'
})

if (result.success) {
  console.log('Usuario:', result.data.user)
  // Token se guarda automáticamente
}
```

### **Crear Mascota**
```typescript
import { petsService } from './services'

const result = await petsService.createPet({
  name: 'Firulais',
  species: 'perro',
  breed: 'Labrador',
  weight: 25.5
})

if (result.success) {
  console.log('Mascota creada:', result.data)
}
```

### **Registrar Vacuna**
```typescript
import { healthService } from './services'

const result = await healthService.createHealthRecord({
  petId: 'pet-id-123',
  type: 'vacuna',
  title: 'Vacuna antirrábica',
  date: '2024-01-15',
  nextDate: '2025-01-15',
  vetName: 'Dr. García'
})
```

### **Usar Hooks**
```typescript
import { usePets } from './hooks'

function MyComponent() {
  const { pets, loading, error, addPet, deletePet } = usePets()

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {pets.map(pet => (
        <div key={pet.id}>
          <h3>{pet.name}</h3>
          <button onClick={() => deletePet(pet.id!)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔧 Personalización

Todos los archivos están diseñados para ser **copiados y modificados** según tus necesidades:

- **Agregar nuevos endpoints**: Añade métodos a los servicios
- **Cambiar manejo de errores**: Modifica los interceptors
- **Agregar logging**: Personaliza los console.log
- **Cambiar almacenamiento**: Modifica tokenManager
- **Agregar validaciones**: Añade validaciones en los hooks

---

## 📞 Soporte

Si tienes dudas sobre cómo usar estos ejemplos:

1. Lee la documentación completa en `../FRONTEND-INTEGRATION-GUIDE.md`
2. Revisa el análisis completo en `../ANALISIS-COMPLETO.md`
3. Consulta la documentación de la API en `../API-Documentation.md`

---

## ✨ Tips y Mejores Prácticas

### **Seguridad**
- ✅ Nunca expongas tokens en logs en producción
- ✅ Usa HTTPS en producción
- ✅ Configura CORS correctamente en el backend
- ✅ Valida datos antes de enviarlos al servidor

### **Performance**
- ✅ Implementa caché local para datos que no cambian frecuentemente
- ✅ Usa paginación para listas largas
- ✅ Implementa debouncing en búsquedas
- ✅ Considera usar React Query o SWR para manejo de estado

### **UX**
- ✅ Muestra estados de carga
- ✅ Maneja errores de forma amigable
- ✅ Implementa retry automático en errores de red
- ✅ Agrega feedback visual en acciones (toast, snackbar)

---

¡Listo para empezar! 🚀
