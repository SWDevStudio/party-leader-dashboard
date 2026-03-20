import { Role } from '@/types'

const ROLE_CLASS_MAP: Record<Role, string> = {
  [Role.DD]:      'badge-error',
  [Role.RDD]:     'badge-warning',
  [Role.Fish]:    'badge-info',
  [Role.Shaya]:   'badge-secondary',
  [Role.Kupol]:   'badge-success',
  [Role.MassCC]:  'badge-accent',
  [Role.HardRat]: 'badge-neutral',
  [Role.Support]: 'badge-primary',
  [Role.Tank]:    'badge-ghost',
  [Role.Trash]:   'badge-neutral',
  [Role.PartyLeader]: 'badge-primary',
}

export function roleBadgeClass(role: Role): string {
  return ROLE_CLASS_MAP[role] ?? 'badge-neutral'
}

