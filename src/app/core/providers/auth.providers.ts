import { isPlatformBrowser, PlatformLocation } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  PLATFORM_ID,
  Provider,
  provideAppInitializer,
} from '@angular/core';
import { AuthApi, HttpAuthApi } from '../auth/auth-api';
import { AuthService, SESSION_HINT_COOKIE } from '../auth/auth.service';
import { MockAuthApi } from '../auth/mock-auth-api';
import { CookieService } from '../platform/cookie';
import { ROLES } from '../theme/role';

export interface AuthOptions {
  /** `mock` (default) until the backend is ready, then `http`. */
  readonly api?: 'mock' | 'http';
}

export function provideMozAuth(options: AuthOptions = {}): (Provider | EnvironmentProviders)[] {
  const apiClass = options.api === 'http' ? HttpAuthApi : MockAuthApi;
  return [
    apiClass,
    { provide: AuthApi, useExisting: apiClass },
    provideAppInitializer(restoreSessionOnStartup),
  ];
}

/**
 * On app start:
 * - Server (SSR): never ask the backend; treat the visitor as signed out.
 * - Browser: ask the backend only if the user was signed in before (hint cookie)
 *   or opened a role/auth page. Public pages are never blocked.
 */
async function restoreSessionOnStartup(): Promise<void> {
  const auth = inject(AuthService);

  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    auth.markAnonymous();
    return;
  }

  const wasSignedIn = inject(CookieService).get(SESSION_HINT_COOKIE) === '1';
  const path = inject(PlatformLocation, { optional: true })?.pathname ?? '/';

  if (wasSignedIn || isRoleOrAuthPath(path)) {
    await auth.restoreSession();
  } else {
    auth.markAnonymous();
  }
}

function isRoleOrAuthPath(path: string): boolean {
  const firstSegment = path.split(/[/?#]/).find(Boolean) ?? '';
  return firstSegment === 'auth' || (ROLES as readonly string[]).includes(firstSegment);
}
