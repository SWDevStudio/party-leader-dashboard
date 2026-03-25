import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

export const raidsRouter = Router()
raidsRouter.use(authMiddleware)

function mapRaid(raid: {
  id: string
  name: string
  createdAt: Date
  players: { playerId: string }[]
}) {
  return {
    id: raid.id,
    name: raid.name,
    createdAt: raid.createdAt.toISOString(),
    playerIds: raid.players.map(p => p.playerId),
  }
}

raidsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const raids = await prisma.raid.findMany({
    where: { userId },
    include: { players: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json(raids.map(mapRaid))
})

raidsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const { name, playerIds } = req.body as { name?: string; playerIds?: string[] }

  if (!name?.trim()) {
    res.status(400).json({ error: 'Название рейда обязательно' })
    return
  }

  const validPlayers = await prisma.player.findMany({
    where: { userId, id: { in: playerIds ?? [] } },
    select: { id: true },
  })

  const raid = await prisma.raid.create({
    data: {
      userId,
      name: name.trim(),
      players: {
        create: validPlayers.map(p => ({ playerId: p.id })),
      },
    },
    include: { players: true },
  })
  res.status(201).json(mapRaid(raid))
})

raidsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const id = String(req.params.id)

  const existing = await prisma.raid.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'Рейд не найден' })
    return
  }

  const { name, playerIds } = req.body as { name?: string; playerIds?: string[] }

  if (name !== undefined && !name.trim()) {
    res.status(400).json({ error: 'Название рейда не может быть пустым' })
    return
  }

  const validPlayers = playerIds !== undefined
    ? await prisma.player.findMany({
        where: { userId, id: { in: playerIds } },
        select: { id: true },
      })
    : null

  const raid = await prisma.raid.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(validPlayers !== null && {
        players: {
          deleteMany: {},
          create: validPlayers.map(p => ({ playerId: p.id })),
        },
      }),
    },
    include: { players: true },
  })
  res.json(mapRaid(raid))
})

raidsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const id = String(req.params.id)

  const existing = await prisma.raid.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'Рейд не найден' })
    return
  }

  await prisma.raid.delete({ where: { id } })
  res.status(204).send()
})
