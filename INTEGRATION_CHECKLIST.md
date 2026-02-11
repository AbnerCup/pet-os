# ✅ Checklist de Verificación de Integración Pet-OS

## 📋 Preparación Inicial

### Backend
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `pet_os` creada
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado correctamente
- [ ] Puerto configurado en `3001`
- [ ] Migraciones ejecutadas (`npm run db:migrate`)
- [ ] Seed ejecutado (opcional) (`npm run db:seed`)

### Frontend
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env.local` configurado
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:3001` configurado

### Mobile
- [ ] Dependencias instaladas (`npm install`)
- [ ] Expo CLI instalado globalmente (opcional)
- [ ] Expo Go instalado en dispositivo móvil
- [ ] IP local configurada en `src/api/config.ts` (si es necesario)

---

## 🚀 Inicio de Servicios

### 1. Iniciar Backend
```bash
cd backend
npm run dev
```

**Verificar:**
- [ ] Servidor corriendo en `http://localhost:3001`
- [ ] Mensaje en consola: "🚀 Servidor backend corriendo en http://localhost:3001"
- [ ] Sin errores de conexión a PostgreSQL
- [ ] Logs de Winston funcionando

**Prueba rápida:**
```bash
# En otra terminal
curl http://localhost:3001/api/health-check
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2026-02-10T..."
}
```

### 2. Iniciar Frontend
```bash
cd frontend
npm run dev
```

**Verificar:**
- [ ] Servidor corriendo en `http://localhost:3000`
- [ ] Compilación exitosa sin errores
- [ ] Página carga en el navegador
- [ ] No hay errores en la consola del navegador

### 3. Iniciar Mobile
```bash
cd mobile
npm start
```

**Verificar:**
- [ ] Expo Dev Server iniciado
- [ ] QR code visible en terminal
- [ ] Metro bundler corriendo
- [ ] App carga en Expo Go

---

## 🧪 Pruebas de Integración

### Prueba 1: Health Check del Backend

**Desde el navegador:**
```
http://localhost:3001/api/health-check
```

- [ ] Responde con status 200
- [ ] JSON con `success: true`
- [ ] Timestamp presente

---

### Prueba 2: Registro de Usuario (Frontend)

1. [ ] Abrir `http://localhost:3000`
2. [ ] Navegar a página de registro
3. [ ] Llenar formulario:
   - Email: `test@example.com`
   - Password: `Test123456`
   - Name: `Usuario Test`
4. [ ] Enviar formulario
5. [ ] Verificar que se recibe un token JWT
6. [ ] Verificar que se redirige al dashboard

**Verificar en Backend:**
- [ ] Log de petición POST `/api/auth/register`
- [ ] Status 201 Created
- [ ] Usuario creado en base de datos

**Verificar en PostgreSQL:**
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

---

### Prueba 3: Login (Frontend)

1. [ ] Navegar a página de login
2. [ ] Ingresar credenciales:
   - Email: `test@example.com`
   - Password: `Test123456`
3. [ ] Enviar formulario
4. [ ] Verificar que se recibe token
5. [ ] Verificar que token se guarda en localStorage
6. [ ] Verificar redirección a dashboard

**Verificar en DevTools:**
```javascript
// En consola del navegador
localStorage.getItem('token')
// Debe mostrar el JWT
```

---

### Prueba 4: Crear Mascota (Frontend)

**Prerequisito:** Usuario logueado

1. [ ] Navegar a sección de mascotas
2. [ ] Clic en "Agregar Mascota"
3. [ ] Llenar formulario:
   - Nombre: `Firulais`
   - Especie: `Perro`
   - Raza: `Labrador`
   - Edad: `3`
4. [ ] Enviar formulario
5. [ ] Verificar que mascota aparece en la lista

**Verificar en Backend:**
- [ ] Log de petición POST `/api/pets`
- [ ] Header `Authorization: Bearer <token>` presente
- [ ] Status 201 Created

**Verificar en PostgreSQL:**
```sql
SELECT * FROM pets WHERE name = 'Firulais';
```

