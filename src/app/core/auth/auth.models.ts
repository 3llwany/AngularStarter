/** `unknown` means the session is being restored. */
export type AuthStatus = 'unknown' | 'anonymous' | 'authenticated';

export interface AuthUser {
  readonly id: string;
  readonly displayName: string;
  readonly identifier: string;
  readonly avatarUrl?: string;
}

export interface LoginForm {
  readonly identifier: string;
  readonly password: string;
}

export type LoginRequest = LoginForm;
