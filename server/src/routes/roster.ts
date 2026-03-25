import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

export const rosterRouter = Router()
rosterRouter.use(authMiddleware)

const DEFAULT_ROSTER: Record<string, number> = {
  'Пати лидер': 1,
  'ДД': 2,
  'РДД': 2,
  'Поддержка': 0,
  'Танк': 4,
  'Рыба': 2,
  'Шая': 3,
  'Купол': 4,
  'Массовый контроль': 2,
  'Жесткая крыса': 0,
  'Альтернативно полезный': 0,
}

rosterRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const record = await prisma.rosterConfig.findUnique({ where: { userId } })
  res.json(record?.config ?? DEFAULT_ROSTER)
})

rosterRouter.put('/', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const config = req.body as Record<string, number>

  const record = await prisma.rosterConfig.upsert({
    where: { userId },
    create: { userId, config },
    update: { config },
  })
  res.json(record.config)
})
