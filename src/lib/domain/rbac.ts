import type { Role } from './types'
export const permissions = { super_admin:['*'], admin:['dashboard','franchises','orders','unassigned_orders','reports','logs','payouts:read'], franchise_owner:['dashboard','students','orders','reports','wallet','payouts','operators'], operator:['dashboard','students','orders','reports'] } as const
export function can(role:Role, permission:string) { const granted=permissions[role] as readonly string[]; return granted.includes('*') || granted.includes(permission) }
export function visibleMoney(role:Role) { return role==='super_admin'||role==='admin'||role==='franchise_owner' }
