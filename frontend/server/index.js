const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = process.env.PORT || 3001

// Mock users data
const users = [
  {
    id: '1',
    email: 'free@test.com',
    password: '123456',
    name: 'Usuario Free',
    plan: 'FREE'
  },
  {
    id: '2',
    email: 'basic@test.com',
    password: '123456',
    name: 'Usuario Basic',
    plan: 'BASIC'
  },
  {
    id: '3',
    email: 'family@test.com',
    password: '123456',
    name: 'Usuario Family',
    plan: 'FAMILY'
  }
]

const JWT_SECRET = 'pet-os-secret-key-2024'

app.use(cors())
app.use(express.json())

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' })
    }
    req.user = user
    next()
  })
}

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body

  const user = users.find(u => u.email === email && u.password === password)

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan
    }
  })
})

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, phone } = req.body

  // Check if user already exists
  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    return res.status(400).json({ error: 'El usuario ya existe' })
  }

  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    email,
    password,
    name,
    phone,
    plan: 'FREE'
  }

  users.push(newUser)

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, plan: newUser.plan },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      plan: newUser.plan
    }
  })
})

// Get current user
app.get('/api/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan
  })
})

// Mock pets data
let pets = [
  {
    id: '1',
    userId: '1',
    name: 'Luna',
    species: 'dog',
    breed: 'Golden Retriever',
    birthDate: '2022-05-15',
    weight: 25.5,
    photoUrl: 'https://via.placeholder.com/150'
  },
  {
    id: '2',
    userId: '2',
    name: 'Max',
    species: 'cat',
    breed: 'Siames',
    birthDate: '2021-08-20',
    weight: 4.2,
    photoUrl: 'https://via.placeholder.com/400'
  },
  {
    id: '3',
    userId: '1',
    name: 'Rocky',
    species: 'dog',
    breed: 'Bulldog',
    birthDate: '2023-01-10',
    weight: 30.2,
    photoUrl: '/uploads/pets/3_sample.jpg'
  },
  {
    id: '4',
    userId: '2',
    name: 'Luna',
    species: 'cat',
    breed: 'Persa',
    birthDate: '2022-03-22',
    weight: 3.8,
    photoUrl: '/uploads/pets/4_sample.jpg'
  }
]

// Get pets for current user
app.get('/api/pets', authenticateToken, (req, res) => {
  const userPets = pets.filter(pet => pet.userId === req.user.id)
  res.json(userPets)
})

// Create pet
app.post('/api/pets', authenticateToken, (req, res) => {
  const { name, species, breed, birthDate, weight } = req.body
  
  const newPet = {
    id: (pets.length + 1).toString(),
    userId: req.user.id,
    name,
    species,
    breed,
    birthDate,
    weight: parseFloat(weight)
  }

  pets.push(newPet)
  res.json(newPet)
})

// Get pet by ID
app.get('/api/pets/:id', authenticateToken, (req, res) => {
  const pet = pets.find(p => p.id === req.params.id && p.userId === req.user.id)
  if (!pet) {
    return res.status(404).json({ error: 'Mascota no encontrada' })
  }
  res.json(pet)
})

// Update pet
app.put('/api/pets/:id', authenticateToken, (req, res) => {
  const petIndex = pets.findIndex(p => p.id === req.params.id && p.userId === req.user.id)
  if (petIndex === -1) {
    return res.status(404).json({ error: 'Mascota no encontrada' })
  }

  pets[petIndex] = { ...pets[petIndex], ...req.body }
  res.json(pets[petIndex])
})

// Delete pet
app.delete('/api/pets/:id', authenticateToken, (req, res) => {
  const petIndex = pets.findIndex(p => p.id === req.params.id && p.userId === req.user.id)
  if (petIndex === -1) {
    return res.status(404).json({ error: 'Mascota no encontrada' })
  }

  pets.splice(petIndex, 1)
  res.json({ message: 'Mascota eliminada' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})