import { useApi } from '@/composables/useApi'
import type { Player, Role } from '@/types'

type PlayerInput = {
  gameSurname: string
  discordNick: string
  classId: string
  roles?: Role[]
  joinedAt: string
}

export function usePlayersService() {
  const api = useApi()

  return {
    async getAll(): Promise<Player[]> {
      const res = await api.get<Player[]>('/api/players')
      return res.data
    },

    async create(data: PlayerInput): Promise<Player> {
      const res = await api.post<Player>('/api/players', data)
      return res.data
    },

    async update(id: string, data: Partial<PlayerInput>): Promise<Player> {
      const res = await api.put<Player>(`/api/players/${id}`, data)
      return res.data
    },

    async remove(id: string): Promise<void> {
      await api.delete(`/api/players/${id}`)
    },
  }
}
