import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import type { Player, GameClass, Role } from '@/types'
import { DEFAULT_CLASSES } from '@/types'
import { MOCK_PLAYERS } from '@/mock/players'

const STORAGE_KEY_PLAYERS = 'party-dashboard-players-v1'
const STORAGE_KEY_CLASSES = 'party-dashboard-classes-v1'

export const usePlayersStore = defineStore('players', () => {
  const players = useLocalStorage<Player[]>(STORAGE_KEY_PLAYERS, () =>
    MOCK_PLAYERS.map(p => ({
      ...p,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }))
  )

  const classes = useLocalStorage<GameClass[]>(STORAGE_KEY_CLASSES, () => [...DEFAULT_CLASSES])

  function getPlayerRoles(player: Player): Role[] {
    if (player.roles && player.roles.length > 0) return player.roles
    return classes.value.find(c => c.id === player.classId)?.roles ?? []
  }

  function addPlayer(data: Omit<Player, 'id' | 'createdAt'>): void {
    players.value.push({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
  }

  function updatePlayer(id: string, data: Partial<Omit<Player, 'id' | 'createdAt'>>): void {
    const p = players.value.find(x => x.id === id)
    if (p) Object.assign(p, data)
  }

  function deletePlayer(id: string): void {
    const idx = players.value.findIndex(x => x.id === id)
    if (idx !== -1) players.value.splice(idx, 1)
  }

  return { players, classes, getPlayerRoles, addPlayer, updatePlayer, deletePlayer }
})
