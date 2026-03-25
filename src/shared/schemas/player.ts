import { z } from 'zod'

export const RoleSchema = z.enum([
  'Пати лидер',
  'ДД',
  'РДД',
  'Поддержка',
  'Танк',
  'Рыба',
  'Шая',
  'Купол',
  'Массовый контроль',
  'Жесткая крыса',
  'Альтернативно полезный',
])

export type Role = z.infer<typeof RoleSchema>

export const PlayerSchema = z.object({
  id: z.string().uuid(),
  gameSurname: z.string().min(1),
  discordNick: z.string().min(1),
  classId: z.string().min(1),
  roles: z.array(RoleSchema).optional(),
  joinedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string(),
})

export const CreatePlayerSchema = PlayerSchema.omit({ id: true, createdAt: true })

export type Player = z.infer<typeof PlayerSchema>
export type CreatePlayer = z.infer<typeof CreatePlayerSchema>
