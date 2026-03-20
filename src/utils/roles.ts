import { Role } from '@/types'

const ROLE_CLASS_MAP: Record<Role, string> = {
  [Role.DD]:      'badge-error',
  [Role.RDD]:     'badge-warning',
  [Role.Ryba]:    'badge-info',
  [Role.Shaya]:   'badge-secondary',
  [Role.Kupol]:   'badge-success',
  [Role.MassCC]:  'badge-accent',
  [Role.HardRat]: 'badge-neutral',
}

export function roleBadgeClass(role: Role): string {
  return ROLE_CLASS_MAP[role] ?? 'badge-neutral'
}

