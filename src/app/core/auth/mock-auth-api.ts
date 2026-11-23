import { Provider, Service } from '@angular/core';
import { createAppError } from '../errors/app-error';
import { AuthApi } from './auth-api';
import { AuthUser, LoginRequest } from './auth.models';

/** Every demo account uses this password. */
export const DEMO_PASSWORD = 'Password123!';

const DEMO_USERS: readonly AuthUser[] = [
  { id: 'usr-student-1', role: 'student', displayName: 'Sara Student', identifier: 'student@mozakrety.test' },
  { id: 'usr-parent-1', role: 'parent', displayName: 'Hassan Parent', identifier: '01012345678' },
  { id: 'usr-teacher-1', role: 'teacher', displayName: 'Nour Teacher', identifier: 'TCH-1001' },
  { id: 'usr-school-1', role: 'school', displayName: 'Al-Nile School', identifier: 'SCH-2026' },
  { id: 'usr-partner-1', role: 'partner', displayName: 'EduMall Partner', identifier: 'partner@mozakrety.test' },
];

/**
 * Fake backend kept in memory, used until the real API is ready.
 * Any identifier works as long as the password is `DEMO_PASSWORD`.
 */
@Service()
export class MockAuthApi extends AuthApi {
  /** Fake network delay in ms (handy in tests). */
  delayMs = 0;
  /** When set, every call fails with this error (handy in tests). */
  failWith: unknown = null;
  /** The user the fake server considers signed in. */
  currentUser: AuthUser | null = null;

  async login(request: LoginRequest): Promise<AuthUser> {
    await this.simulateNetwork();

    if (request.password !== DEMO_PASSWORD) {
      throw createAppError({ code: 'UNAUTHORIZED', status: 401, errorKey: 'auth.errors.invalid_credentials' });
    }

    this.currentUser = DEMO_USERS.find(
      (user) => user.role === request.role && user.identifier === request.identifier,
    ) ?? {
      id: `usr-${request.role}-demo`,
      role: request.role,
      displayName: request.identifier,
      identifier: request.identifier,
    };
    return this.currentUser;
  }

  async logout(): Promise<void> {
    await this.simulateNetwork();
    this.currentUser = null;
  }

  async me(): Promise<AuthUser | null> {
    await this.simulateNetwork();
    return this.currentUser;
  }

  private async simulateNetwork(): Promise<void> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
    if (this.failWith !== null) {
      throw this.failWith;
    }
  }
}

/** Use the fake backend (tests and local development). */
export function provideMockAuthApi(): Provider[] {
  return [MockAuthApi, { provide: AuthApi, useExisting: MockAuthApi }];
}
