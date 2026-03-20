import type { Player, RosterConfig, SiegeEvent } from '@/types'

export interface PlayerStats {
  player: Player
  /** Total siege events since the player joined. */
  totalSieges: number
  /** How many of those sieges the player attended. */
  attended: number
  /** attended / totalSieges, or 0 if no sieges yet. */
  attendanceRate: number
  /** How many consecutive recent sieges the player was NOT in. Higher = higher priority. */
  consecutiveMisses: number
  /** ISO date of the last siege the player attended, or null if never. */
  lastAttendedDate: string | null
}

/** Compute attendance stats for a single player. */
export function computeStats(player: Player, allSieges: SiegeEvent[]): PlayerStats {
  const joinedDate = player.createdAt.split('T')[0]

  const allRelevant = allSieges
    .filter(s => s.date >= joinedDate)
    .sort((a, b) => a.date.localeCompare(b.date))

  // Sieges where player was absent on their own accord are fully excluded
  // from stats — as if that siege didn't exist for this player.
  const relevant = allRelevant.filter(s => !(s.absentees ?? []).includes(player.id))

  let attended = 0
  let lastAttendedDate: string | null = null

  for (const s of relevant) {
    if (s.attendees.includes(player.id)) {
      attended++
      if (!lastAttendedDate || s.date > lastAttendedDate) {
        lastAttendedDate = s.date
      }
    }
  }

  // Count consecutive rotation-misses from most-recent relevant siege backwards
  const reversed = [...relevant].reverse()
  let consecutiveMisses = 0
  for (const s of reversed) {
    if (s.attendees.includes(player.id)) break
    consecutiveMisses++
  }

  return {
    player,
    totalSieges: relevant.length,
    attended,
    attendanceRate: relevant.length > 0 ? attended / relevant.length : 0,
    consecutiveMisses,
    lastAttendedDate,
  }
}

export function computeAllStats(players: Player[], sieges: SiegeEvent[]): PlayerStats[] {
  return players.map(p => computeStats(p, sieges))
}

/**
 * Sort players by siege priority — highest priority (should go) first.
 * Criteria (descending priority):
 *   1. Most consecutive misses
 *   2. Lowest overall attendance rate
 *   3. Oldest last-attended date (never attended = top)
 */
export function sortByPriority(stats: PlayerStats[]): PlayerStats[] {
  return [...stats].sort((a, b) => {
    if (b.consecutiveMisses !== a.consecutiveMisses) {
      return b.consecutiveMisses - a.consecutiveMisses
    }
    if (a.attendanceRate !== b.attendanceRate) {
      return a.attendanceRate - b.attendanceRate
    }
    if (!a.lastAttendedDate && !b.lastAttendedDate) return 0
    if (!a.lastAttendedDate) return -1
    if (!b.lastAttendedDate) return 1
    return new Date(a.lastAttendedDate).getTime() - new Date(b.lastAttendedDate).getTime()
  })
}

/**
 * Role-aware rotation:
 * 1. Sort all players by priority.
 * 2. Fill role slots from roster config — pick highest-priority player with that role.
 * 3. Fill remaining slots with highest-priority unassigned players regardless of role.
 *
 * Returns a Set of player IDs that should attend.
 */
export function buildRotation(
  stats: PlayerStats[],
  rosterConfig: RosterConfig,
  totalSlots: number,
  getPlayerRoles: (player: Player) => string[],
): Set<string> {
  const sorted = sortByPriority(stats)
  const assigned = new Set<string>()

  for (const [role, count] of Object.entries(rosterConfig) as [string, number][]) {
    if (count <= 0) continue
    let filled = 0
    for (const stat of sorted) {
      if (filled >= count) break
      if (assigned.has(stat.player.id)) continue
      if (getPlayerRoles(stat.player).includes(role)) {
        assigned.add(stat.player.id)
        filled++
      }
    }
  }

  if (assigned.size < totalSlots) {
    for (const stat of sorted) {
      if (assigned.size >= totalSlots) break
      if (!assigned.has(stat.player.id)) {
        assigned.add(stat.player.id)
      }
    }
  }

  return assigned
}
