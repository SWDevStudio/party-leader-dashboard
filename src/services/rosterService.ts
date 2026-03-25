import { useApi } from '@/composables/useApi'
import type { RosterConfig } from '@/types'

export function useRosterService() {
  const api = useApi()

  return {
    async get(): Promise<RosterConfig> {
      const res = await api.get<RosterConfig>('/api/roster')
      return res.data
    },

    async save(config: RosterConfig): Promise<void> {
      await api.put('/api/roster', config)
    },
  }
}
