import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Player, GameClass, Role } from '@/types'
import { DEFAULT_CLASSES } from '@/types'
import { usePlayersService } from '@/services/playersService'

export const usePlayersStore = defineStore('players', () => {
  const players = ref<Player[]>([])
  const classes = useLocalStorage<GameClass[]>('party-dashboard-classes-v1', () => [...DEFAULT_CLASSES])

  const service = usePlayersService()

  function getPlayerRoles(player: Player): Role[] {
    if (player.roles && player.roles.length > 0) return player.roles
    return classes.value.find(c => c.id === player.classId)?.roles ?? []
  }

  async function fetchPlayers(): Promise<void> {
    players.value = await service.getAll()
  }

  async function addPlayer(data: Omit<Player, 'id' | 'createdAt'>): Promise<Player> {
    const created = await service.create(data)
    players.value.push(created)
    return created
  }

  async function updatePlayer(id: string, data: Partial<Omit<Player, 'id' | 'createdAt'>>): Promise<void> {
    const updated = await service.update(id, data)
    const idx = players.value.findIndex(x => x.id === id)
    if (idx !== -1) players.value[idx] = updated
  }

  async function deletePlayer(id: string): Promise<void> {
    await service.remove(id)
    const idx = players.value.findIndex(x => x.id === id)
    if (idx !== -1) players.value.splice(idx, 1)
  }

  return { players, classes, getPlayerRoles, fetchPlayers, addPlayer, updatePlayer, deletePlayer }
})