---

### Prueba 5: Obtener Mascotas (Frontend)

1. [ ] Navegar a lista de mascotas
2. [ ] Verificar que se muestran las mascotas del usuario
3. [ ] Verificar que se muestra información completa

**Verificar en Backend:**
- [ ] Log de petición GET `/api/pets`
- [ ] Status 200 OK
- [ ] Array de mascotas en respuesta

**Verificar en DevTools Network:**
- [ ] Request tiene header `Authorization`
- [ ] Response contiene array de mascotas

---

### Prueba 6: Registro de Usuario (Mobile)

1. [ ] Abrir app en Expo Go
2. [ ] Navegar a pantalla de registro
3. [ ] Llenar formulario:
   - Email: `mobile@example.com`
   - Password: `Mobile123456`
   - Name: `Usuario Mobile`
4. [ ] Enviar formulario
5. [ ] Verificar que se recibe token
6. [ ] Verificar que se redirige a home

**Verificar en Backend:**
- [ ] Log de petición POST `/api/auth/register`
- [ ] Status 201 Created

---

### Prueba 7: Login (Mobile)

1. [ ] Navegar a pantalla de login
2. [ ] Ingresar credenciales:
   - Email: `mobile@example.com`
   - Password: `Mobile123456`
3. [ ] Enviar formulario
4. [ ] Verificar que se recibe token
5. [ ] Verificar que token se guarda en SecureStore
6. [ ] Verificar redirección a home

**Verificar en Backend:**
- [ ] Log de petición POST `/api/auth/login`
- [ ] Status 200 OK

---

### Prueba 8: Crear Mascota (Mobile)

**Prerequisito:** Usuario logueado

1. [ ] Navegar a pantalla de mascotas
2. [ ] Tap en botón "Agregar Mascota"
3. [ ] Llenar formulario:
   - Nombre: `Michi`
   - Especie: `Gato`
   - Raza: `Siamés`
   - Edad: `2`
4. [ ] Enviar formulario
5. [ ] Verificar que mascota aparece en la lista

**Verificar en Backend:**
- [ ] Log de petición POST `/api/pets`
- [ ] Header `Authorization: Bearer <token>` presente
- [ ] Status 201 Created

---

### Prueba 9: Sincronización entre Web y Mobile

1. [ ] Crear mascota en Frontend Web
2. [ ] Refrescar lista en Mobile App
3. [ ] Verificar que la mascota aparece en Mobile
4. [ ] Crear mascota en Mobile App
5. [ ] Refrescar lista en Frontend Web
6. [ ] Verificar que la mascota aparece en Web

**Esto verifica:**
- [ ] Backend es la única fuente de verdad
- [ ] Ambos clientes se comunican correctamente
- [ ] Autenticación funciona en ambos

---

### Prueba 10: Manejo de Errores

#### Error 401 - No Autenticado

**Frontend:**
1. [ ] Borrar token de localStorage
2. [ ] Intentar acceder a `/api/pets`
3. [ ] Verificar que se recibe error 401
4. [ ] Verificar que se redirige a login

**Mobile:**
1. [ ] Borrar token de SecureStore
2. [ ] Intentar acceder a lista de mascotas
3. [ ] Verificar que se recibe error 401
4. [ ] Verificar que se redirige a login

#### Error 400 - Validación

**Frontend:**
1. [ ] Intentar crear mascota sin nombre
2. [ ] Verificar que se muestra error de validación
3. [ ] Verificar que no se envía petición al backend

**Mobile:**
1. [ ] Intentar crear mascota sin nombre
2. [ ] Verificar que se muestra error de validación

---

### Prueba 11: Rate Limiting

**Desde terminal:**
```bash
# Hacer múltiples requests rápidos
for i in {1..20}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

**Verificar:**
- [ ] Después de varios intentos, se recibe error 429 (Too Many Requests)
- [ ] Backend está protegido contra ataques de fuerza bruta

---

### Prueba 12: CORS

**Desde consola del navegador en un sitio diferente:**
```javascript
fetch('http://localhost:3001/api/health-check')
  .then(r => r.json())
  .then(console.log)
