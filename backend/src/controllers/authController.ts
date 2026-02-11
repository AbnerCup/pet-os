import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest, ApiResponse } from '../types'
import { logUserAction, logSecurity, logDatabase, logError } from '../utils/logger'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export const register = async (req: AuthRequest, res: Response) => {
  const { name, email, phone, password, plan } = req.body

  try {
    logDatabase('read', 'user', { operation: 'check-email', email })

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      logSecurity('Registration attempt with existing email', { email, ip: req.ip })
      return res.status(400).json({
        success: false,
        error: 'Email ya registrado'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    logDatabase('create', 'user', { operation: 'register', email, plan })

    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, plan },
      select: { id: true, email: true, name: true, plan: true }
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, plan: user.plan },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    logUserAction(user.id, 'User registered', { email, plan })

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: { user, token }
    })
  } catch (error) {
    logSecurity('Registration failed', { email, error: (error as Error).message })
    throw error
  }
}

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body

  try {
    logDatabase('read', 'user', { operation: 'login-attempt', email })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      logSecurity('Login attempt with non-existent user', { email, ip: req.ip })
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      logSecurity('Login attempt with invalid password', { email, ip: req.ip })
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, plan: user.plan },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    logUserAction(user.id, 'User logged in', { email })

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        }
      }
    })
  } catch (error) {
    logSecurity('Login failed', { email, error: (error as Error).message })
    throw error
  }
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true, plan: true, phone: true }
  })

  res.json({
    success: true,
    data: user
  })
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, phone, email } = req.body

  try {
    // Si se intenta cambiar el email, verificar que no esté en uso
    if (email && email !== req.user!.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'El correo electrónico ya está en uso por otro usuario'
        })
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone, email },
      select: { id: true, email: true, name: true, plan: true, phone: true }
    })

    logUserAction(user.id, 'User updated profile', { fields: Object.keys(req.body) })

    res.json({
      success: true,
      message: 'Perfil actualizado',
      data: user
    })
  } catch (error) {
    logError('Update profile failed', { userId: req.user?.id, error: (error as Error).message })
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el perfil'
    })
  }
}

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }

    const validPassword = await bcrypt.compare(oldPassword, user.password)
    if (!validPassword) {
      logSecurity('Password change attempt with invalid current password', { userId: user.id })
      return res.status(400).json({
        success: false,
        error: 'La contraseña actual es incorrecta'
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    logUserAction(user.id, 'User changed password')

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })
  } catch (error) {
    logSecurity('Password change failed', { userId: req.user?.id, error: (error as Error).message })
    throw error
  }
}