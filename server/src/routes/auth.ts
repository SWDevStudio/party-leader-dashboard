import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

export const authRouter = Router()

authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'email и password обязательны' })
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Некорректный email' })
    return
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Пароль минимум 8 символов' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'Email уже занят' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { email, passwordHash, emailVerified: true },
  })

  const secret = process.env.JWT_SECRET!
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' })

  res.status(201).json({ token, email: user.email })
})

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'email и password обязательны' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: 'Неверный email или пароль' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Неверный email или пароль' })
    return
  }

  const secret = process.env.JWT_SECRET!
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' })

  res.json({ token, email: user.email })
})
