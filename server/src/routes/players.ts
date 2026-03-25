import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

export const playersRouter = Router()
playersRouter.use(authMiddleware)

function mapPlayer(player: {
  id: string
  gameSurname: string
  discordNick: string
  classId: string
  roles: string[]
  joinedAt: Date
  createdAt: Date
}) {
  return {
    id: player.id,
    gameSurname: player.gameSurname,
    discordNick: player.discordNick,
    classId: player.classId,
    roles: player.roles,
    joinedAt: player.joinedAt.toISOString().split('T')[0],
    createdAt: player.createdAt.toISOString(),
  }
}

playersRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const players = await prisma.player.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
  res.json(players.map(mapPlayer))
})

playersRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const { gameSurname, discordNick, classId, roles, joinedAt } = req.body as {
    gameSurname?: string
    discordNick?: string
    classId?: string
    roles?: string[]
    joinedAt?: string
  }

  if (!gameSurname || !discordNick || !classId || !joinedAt) {
    res.status(400).json({ error: 'Обязательные поля не заполнены' })
    return
  }

  const player = await prisma.player.create({
    data: { userId, gameSurname, discordNick, classId, roles: roles ?? [], joinedAt: new Date(joinedAt) },
  })
  res.status(201).json(mapPlayer(player))
})

playersRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const id = String(req.params.id)

  const existing = await prisma.player.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'Игрок не найден' })
    return
  }

  const { gameSurname, discordNick, classId, roles, joinedAt } = req.body as {
    gameSurname?: string
    discordNick?: string
    classId?: string
    roles?: string[]
    joinedAt?: string
  }

  const player = await prisma.player.update({
    where: { id },
    data: {
      ...(gameSurname !== undefined && { gameSurname }),
      ...(discordNick !== undefined && { discordNick }),
      ...(classId !== undefined && { classId }),
      ...(roles !== undefined && { roles }),
      ...(joinedAt !== undefined && { joinedAt: new Date(joinedAt) }),
    },
  })
  res.json(mapPlayer(player))
})

playersRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const id = String(req.params.id)

  const existing = await prisma.player.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'Игрок не найден' })
    return
  }

  await prisma.player.delete({ where: { id } })
  res.status(204).send()
})
