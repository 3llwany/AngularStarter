import { computed, inject, Service, signal } from '@angular/core';
import { createAppError } from '../errors/app-error';
import { CookieService } from '../platform/cookie';
import { ThemeService } from '../theme/theme.service';
import { AuthApi } from './auth-api';
import { AuthStatus, AuthUser, LoginForm, LoginRole } from './auth.models';
import { buildLoginRequest, isValidIdentifier, LOGIN_METHODS } from './login-methods';

/**
 * Harmless cookie (`1` or missing) that only says "this browser was signed in before".
 * It holds no token; the real session lives in the backend's HttpOnly cookie.
 */
export const SESSION_HINT_COOKIE = 'moz_session_hint';

/**
 * Knows who the current user is. State lives in signals inside this instance only
 * (nothing in localStorage, nothing at module level), so SSR requests never share users.
 */
@Service()
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly cookies = inject(CookieService);
  private readonly theme = inject(ThemeService, { optional: true });

  private readonly currentUser = signal<AuthUser | null>(null);
  private readonly currentStatus = signal<AuthStatus>('unknown');
  private pendingRestore: Promise<AuthUser | null> | null = null;

  readonly user = this.currentUser.asReadonly();
  readonly status = this.currentStatus.asReadonly();
  readonly role = computed(() => this.currentUser()?.role ?? null);
  readonly isAuthenticated = computed(() => this.currentStatus() === 'authenticated');

  async login(role: LoginRole, form: LoginForm): Promise<AuthUser> {
    if (!isValidIdentifier(role, form.identifier)) {
      throw createAppError({
        code: 'AUTH_INVALID_IDENTIFIER',
        errorKey: LOGIN_METHODS[role].errorKey,
      });
    }

    const user = await this.api.login(buildLoginRequest(role, form));
    this.signIn(user);
    return user;
  }

  async logout(): Promise<void> {
    try {
      await this.api.logout();
    } finally {
      this.signOut();
    }
  }

  /** Asks the backend "who am I?". Concurrent calls share one request. */
  restoreSession(): Promise<AuthUser | null> {
    this.pendingRestore ??= this.api
      .me()
      .catch(() => null)
      .then((user) => {
        if (user) {
          this.signIn(user);
        } else {
          this.signOut();
        }
        return user;
      })
      .finally(() => (this.pendingRestore = null));
    return this.pendingRestore;
  }

  /** Used by guards: checks the session once if we still don't know. */
  async ensureSessionResolved(): Promise<AuthStatus> {
    if (this.currentStatus() === 'unknown') {
      await this.restoreSession();
    }
    return this.currentStatus();
  }

  /** Mark as signed out without calling the backend (e.g. on the server). */
  markAnonymous(): void {
    this.signOut();
  }

  /** Called when the backend answers 401 (session expired). */
  handleUnauthorized(): void {
    this.signOut();
  }

  private signIn(user: AuthUser): void {
    this.currentUser.set(user);
    this.currentStatus.set('authenticated');
    this.cookies.set(SESSION_HINT_COOKIE, '1', { path: '/', sameSite: 'Lax' });
    this.theme?.setRole(user.role);
  }

  private signOut(): void {
    this.currentUser.set(null);
    this.currentStatus.set('anonymous');
    this.cookies.set(SESSION_HINT_COOKIE, '', { path: '/', maxAgeSeconds: 0, sameSite: 'Lax' });
  }
}
