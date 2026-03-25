import { z } from 'zod'

export const SiegeEventSchema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalSlots: z.number().int().positive(),
  attendees: z.array(z.string().uuid()),
  absentees: z.array(z.string().uuid()),
  notes: z.string().optional(),
})

export const CreateSiegeSchema = SiegeEventSchema.omit({ id: true })

export type SiegeEvent = z.infer<typeof SiegeEventSchema>
export type CreateSiege = z.infer<typeof CreateSiegeSchema>
