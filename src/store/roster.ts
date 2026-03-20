import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { DEFAULT_ROSTER_CONFIG, type Role, type RosterConfig } from '@/types'

export const useRosterStore = defineStore('roster', () => {
  const config = useLocalStorage<RosterConfig>(
    'party-dashboard-roster-v1',
    () => ({ ...DEFAULT_ROSTER_CONFIG }),
  )

  function setRoleCount(role: Role, count: number) {
    config.value[role] = Math.max(0, count)
  }

  return { config, setRoleCount }
})
