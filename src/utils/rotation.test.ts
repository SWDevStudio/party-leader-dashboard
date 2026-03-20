import { describe, it, expect } from 'vitest'
import { computeStats, sortByPriority, buildRotation } from './rotation'
import type { Player, SiegeEvent, RosterConfig } from '@/types'
import { Role } from '@/types'

// ─── Фабрики ─────────────────────────────────────────────────────────────────

function makePlayer(overrides: Partial<Player> & { id: string }): Player {
  return {
    gameSurname: 'Player',
    discordNick: 'player#0000',
    classId: 'warrior-awak',
    joinedAt: '2024-01-01',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeSiege(overrides: Partial<SiegeEvent> & { id: string; date: string }): SiegeEvent {
  return {
    totalSlots: 20,
    attendees: [],
    absentees: [],
    ...overrides,
  }
}

function makeRosterConfig(partial: Partial<RosterConfig> = {}): RosterConfig {
  const empty = Object.fromEntries(
    Object.values(Role).map(r => [r, 0])
  ) as RosterConfig
  return { ...empty, ...partial }
}

// ─── computeStats ─────────────────────────────────────────────────────────────

describe('computeStats', () => {
  it('нет осад → totalSieges = 0', () => {
    const player = makePlayer({ id: 'p1' })
    const result = computeStats(player, [])
    expect(result.totalSieges).toBe(0)
  })

  it('нет осад → attended = 0', () => {
    const player = makePlayer({ id: 'p1' })
    const result = computeStats(player, [])
    expect(result.attended).toBe(0)
  })

  it('нет осад → attendanceRate = 0', () => {
    const player = makePlayer({ id: 'p1' })
    const result = computeStats(player, [])
    expect(result.attendanceRate).toBe(0)
  })

  it('нет осад → consecutiveMisses = 0', () => {
    const player = makePlayer({ id: 'p1' })
    const result = computeStats(player, [])
    expect(result.consecutiveMisses).toBe(0)
  })

  it('нет осад → lastAttendedDate = null', () => {
    const player = makePlayer({ id: 'p1' })
    const result = computeStats(player, [])
    expect(result.lastAttendedDate).toBeNull()
  })

  it('посетил все 3 осады → attendanceRate = 1', () => {
    const player = makePlayer({ id: 'p1' })
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: ['p1'] }),
      makeSiege({ id: 's2', date: '2024-02-08', attendees: ['p1'] }),
      makeSiege({ id: 's3', date: '2024-02-15', attendees: ['p1'] }),
    ]
    const result = computeStats(player, sieges)
    expect(result.attendanceRate).toBe(1)
  })

  it('посетил все 3 осады → consecutiveMisses = 0', () => {
    const player = makePlayer({ id: 'p1' })
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: ['p1'] }),
      makeSiege({ id: 's2', date: '2024-02-08', attendees: ['p1'] }),
      makeSiege({ id: 's3', date: '2024-02-15', attendees: ['p1'] }),
    ]
    const result = computeStats(player, sieges)
    expect(result.consecutiveMisses).toBe(0)
  })

  it('посетил все 3 осады → lastAttendedDate = дата последней', () => {
    const player = makePlayer({ id: 'p1' })
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: ['p1'] }),
      makeSiege({ id: 's2', date: '2024-02-08', attendees: ['p1'] }),
      makeSiege({ id: 's3', date: '2024-02-15', attendees: ['p1'] }),
    ]
    const result = computeStats(player, sieges)
    expect(result.lastAttendedDate).toBe('2024-02-15')
  })

  it('посетил 1 из 2 осад → attendanceRate = 0.5', () => {
    const player = makePlayer({ id: 'p1' })
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: ['p1'] }),
      makeSiege({ id: 's2', date: '2024-02-08', attendees: [] }),
    ]
    const result = computeStats(player, sieges)
    expect(result.attendanceRate).toBe(0.5)
  })

  it('2 последние осады пропущены → consecutiveMisses = 2', () => {
    const player = makePlayer({ id: 'p1' })
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: ['p1'] }),
      makeSiege({ id: 's2', date: '2024-02-08', attendees: [] }),
      makeSiege({ id: 's3', date: '2024-02-15', attendees: [] }),
    ]
    const result = computeStats(player, sieges)
    expect(result.consecutiveMisses).toBe(2)
  })

  it('последняя осада посещена → consecutiveMisses = 0', () => {
    const player = makePlayer({ id: 'p1' })
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: [] }),
      makeSiege({ id: 's2', date: '2024-02-08', attendees: [] }),
      makeSiege({ id: 's3', date: '2024-02-15', attendees: ['p1'] }),
    ]
    const result = computeStats(player, sieges)
    expect(result.consecutiveMisses).toBe(0)
  })

  it('осада до вступления игрока не учитывается в totalSieges', () => {
    const player = makePlayer({ id: 'p1', createdAt: '2024-03-01T00:00:00.000Z' })
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: [] }),
      makeSiege({ id: 's2', date: '2024-03-08', attendees: [] }),
    ]
    const result = computeStats(player, sieges)
    expect(result.totalSieges).toBe(1)
  })

  it('самовольный пропуск исключается из totalSieges', () => {
    const player = makePlayer({ id: 'p1' })
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: [] }),
      makeSiege({ id: 's2', date: '2024-02-08', attendees: [], absentees: ['p1'] }),
    ]
    const result = computeStats(player, sieges)
    expect(result.totalSieges).toBe(1)
  })

  it('самовольный пропуск не влияет на consecutiveMisses', () => {
    const player = makePlayer({ id: 'p1' })
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: ['p1'] }),
      makeSiege({ id: 's2', date: '2024-02-08', attendees: [], absentees: ['p1'] }),
    ]
    const result = computeStats(player, sieges)
    expect(result.consecutiveMisses).toBe(0)
  })
})

