# 🚀 Guía de Integración Frontend - Pet-OS

## 📱 Integración Mobile (React Native / Expo)

### **1. Instalación de Dependencias**

```bash
# En tu proyecto frontend mobile
npm install axios expo-secure-store
# o
yarn add axios expo-secure-store
```

### **2. Configuración de la API**

Crea el archivo `src/config/api.ts`:

```typescript
import axios, { AxiosInstance } from 'axios'
import * as SecureStore from 'expo-secure-store'

// Configuración base
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}

// Instancia de Axios
export const api: AxiosInstance = axios.create(API_CONFIG)

// Interceptor para añadir token automáticamente
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('userToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.warn('Error al obtener token:', error)
  }
  return config
})

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('userToken')
      // Redirigir al login
    }
    return Promise.reject(error)
  }
)

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default api
```

### **3. Servicios de API**

Crea `src/services/authService.ts`:

```typescript
import api, { ApiResponse } from '../config/api'
import * as SecureStore from 'expo-secure-store'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  plan?: 'FREE' | 'BASIC' | 'FAMILY'
}

export const authService = {
  // Registro
  async register(data: RegisterData): Promise<ApiResponse> {
    const response = await api.post('/api/auth/register', data)
    if (response.data.data?.token) {
      await SecureStore.setItemAsync('userToken', response.data.data.token)
    }
    return response.data
  },

  // Login
  async login(data: LoginData): Promise<ApiResponse> {
    const response = await api.post('/api/auth/login', data)
    if (response.data.data?.token) {
      await SecureStore.setItemAsync('userToken', response.data.data.token)
    }
    return response.data
  },

  // Obtener perfil
  async getProfile(): Promise<ApiResponse> {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  // Actualizar perfil
  async updateProfile(data: Partial<RegisterData>): Promise<ApiResponse> {
    const response = await api.put('/api/auth/me', data)
    return response.data
  },

  // Logout
  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('userToken')
  }
}
```

Crea `src/services/petsService.ts`:

```typescript
import api, { ApiResponse } from '../config/api'

interface Pet {
  id?: string
  name: string
  species: string
  breed?: string
  birthDate?: string
  weight?: number
  photoUrl?: string
}

export const petsService = {
  // Listar mascotas
  async getPets(): Promise<ApiResponse<Pet[]>> {
    const response = await api.get('/api/pets')
    return response.data
  },

  // Crear mascota
  async createPet(data: Pet): Promise<ApiResponse<Pet>> {
    const response = await api.post('/api/pets', data)
    return response.data
  },

  // Obtener mascota por ID
  async getPetById(id: string): Promise<ApiResponse<Pet>> {
    const response = await api.get(`/api/pets/${id}`)
    return response.data
  },

  // Actualizar mascota
  async updatePet(id: string, data: Partial<Pet>): Promise<ApiResponse<Pet>> {
    const response = await api.put(`/api/pets/${id}`, data)
    return response.data
  },

  // Eliminar mascota
  async deletePet(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/api/pets/${id}`)
    return response.data
  }
}
```

Crea `src/services/healthService.ts`:

```typescript
import api, { ApiResponse } from '../config/api'

interface HealthRecord {
  id?: string
  petId: string
  type: string
  title: string
  date: string
  nextDate?: string
  vetName?: string
  notes?: string
  status?: 'pending' | 'completed'
}

