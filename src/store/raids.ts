import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Raid } from '@/types'
import { useRaidsService } from '@/services/raidsService'

export const useRaidsStore = defineStore('raids', () => {
  const raids = ref<Raid[]>([])
  const service = useRaidsService()

  async function fetchRaids(): Promise<void> {
    raids.value = await service.getAll()
  }

  async function addRaid(data: { name: string; playerIds: string[] }): Promise<void> {
    const created = await service.create(data)
    raids.value.push(created)
  }

  async function updateRaid(id: string, data: Partial<{ name: string; playerIds: string[] }>): Promise<void> {
    const updated = await service.update(id, data)
    const idx = raids.value.findIndex(r => r.id === id)
    if (idx !== -1) raids.value[idx] = updated
  }

  async function deleteRaid(id: string): Promise<void> {
    await service.remove(id)
    const idx = raids.value.findIndex(r => r.id === id)
    if (idx !== -1) raids.value.splice(idx, 1)
  }

  function removePlayerFromAll(playerId: string): void {
    for (const r of raids.value) {
      r.playerIds = r.playerIds.filter(id => id !== playerId)
    }
  }

  function getPlayerRaids(playerId: string): Raid[] {
    return raids.value.filter(r => r.playerIds.includes(playerId))
  }

  return { raids, fetchRaids, addRaid, updateRaid, deleteRaid, removePlayerFromAll, getPlayerRaids }
})
