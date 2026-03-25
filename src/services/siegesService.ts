import { useApi } from '@/composables/useApi'
import type { SiegeEvent } from '@/types'

type SiegeInput = {
  date: string
  totalSlots: number
  notes?: string
}

export function useSiegesService() {
  const api = useApi()

  return {
    async getAll(): Promise<SiegeEvent[]> {
      const res = await api.get<SiegeEvent[]>('/api/sieges')
      return res.data
    },

    async create(data: SiegeInput): Promise<SiegeEvent> {
      const res = await api.post<SiegeEvent>('/api/sieges', data)
      return res.data
    },

    async update(id: string, data: Partial<SiegeInput>): Promise<SiegeEvent> {
      const res = await api.put<SiegeEvent>(`/api/sieges/${id}`, data)
      return res.data
    },

    async remove(id: string): Promise<void> {
      await api.delete(`/api/sieges/${id}`)
    },

    async updateAttendance(siegeId: string, attendees: string[], absentees: string[]): Promise<SiegeEvent> {
      const res = await api.put<SiegeEvent>(`/api/sieges/${siegeId}/attendance`, { attendees, absentees })
      return res.data
    },
  }
}