```

**Verificar:**
- [ ] Si el origen no está permitido, se bloquea la petición
- [ ] CORS está configurado correctamente

---

## 🔍 Verificación de Logs

### Backend Logs

**Verificar que se registran:**
- [ ] Peticiones HTTP (Morgan)
- [ ] Errores (Winston)
- [ ] Información de sistema (Winston)

**Ubicación:**
```
backend/logs/
├── error-YYYY-MM-DD.log
└── combined-YYYY-MM-DD.log
```

---

## 📊 Verificación de Base de Datos

### Conectar a PostgreSQL
```bash
psql -U postgres -d pet_os
```

### Verificar Tablas
```sql
\dt
```

**Tablas esperadas:**
- [ ] users
- [ ] pets
- [ ] health_records
- [ ] expenses
- [ ] activities
- [ ] locations
- [ ] safe_zones
- [ ] alerts
- [ ] _prisma_migrations

### Verificar Datos
```sql
-- Usuarios
SELECT id, email, name, created_at FROM users;

-- Mascotas
SELECT id, name, species, breed, user_id FROM pets;

-- Registros de salud
SELECT * FROM health_records;
```

---

## 🎯 Checklist Final

### Configuración
- [ ] Puertos consistentes (3001 para backend)
- [ ] Variables de entorno configuradas
- [ ] Base de datos conectada
- [ ] Dependencias instaladas en los 3 proyectos

### Funcionalidad
- [ ] Backend responde a health check
- [ ] Registro de usuarios funciona (Web y Mobile)
- [ ] Login funciona (Web y Mobile)
- [ ] CRUD de mascotas funciona (Web y Mobile)
- [ ] Autenticación JWT funciona
- [ ] Tokens se guardan correctamente
- [ ] Sincronización entre clientes funciona

### Seguridad
- [ ] Contraseñas se hashean
- [ ] JWT se valida correctamente
- [ ] Rate limiting funciona
- [ ] CORS configurado
- [ ] Headers de seguridad presentes

### Logging
- [ ] Logs HTTP se registran
- [ ] Errores se registran
- [ ] Archivos de log se crean

### Base de Datos
- [ ] Migraciones aplicadas
- [ ] Tablas creadas
- [ ] Datos se persisten correctamente
- [ ] Relaciones funcionan

---

## 🐛 Problemas Comunes

### Backend no inicia
- [ ] Verificar que PostgreSQL está corriendo
- [ ] Verificar credenciales en `.env`
- [ ] Verificar que el puerto 3001 no está en uso
- [ ] Verificar que las dependencias están instaladas

### Frontend no conecta con Backend
- [ ] Verificar que `NEXT_PUBLIC_API_URL` apunta a `http://localhost:3001`
- [ ] Verificar que backend está corriendo
- [ ] Verificar CORS en backend

### Mobile no conecta con Backend
- [ ] Verificar IP local en `src/api/config.ts`
- [ ] Verificar que móvil y PC están en la misma red
- [ ] Verificar que backend está corriendo
- [ ] Para Android emulator, usar `10.0.2.2` en lugar de `localhost`

### Error 401 en todas las peticiones
- [ ] Verificar que token se está guardando
- [ ] Verificar que token se está enviando en headers
- [ ] Verificar que JWT_SECRET es el mismo en backend

### Base de datos no conecta
- [ ] Verificar que PostgreSQL está corriendo
- [ ] Verificar `DATABASE_URL` en `.env`
- [ ] Verificar que base de datos `pet_os` existe
- [ ] Verificar credenciales de PostgreSQL

---

## 📝 Notas

- Ejecutar `node scripts/verify-integration.cjs` para verificación automática
- Consultar `INTEGRATION_ANALYSIS.md` para análisis detallado
- Consultar `ARCHITECTURE.md` para diagramas de arquitectura

---

**Última actualización:** Febrero 2026
