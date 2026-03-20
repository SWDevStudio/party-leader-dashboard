import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import type { SiegeEvent } from '@/types'

const STORAGE_KEY = 'party-dashboard-sieges-v1'

export const useSiegesStore = defineStore('sieges', () => {
  const siegeEvents = useLocalStorage<SiegeEvent[]>(STORAGE_KEY, [])

  function addSiege(data: Omit<SiegeEvent, 'id' | 'attendees' | 'absentees'>): SiegeEvent {
    const siege: SiegeEvent = { ...data, id: crypto.randomUUID(), attendees: [], absentees: [] }
    siegeEvents.value.push(siege)
    return siege
  }

  function updateSiege(id: string, data: Partial<Omit<SiegeEvent, 'id'>>): void {
    const s = siegeEvents.value.find(x => x.id === id)
    if (s) Object.assign(s, data)
  }

  function deleteSiege(id: string): void {
    const idx = siegeEvents.value.findIndex(x => x.id === id)
    if (idx !== -1) siegeEvents.value.splice(idx, 1)
  }

  function setSiegeAttendance(siegeId: string, attendees: string[], absentees: string[]): void {
    const s = siegeEvents.value.find(x => x.id === siegeId)
    if (s) {
      s.attendees = [...attendees]
      s.absentees = [...absentees]
    }
  }

  function removePlayerFromAll(playerId: string): void {
    for (const s of siegeEvents.value) {
      s.attendees = s.attendees.filter(id => id !== playerId)
      s.absentees = s.absentees.filter(id => id !== playerId)
    }
  }

  return { siegeEvents, addSiege, updateSiege, deleteSiege, setSiegeAttendance, removePlayerFromAll }
})
