import { Router, Request, Response } from 'express'
import type { SiegeAttendance, SiegeAbsence, SiegeEvent } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

type SiegeWithAttendance = SiegeEvent & {
  attendances: SiegeAttendance[]
  absences: SiegeAbsence[]
}

export const siegesRouter = Router()
siegesRouter.use(authMiddleware)

function mapSiege(siege: SiegeWithAttendance) {
  return {
    id: siege.id,
    date: siege.date.toISOString().split('T')[0],
    totalSlots: siege.totalSlots,
    notes: siege.notes ?? undefined,
    attendees: siege.attendances.map(a => a.playerId),
    absentees: siege.absences.map(a => a.playerId),
  }
}

const includeAttendance = { attendances: true, absences: true }

siegesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const sieges = await prisma.siegeEvent.findMany({
    where: { userId },
    include: includeAttendance,
    orderBy: { date: 'desc' },
  })
  res.json(sieges.map(mapSiege))
})

siegesRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const { date, totalSlots, notes } = req.body as {
    date?: string
    totalSlots?: number
    notes?: string
  }

  if (!date || totalSlots == null) {
    res.status(400).json({ error: 'date и totalSlots обязательны' })
    return
  }

  const siege = await prisma.siegeEvent.create({
    data: { userId, date: new Date(date), totalSlots, notes: notes ?? null },
    include: includeAttendance,
  })
  res.status(201).json(mapSiege(siege as SiegeWithAttendance))
})

siegesRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const id = String(req.params.id)

  const existing = await prisma.siegeEvent.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'Осада не найдена' })
    return
  }

  const { date, totalSlots, notes } = req.body as {
    date?: string
    totalSlots?: number
    notes?: string
  }

  const siege = await prisma.siegeEvent.update({
    where: { id },
    data: {
      ...(date !== undefined && { date: new Date(date) }),
      ...(totalSlots !== undefined && { totalSlots }),
      ...(notes !== undefined && { notes: notes || null }),
    },
    include: includeAttendance,
  })
  res.json(mapSiege(siege as SiegeWithAttendance))
})

siegesRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const id = String(req.params.id)

  const existing = await prisma.siegeEvent.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'Осада не найдена' })
    return
  }

  await prisma.siegeEvent.delete({ where: { id } })
  res.status(204).send()
})

siegesRouter.put('/:id/attendance', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req as AuthRequest
  const id = String(req.params.id)
  const { attendees, absentees } = req.body as { attendees?: string[]; absentees?: string[] }

  const existing = await prisma.siegeEvent.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'Осада не найдена' })
    return
  }

  await prisma.$transaction([
    prisma.siegeAttendance.deleteMany({ where: { siegeId: id } }),
    prisma.siegeAbsence.deleteMany({ where: { siegeId: id } }),
    ...(attendees ?? []).map(playerId =>
      prisma.siegeAttendance.create({ data: { siegeId: id, playerId } }),
    ),
    ...(absentees ?? []).map(playerId =>
      prisma.siegeAbsence.create({ data: { siegeId: id, playerId } }),
    ),
  ])

  const siege = await prisma.siegeEvent.findUnique({ where: { id }, include: includeAttendance })
  res.json(mapSiege(siege as SiegeWithAttendance))
})
