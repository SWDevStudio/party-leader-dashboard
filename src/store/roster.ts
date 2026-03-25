import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_ROSTER_CONFIG, type Role, type RosterConfig } from '@/types'
import { useRosterService } from '@/services/rosterService'

export const useRosterStore = defineStore('roster', () => {
  const config = ref<RosterConfig>({ ...DEFAULT_ROSTER_CONFIG })

  const service = useRosterService()

  async function fetchRoster(): Promise<void> {
    config.value = await service.get()
  }

  function setRoleCount(role: Role, count: number): void {
    config.value[role] = Math.max(0, count)
    service.save({ ...config.value }).catch(console.error)
  }

  return { config, fetchRoster, setRoleCount }
})
