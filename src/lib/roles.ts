export type Role = 'Admin' | 'Manager' | 'Viewer';

export const ROLES = ['Admin', 'Manager', 'Viewer'] as const;

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export function canEditPartner(role: Role): boolean {
  return role !== 'Viewer';
}


