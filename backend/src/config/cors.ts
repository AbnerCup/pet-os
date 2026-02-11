import cors from 'cors'

const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:8081',
  'http://192.168.1.38:3001',
  'http://192.168.1.38:8081',
  'http://192.168.1.38:8082',
  'http://192.168.1.38:8085',
  'http://192.168.1.38:8086',
  'exp://192.168.1.38:8081',
  'exp://192.168.1.100:8081', // Expo development
]

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL)
}

if (process.env.EXPO_PUBLIC_API_URL) {
  allowedOrigins.push(process.env.EXPO_PUBLIC_API_URL)
}

export const corsConfig = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

export default corsConfig