// ─── sortByPriority ───────────────────────────────────────────────────────────

describe('sortByPriority', () => {
  it('больше consecutiveMisses → выше в списке', () => {
    const p1 = makePlayer({ id: 'p1' })
    const p2 = makePlayer({ id: 'p2' })
    const stats = [
      { ...computeStats(p1, []), consecutiveMisses: 1 },
      { ...computeStats(p2, []), consecutiveMisses: 3 },
    ]
    const result = sortByPriority(stats)
    expect(result[0].player.id).toBe('p2')
  })

  it('при равных consecutiveMisses → ниже attendanceRate выше в списке', () => {
    const p1 = makePlayer({ id: 'p1' })
    const p2 = makePlayer({ id: 'p2' })
    const stats = [
      { ...computeStats(p1, []), consecutiveMisses: 1, attendanceRate: 0.8 },
      { ...computeStats(p2, []), consecutiveMisses: 1, attendanceRate: 0.3 },
    ]
    const result = sortByPriority(stats)
    expect(result[0].player.id).toBe('p2')
  })

  it('никогда не посещавший выше посещавшего при равном attendanceRate', () => {
    const p1 = makePlayer({ id: 'p1' })
    const p2 = makePlayer({ id: 'p2' })
    const stats = [
      { ...computeStats(p1, []), consecutiveMisses: 0, attendanceRate: 0, lastAttendedDate: '2024-01-01' },
      { ...computeStats(p2, []), consecutiveMisses: 0, attendanceRate: 0, lastAttendedDate: null },
    ]
    const result = sortByPriority(stats)
    expect(result[0].player.id).toBe('p2')
  })

  it('при равных consecutiveMisses и attendanceRate → старее lastAttendedDate выше', () => {
    const p1 = makePlayer({ id: 'p1' })
    const p2 = makePlayer({ id: 'p2' })
    const stats = [
      { ...computeStats(p1, []), consecutiveMisses: 0, attendanceRate: 0.5, lastAttendedDate: '2024-03-01' },
      { ...computeStats(p2, []), consecutiveMisses: 0, attendanceRate: 0.5, lastAttendedDate: '2024-01-01' },
    ]
    const result = sortByPriority(stats)
    expect(result[0].player.id).toBe('p2')
  })
})

