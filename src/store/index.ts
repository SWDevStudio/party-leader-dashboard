import { reactive, watchEffect } from 'vue'
import type { Player, SiegeEvent, GameClass } from '@/types'
import { DEFAULT_CLASSES } from '@/types'

interface AppData {
  players: Player[]
  siegeEvents: SiegeEvent[]
  classes: GameClass[]
}

const STORAGE_KEY = 'party-dashboard-v1'

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as Partial<AppData>
      return {
        players: data.players ?? [],
        siegeEvents: (data.siegeEvents ?? []).map(s => ({
        ...s,
        absentees: (s as any).absentees ?? [],
      })),
        classes: data.classes?.length ? data.classes : [...DEFAULT_CLASSES],
      }
    }
  } catch {
    // ignore corrupt data
  }
  return { players: [], siegeEvents: [], classes: [...DEFAULT_CLASSES] }
}

export const store = reactive<AppData>(load())

watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
})

// ─── Player actions ──────────────────────────────────────────────────────────

export function addPlayer(data: Omit<Player, 'id' | 'createdAt'>): void {
  store.players.push({
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })
}

export function updatePlayer(id: string, data: Partial<Omit<Player, 'id' | 'createdAt'>>): void {
  const p = store.players.find(x => x.id === id)
  if (p) Object.assign(p, data)
}

export function deletePlayer(id: string): void {
  const idx = store.players.findIndex(x => x.id === id)
  if (idx !== -1) store.players.splice(idx, 1)
  // Remove from all siege attendance records
  store.siegeEvents.forEach(s => {
    s.attendees = s.attendees.filter(pid => pid !== id)
    s.absentees = s.absentees.filter(pid => pid !== id)
  })
}

// ─── Siege actions ───────────────────────────────────────────────────────────

export function addSiege(data: Omit<SiegeEvent, 'id' | 'attendees' | 'absentees'>): SiegeEvent {
  const siege: SiegeEvent = { ...data, id: crypto.randomUUID(), attendees: [], absentees: [] }
  store.siegeEvents.push(siege)
  return siege
}

export function updateSiege(id: string, data: Partial<Omit<SiegeEvent, 'id'>>): void {
  const s = store.siegeEvents.find(x => x.id === id)
  if (s) Object.assign(s, data)
}

export function deleteSiege(id: string): void {
  const idx = store.siegeEvents.findIndex(x => x.id === id)
  if (idx !== -1) store.siegeEvents.splice(idx, 1)
}

export function setSiegeAttendance(siegeId: string, attendees: string[], absentees: string[]): void {
  const s = store.siegeEvents.find(x => x.id === siegeId)
  if (s) {
    s.attendees = [...attendees]
    s.absentees = [...absentees]
  }
}
