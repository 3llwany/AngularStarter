import { isPlatformBrowser, PlatformLocation } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  PLATFORM_ID,
  Provider,
  provideAppInitializer,
} from '@angular/core';
import { AuthApi, HttpAuthApi, AuthService, SESSION_HINT_COOKIE, MockAuthApi } from '@core/auth';
import { CookieService } from '@core/platform';

export interface AuthOptions {
  /** `mock` (default) for the demo, or `http` for a configured backend. */
  readonly api?: 'mock' | 'http';
}

export function provideAppAuth(options: AuthOptions = {}): (Provider | EnvironmentProviders)[] {
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
 *   or opened an auth page. Public pages are never blocked.
 */
async function restoreSessionOnStartup(): Promise<void> {
  const auth = inject(AuthService);

  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    auth.markAnonymous();
    return;
  }

  const wasSignedIn = inject(CookieService).get(SESSION_HINT_COOKIE) === '1';
  const path = inject(PlatformLocation, { optional: true })?.pathname ?? '/';

  if (wasSignedIn || isAuthPath(path)) {
    await auth.restoreSession();
  } else {
    auth.markAnonymous();
  }
}

function isAuthPath(path: string): boolean {
  const firstSegment = path.split(/[/?#]/).find(Boolean) ?? '';
  return firstSegment === 'auth';
}