// ─── buildRotation ────────────────────────────────────────────────────────────

describe('buildRotation', () => {
  it('игрок с нужной ролью попадает в состав', () => {
    const tank = makePlayer({ id: 'tank', createdAt: '2024-01-01T00:00:00.000Z' })
    const dd   = makePlayer({ id: 'dd',   createdAt: '2024-01-01T00:00:00.000Z' })
    const stats = computeAllStatsLocal([tank, dd], [])
    const config = makeRosterConfig({ [Role.Tank]: 1 })

    const result = buildRotation(stats, config, 1, (p) =>
      p.id === 'tank' ? [Role.Tank] : [Role.DD]
    )

    expect(result.has('tank')).toBe(true)
  })

  it('игрок без нужной роли не попадает по ролевому слоту', () => {
    const dd = makePlayer({ id: 'dd', createdAt: '2024-01-01T00:00:00.000Z' })
    const stats = computeAllStatsLocal([dd], [])
    const config = makeRosterConfig({ [Role.Tank]: 1 })

    const result = buildRotation(stats, config, 0, (p) =>
      p.id === 'dd' ? [Role.DD] : []
    )

    expect(result.has('dd')).toBe(false)
  })

  it('игрок назначается только один раз при нескольких совпадающих ролях', () => {
    const player = makePlayer({ id: 'p1', createdAt: '2024-01-01T00:00:00.000Z' })
    const stats = computeAllStatsLocal([player], [])
    const config = makeRosterConfig({ [Role.Tank]: 1, [Role.DD]: 1 })

    const result = buildRotation(stats, config, 2, () => [Role.Tank, Role.DD])

    expect(result.size).toBe(1)
  })

  it('не превышает totalSlots', () => {
    const players = Array.from({ length: 10 }, (_, i) =>
      makePlayer({ id: `p${i}`, createdAt: '2024-01-01T00:00:00.000Z' })
    )
    const stats = computeAllStatsLocal(players, [])
    const config = makeRosterConfig({ [Role.DD]: 10 })

    const result = buildRotation(stats, config, 5, () => [Role.DD])

    expect(result.size).toBeLessThanOrEqual(5)
  })

  it('если ролевых игроков не хватает → добирает из общего пула', () => {
    const tank = makePlayer({ id: 'tank', createdAt: '2024-01-01T00:00:00.000Z' })
    const dd   = makePlayer({ id: 'dd',   createdAt: '2024-01-01T00:00:00.000Z' })
    const stats = computeAllStatsLocal([tank, dd], [])
    const config = makeRosterConfig({ [Role.Tank]: 1 })

    const result = buildRotation(stats, config, 2, (p) =>
      p.id === 'tank' ? [Role.Tank] : [Role.DD]
    )

    expect(result.has('dd')).toBe(true)
  })

  it('пустой ростер → заполняет по приоритету', () => {
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: ['p1'] }),
      makeSiege({ id: 's2', date: '2024-02-08', attendees: ['p1'] }),
    ]
    const p1 = makePlayer({ id: 'p1', createdAt: '2024-01-01T00:00:00.000Z' })
    const p2 = makePlayer({ id: 'p2', createdAt: '2024-01-01T00:00:00.000Z' })
    const stats = computeAllStatsLocal([p1, p2], sieges)
    const config = makeRosterConfig()

    const result = buildRotation(stats, config, 1, () => [])

    expect(result.has('p2')).toBe(true)
  })

  it('игроков меньше чем totalSlots → берёт всех', () => {
    const players = [
      makePlayer({ id: 'p1', createdAt: '2024-01-01T00:00:00.000Z' }),
      makePlayer({ id: 'p2', createdAt: '2024-01-01T00:00:00.000Z' }),
    ]
    const stats = computeAllStatsLocal(players, [])
    const config = makeRosterConfig({ [Role.DD]: 10 })

    const result = buildRotation(stats, config, 10, () => [Role.DD])

    expect(result.size).toBe(2)
  })

  it('из двух DD берёт того у кого больше пропусков', () => {
    const sieges = [
      makeSiege({ id: 's1', date: '2024-02-01', attendees: ['p1'] }),
      makeSiege({ id: 's2', date: '2024-02-08', attendees: ['p1'] }),
    ]
    const p1 = makePlayer({ id: 'p1', createdAt: '2024-01-01T00:00:00.000Z' })
    const p2 = makePlayer({ id: 'p2', createdAt: '2024-01-01T00:00:00.000Z' })
    const stats = computeAllStatsLocal([p1, p2], sieges)
    const config = makeRosterConfig({ [Role.DD]: 1 })

    const result = buildRotation(stats, config, 1, () => [Role.DD])

    expect(result.has('p2')).toBe(true)
  })

  it('игрок с двумя ролями закрывает слот по нужной роли', () => {
    const player = makePlayer({ id: 'p1', createdAt: '2024-01-01T00:00:00.000Z' })
    const stats = computeAllStatsLocal([player], [])
    const config = makeRosterConfig({ [Role.Kupol]: 1 })

    const result = buildRotation(stats, config, 1, () => [Role.DD, Role.Kupol])

    expect(result.has('p1')).toBe(true)
  })

  it('игрок с двумя ролями не дублируется если подходит под оба слота', () => {
    const player = makePlayer({ id: 'p1', createdAt: '2024-01-01T00:00:00.000Z' })
    const stats = computeAllStatsLocal([player], [])
    const config = makeRosterConfig({ [Role.DD]: 1, [Role.Kupol]: 1 })

    const result = buildRotation(stats, config, 2, () => [Role.DD, Role.Kupol])

    expect(result.size).toBe(1)
  })

  it('единственный купольщик попадает на слот купола, а не ДД, даже если ДД-шников много', () => {
    const kupol    = makePlayer({ id: 'kupol', createdAt: '2024-01-01T00:00:00.000Z' })
    const dd1      = makePlayer({ id: 'dd1',   createdAt: '2024-01-01T00:00:00.000Z' })
    const dd2      = makePlayer({ id: 'dd2',   createdAt: '2024-01-01T00:00:00.000Z' })
    const dd3      = makePlayer({ id: 'dd3',   createdAt: '2024-01-01T00:00:00.000Z' })
    const stats = computeAllStatsLocal([kupol, dd1, dd2, dd3], [])
    const config = makeRosterConfig({ [Role.DD]: 3, [Role.Kupol]: 1 })

    const result = buildRotation(stats, config, 4, (p) =>
      p.id === 'kupol' ? [Role.Kupol, Role.DD] : [Role.DD]
    )

    expect(result.has('kupol')).toBe(true)
  })

  it('купольщик попадает в состав даже когда слотов меньше чем игроков и ДД-шников избыток', () => {
    const kupol = makePlayer({ id: 'kupol', createdAt: '2024-01-01T00:00:00.000Z' })
    const dd1   = makePlayer({ id: 'dd1',   createdAt: '2024-01-01T00:00:00.000Z' })
    const dd2   = makePlayer({ id: 'dd2',   createdAt: '2024-01-01T00:00:00.000Z' })
    const dd3   = makePlayer({ id: 'dd3',   createdAt: '2024-01-01T00:00:00.000Z' })
    const dd4   = makePlayer({ id: 'dd4',   createdAt: '2024-01-01T00:00:00.000Z' })
    const stats = computeAllStatsLocal([kupol, dd1, dd2, dd3, dd4], [])
    const config = makeRosterConfig({ [Role.DD]: 2, [Role.Kupol]: 1 })

    const result = buildRotation(stats, config, 3, (p) =>
      p.id === 'kupol' ? [Role.Kupol, Role.DD] : [Role.DD]
    )

    expect(result.has('kupol')).toBe(true)
  })
})

// ─── Вспомогательная функция (локальный аналог computeAllStats) ───────────────
function computeAllStatsLocal(players: Player[], sieges: SiegeEvent[]) {
  return players.map(p => computeStats(p, sieges))
}
