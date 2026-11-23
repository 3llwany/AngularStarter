import { Role } from '../theme/role';

/** Roles that sign in through the login screen (admin has no public login yet). */
export type LoginRole = Exclude<Role, 'admin'>;

/** `unknown` = not checked yet, `anonymous` = signed out, `authenticated` = signed in. */
export type AuthStatus = 'unknown' | 'anonymous' | 'authenticated';

export interface AuthUser {
  readonly id: string;
  readonly role: Role;
  readonly displayName: string;
  readonly identifier: string;
  readonly avatarUrl?: string;
}

/** What the user types in the login form. */
export interface LoginForm {
  readonly identifier: string;
  readonly password: string;
}

/** What is sent to the backend. */
export interface LoginRequest {
  readonly role: LoginRole;
  readonly identifier: string;
  readonly identifierType: string;
  readonly password: string;
}

/** Home page of each role, e.g. `student` -> `/student`. */
export function roleHomePath(role: Role): string {
  return `/${role}`;
}
