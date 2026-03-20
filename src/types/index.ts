export const Role = {
  DD:      'ДД',
  RDD:     'РДД',
  Support: 'Поддержка',
  Tank:   'Танк',
  Fish:    'Рыба',
  Shaya:   'Шая',
  Kupol:   'Купол',
  MassCC:  'Массовый контроль',
  HardRat: 'Жесткая крыса',
  Trash: 'Альтернативно полезный'
} as const

export type Role = typeof Role[keyof typeof Role]

export const ALL_ROLES: Role[] = Object.values(Role)

export interface GameClass {
  id: string
  name: string
  roles: Role[]
}

export interface Player {
  id: string
  gameSurname: string
  discordNick: string
  classId: string
  createdAt: string // ISO datetime
}

/**
 * Siege event.
 * `attendees`  — пришли на осаду.
 * `absentees`  — пропустили сами (не взяли по ротации не считается, в ротации игнорируются).
 * Все остальные игроки считаются «не взяли» (ротационный пропуск).
 */
export interface SiegeEvent {
  id: string
  date: string // YYYY-MM-DD
  totalSlots: number
  attendees: string[]
  absentees: string[]  // пропустили сами — не влияют на ротацию
  notes?: string
}

export type AppView = 'players' | 'sieges' | 'rotation'

// ─── Default BDO class roster ───────────────────────────────────────────────
export const DEFAULT_CLASSES: GameClass[] = [
  { id: 'barbarian-trad',    name: 'Варвар трады',          roles: [Role.MassCC] },
  { id: 'barbarian-awak',    name: 'Варвар пробуда',        roles: [Role.RDD] },
  { id: 'wizard-trad',       name: 'Волшебник трады',       roles: [Role.RDD, Role.Kupol] },
  { id: 'wizard-awak',       name: 'Волшебник пробуда',     roles: [Role.DD, Role.Kupol] },
  { id: 'witch-awak',        name: 'Волшебница пробуда',    roles: [Role.DD, Role.Kupol] },
  { id: 'witch-trad',        name: 'Волшебница трады',      roles: [Role.RDD, Role.Kupol] },
  { id: 'fury-trad',         name: 'Фурия трады',           roles: [Role.Trash] },
  { id: 'fury-awak',         name: 'Фурия пробуда',         roles: [Role.Tank] },
  { id: 'valkyrie-awak',     name: 'Валькирия пробуда',     roles: [Role.Support, Role.Tank] },
  { id: 'valkyrie-trad',     name: 'Валькирия трады',       roles: [Role.Trash] },
  { id: 'scholariya',        name: 'Школярия',              roles: [Role.HardRat] },
  { id: 'seraph',            name: 'Сераф',                 roles: [Role.HardRat] },
  { id: 'warrior-trad',      name: 'Воин трады',            roles: [Role.HardRat] },
  { id: 'warrior-awak',      name: 'Воин пробуда',          roles: [Role.HardRat] },
  { id: 'hash-trad',         name: 'Хаш трады',             roles: [] },
  { id: 'hash-awak',         name: 'Хаш пробуда',           roles: [] },
  { id: 'sage-awak',         name: 'Мудрец пробуда',        roles: [] },
  { id: 'sage-trad',         name: 'Мудрец трады',          roles: [] },
  { id: 'vukong',            name: 'Вуконг',                roles: [Role.Trash] },
  { id: 'archerF-trad',      name: 'Лучница трады',         roles: [Role.RDD] },
  { id: 'archerF-awak',      name: 'Лучница пробуда',       roles: [] },
  { id: 'guardian-trad',     name: 'Страж трады',           roles: [Role.DD] },
  { id: 'guardian-awak',     name: 'Страж пробуда',         roles: [Role.DD] },  
  { id: 'drakania-trad',     name: 'Дракания трады',        roles: [Role.DD] },
  { id: 'drakania-awak',     name: 'Дракания пробуда',      roles: [Role.DD] },
  { id: 'sorceress-awak',    name: 'Колдунья пробуда',      roles: [Role.HardRat] },
  { id: 'sorceress-trad',    name: 'Колдунья трады',        roles: [Role.HardRat] },
  { id: 'nova-trad',         name: 'Нова трады',            roles: [Role.Tank] },
  { id: 'nova-awak',         name: 'Нова пробуда',          roles: [Role.Trash] },
  { id: 'corsair-trad',      name: 'Корсар трады',          roles: [Role.Fish, Role.Support] },
  { id: 'corsair-awak',      name: 'Корсар пробуда',        roles: [Role.Fish, Role.RDD] },
  { id: 'lahn-trad',         name: 'Лан трады',             roles: [Role.Support] },
  { id: 'lahn-awak',         name: 'Лан пробуда',           roles: [Role.Support] },
  { id: 'maegu-trad',        name: 'Мегу трады',            roles: [Role.HardRat] },
  { id: 'maegu-awak',        name: 'Мегу пробуда',          roles: [Role.RDD] },
  { id: 'mystic-trad',       name: 'Мистик трады',          roles: [Role.Trash] },
  { id: 'mystic-awak',       name: 'Мистик пробуда',        roles: [Role.Trash] },
  { id: 'shai',              name: 'Шая',                   roles: [Role.Shaya] },
  { id: 'striker-trad',      name: 'Страйкер трады',        roles: [Role.Trash] },
  { id: 'striker-awak',      name: 'Страйкер пробуда',      roles: [Role.Tank] }, //
  { id: 'swordmaster-trad',  name: 'Мастер меча трады',     roles: [Role.Trash] },
  { id: 'swordmaster-awak',  name: 'Мастер меча пробуда',   roles: [Role.HardRat] },
  { id: 'maewa-trad',        name: 'Маэва трады',           roles: [Role.HardRat] },
  { id: 'maewa-awak',        name: 'Маэва пробуда',         roles: [Role.Trash] },
  { id: 'kunoichi-trad',     name: 'Куноичи трады',         roles: [] },
  { id: 'kunoichi-awak',     name: 'Куноичи пробуда',       roles: [] },
  { id: 'ninja-trad',        name: 'Ниндзя трады',          roles: [] },
  { id: 'ninja-awak',        name: 'Ниндзя пробуда',        roles: [] },
  { id: 'darknight-trad',    name: 'Темный рыцарь трады',   roles: [] },
  { id: 'darknight-awak',    name: 'Темный рыцарь пробуда', roles: [] },
  { id: 'archerM',           name: 'Лучник',                roles: [] },
  { id: 'woosa-trad',        name: 'Уса трады',             roles: [] },
  { id: 'woosa-awak',        name: 'Уса пробуда',           roles: [] },
  { id: 'tosa-trad',         name: 'Тоса трады',            roles: [] },
  { id: 'tosa-awak',         name: 'Тоса пробуда',          roles: [] },
  { id: 'deadeye',           name: 'Мертвый глаз',          roles: [Role.RDD] },
]
