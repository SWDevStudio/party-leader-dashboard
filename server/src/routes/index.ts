import { Router } from 'express'
import { authRouter } from './auth.js'
import { playersRouter } from './players.js'
import { siegesRouter } from './sieges.js'
import { rosterRouter } from './roster.js'

export const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

router.use('/auth', authRouter)
router.use('/players', playersRouter)
router.use('/sieges', siegesRouter)
router.use('/roster', rosterRouter)
