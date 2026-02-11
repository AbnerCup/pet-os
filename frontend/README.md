# Pet OS Frontend

Frontend Next.js 14 conectado a backend Express.

## Instalación

```bash
npm install
```

## Configuración

Crear `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Ejecutar

```bash
npm run dev
```

Frontend corre en `http://localhost:3000`

## Estructura

- `app/` - Páginas Next.js App Router
- `hooks/` - Custom hooks (useAuth, usePets, useSWR)
- `lib/` - Utilidades (api fetcher)
- Conectado a backend en `localhost:3001`
