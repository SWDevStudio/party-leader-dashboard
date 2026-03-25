import { useApi } from '@/composables/useApi'
import type { Raid } from '@/types'

type RaidInput = {
  name: string
  playerIds: string[]
}

export function useRaidsService() {
  const api = useApi()

  return {
    async getAll(): Promise<Raid[]> {
      const res = await api.get<Raid[]>('/api/raids')
      return res.data
    },

    async create(data: RaidInput): Promise<Raid> {
      const res = await api.post<Raid>('/api/raids', data)
      return res.data
    },

    async update(id: string, data: Partial<RaidInput>): Promise<Raid> {
      const res = await api.put<Raid>(`/api/raids/${id}`, data)
      return res.data
    },

    async remove(id: string): Promise<void> {
      await api.delete(`/api/raids/${id}`)
    },
  }
}