export const healthService = {
  // Listar registros médicos
  async getHealthRecords(params?: { 
    petId?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<HealthRecord[]>> {
    const response = await api.get('/api/health', { params })
    return response.data
  },

  // Crear registro médico
  async createHealthRecord(data: HealthRecord): Promise<ApiResponse<HealthRecord>> {
    const response = await api.post('/api/health', data)
    return response.data
  },

  // Actualizar registro médico
  async updateHealthRecord(id: string, data: Partial<HealthRecord>): Promise<ApiResponse<HealthRecord>> {
    const response = await api.put(`/api/health/${id}`, data)
    return response.data
  },

  // Eliminar registro médico
  async deleteHealthRecord(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/api/health/${id}`)
    return response.data
  }
}
```

### **4. Ejemplo de Uso en Componentes**

```typescript
// screens/LoginScreen.tsx
import { useState } from 'react'
import { View, TextInput, Button, Alert } from 'react-native'
import { authService } from '../services/authService'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      const response = await authService.login({ email, password })
      
      if (response.success) {
        navigation.navigate('Home')
      } else {
        Alert.alert('Error', response.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Iniciar Sesión" onPress={handleLogin} disabled={loading} />
    </View>
  )
}
```

---

## 🌐 Integración Web (React / Next.js / Vite)

### **1. Instalación**

```bash
npm install axios
# Para almacenamiento seguro en web
npm install js-cookie
```

### **2. Configuración API para Web**

Crea `src/config/api.ts`:

```typescript
import axios, { AxiosInstance } from 'axios'
import Cookies from 'js-cookie'

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}

export const api: AxiosInstance = axios.create(API_CONFIG)

// Interceptor para añadir token
api.interceptors.request.use((config) => {
  const token = Cookies.get('userToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('userToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default api
```

### **3. Servicios para Web**

Los servicios son idénticos a mobile, solo cambia el manejo de tokens:

```typescript
// src/services/authService.ts
import api, { ApiResponse } from '../config/api'
import Cookies from 'js-cookie'

export const authService = {
  async login(data: { email: string; password: string }): Promise<ApiResponse> {
    const response = await api.post('/api/auth/login', data)
    if (response.data.data?.token) {
      Cookies.set('userToken', response.data.data.token, { expires: 7 })
    }
    return response.data
  },

  async logout(): Promise<void> {
    Cookies.remove('userToken')
  }
}
```

### **4. Ejemplo con React Hooks**

```typescript
// hooks/usePets.ts
import { useState, useEffect } from 'react'
import { petsService } from '../services/petsService'

export function usePets() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPets()
  }, [])

  const loadPets = async () => {
    try {
      setLoading(true)
      const response = await petsService.getPets()
      if (response.success) {
        setPets(response.data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addPet = async (petData) => {
    const response = await petsService.createPet(petData)
    if (response.success) {
      await loadPets()
    }
    return response
  }

  return { pets, loading, error, addPet, refresh: loadPets }
}

// Uso en componente
function PetsScreen() {
  const { pets, loading, addPet } = usePets()

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      {pets.map(pet => (
        <div key={pet.id}>{pet.name}</div>
      ))}
    </div>
  )
}
```

---

## 🔧 Variables de Entorno

### **Mobile (.env)**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
```

### **Web (.env)**
```env
VITE_API_URL=http://localhost:3001
# o para producción
VITE_API_URL=https://api.pet-os.com
```

---

## 🧪 Testing de Conexión

### **1. Verificar Backend**
```bash
curl http://localhost:3001/api/health-check
```

### **2. Test de Login desde Frontend**
```typescript
// Ejecuta esto en la consola del navegador o en tu app
import { authService } from './services/authService'

authService.login({
  email: 'test@example.com',
  password: '123456'
}).then(console.log)
```

---

## 📋 Checklist de Integración

- [ ] Instalar dependencias (axios, expo-secure-store o js-cookie)
- [ ] Configurar archivo `api.ts` con interceptors
- [ ] Crear servicios para cada módulo (auth, pets, health, etc.)
- [ ] Configurar variables de entorno
- [ ] Probar health-check endpoint
- [ ] Implementar flujo de login/registro
- [ ] Manejar tokens de autenticación
- [ ] Implementar manejo de errores
- [ ] Agregar loading states
- [ ] Probar en dispositivo real (mobile)

---

## 🚨 Consideraciones Importantes

### **CORS**
El backend ya tiene CORS configurado. Asegúrate de que tu frontend esté en la lista de origins permitidos en `src/config/cors.ts`

### **Rate Limiting**
- Auth endpoints: 5 intentos cada 15 minutos
- Otros endpoints: 100 peticiones cada 15 minutos

### **Autenticación**
Todos los endpoints excepto `/api/auth/register`, `/api/auth/login` y `/api/health-check` requieren token JWT.

### **Planes Premium**
El endpoint `/api/location` requiere plan BASIC o FAMILY.

---

## 📞 Endpoints Disponibles

| Módulo | Método | Endpoint | Auth | Descripción |
|--------|--------|----------|------|-------------|
| Health | GET | `/api/health-check` | No | Estado del servidor |
| Auth | POST | `/api/auth/register` | No | Registro de usuario |
| Auth | POST | `/api/auth/login` | No | Inicio de sesión |
| Auth | GET | `/api/auth/me` | Sí | Perfil del usuario |
| Auth | PUT | `/api/auth/me` | Sí | Actualizar perfil |
| Pets | GET | `/api/pets` | Sí | Listar mascotas |
| Pets | POST | `/api/pets` | Sí | Crear mascota |
| Pets | GET | `/api/pets/:id` | Sí | Detalle de mascota |
| Pets | PUT | `/api/pets/:id` | Sí | Actualizar mascota |
| Pets | DELETE | `/api/pets/:id` | Sí | Eliminar mascota |
| Health | GET | `/api/health` | Sí | Registros médicos |
| Health | POST | `/api/health` | Sí | Crear registro |
| Health | PUT | `/api/health/:id` | Sí | Actualizar registro |
| Health | DELETE | `/api/health/:id` | Sí | Eliminar registro |
| Expenses | GET | `/api/expenses` | Sí | Listar gastos |
| Expenses | POST | `/api/expenses` | Sí | Crear gasto |
| Activities | GET | `/api/activities` | Sí | Listar actividades |
| Activities | POST | `/api/activities` | Sí | Crear actividad |
| Location | GET | `/api/location` | Sí (BASIC+) | Historial ubicación |
| Location | POST | `/api/location` | Sí (BASIC+) | Registrar ubicación |

---

## 🎯 Próximos Pasos

1. **Crear proyecto frontend** (Expo o Vite/Next.js)
2. **Copiar configuración de API** de esta guía
3. **Implementar servicios** para cada módulo
4. **Crear pantallas/páginas** usando los servicios
5. **Probar flujo completo** de registro → login → CRUD

¿Necesitas ayuda con algún paso específico?
