export const ROLES = ['student', 'parent', 'teacher', 'school', 'partner', 'admin'] as const;

export type Role = (typeof ROLES)[number];

export const DEFAULT_ROLE: Role = 'student';

export const ROLE_COOKIE_NAME = 'moz_role';

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
