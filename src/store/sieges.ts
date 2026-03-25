import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SiegeEvent } from '@/types'
import { useSiegesService } from '@/services/siegesService'

export const useSiegesStore = defineStore('sieges', () => {
  const siegeEvents = ref<SiegeEvent[]>([])

  const service = useSiegesService()

  async function fetchSieges(): Promise<void> {
    siegeEvents.value = await service.getAll()
  }

  async function addSiege(data: Omit<SiegeEvent, 'id' | 'attendees' | 'absentees'>): Promise<SiegeEvent> {
    const created = await service.create(data)
    siegeEvents.value.push(created)
    return created
  }

  async function updateSiege(id: string, data: Partial<Omit<SiegeEvent, 'id'>>): Promise<void> {
    const updated = await service.update(id, data)
    const idx = siegeEvents.value.findIndex(x => x.id === id)
    if (idx !== -1) siegeEvents.value[idx] = updated
  }

  async function deleteSiege(id: string): Promise<void> {
    await service.remove(id)
    const idx = siegeEvents.value.findIndex(x => x.id === id)
    if (idx !== -1) siegeEvents.value.splice(idx, 1)
  }

  async function setSiegeAttendance(siegeId: string, attendees: string[], absentees: string[]): Promise<void> {
    const updated = await service.updateAttendance(siegeId, attendees, absentees)
    const idx = siegeEvents.value.findIndex(x => x.id === siegeId)
    if (idx !== -1) siegeEvents.value[idx] = updated
  }

  function removePlayerFromAll(playerId: string): void {
    for (const s of siegeEvents.value) {
      s.attendees = s.attendees.filter(id => id !== playerId)
      s.absentees = s.absentees.filter(id => id !== playerId)
    }
  }

  return { siegeEvents, fetchSieges, addSiege, updateSiege, deleteSiege, setSiegeAttendance, removePlayerFromAll }
})
