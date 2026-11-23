import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import {
  EnvironmentProviders,
  Provider,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  Type,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideAppErrors, TOAST_HANDLER, ToastHandler } from '@core/errors';
import { AuthOptions, provideAppAuth } from './auth.providers';
import { provideAppHttp } from './http.providers';
import { provideAppI18n } from './i18n.providers';
import { provideAppPrimeNG } from './primeng.providers';

/**
 * SSR HTTP Transfer Cache Policy:
 * - CACHED: Anonymous public GET/HEAD requests (e.g. `/i18n/*.json`, `/config.json`, public catalog endpoints).
 * - NEVER CACHED: Requests with `withCredentials`, `/auth/*` endpoints, Auth/Cookie headers,
 *   `Cache-Control: no-store/no-cache/private`, or mutating verbs (`POST`, `PUT`, `PATCH`, `DELETE`).
 */
export function shouldCacheHttpRequestInTransferState(req: HttpRequest<unknown>): boolean {
  if (req.withCredentials) {
    return false;
  }

  return !req.url.includes('/auth/') && !req.url.startsWith('auth/');
}

export function provideCoreFramework(appRoutes: Routes): (Provider | EnvironmentProviders)[] {
  return [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        includePostRequests: false,
        includeRequestsWithAuthHeaders: false,
        includeRequestsWithCredentials: false,
        includeNonCacheableRequests: false,
        filter: shouldCacheHttpRequestInTransferState,
      }),
    ),
  ];
}

export interface CoreOptions {
  readonly toastHandler?: Type<ToastHandler>;
  readonly auth?: AuthOptions;
}

/**
 * Single entry point registering all core startup providers for `app.config.ts`.
 */
export function provideCore(
  appRoutes: Routes,
  toastHandler?: Type<ToastHandler>,
  auth?: AuthOptions,
  extraInterceptors: readonly HttpInterceptorFn[] = [],
): (Provider | EnvironmentProviders)[] {
  return [
    ...provideCoreFramework(appRoutes),
    ...provideAppHttp(extraInterceptors),
    ...provideAppPrimeNG(),
    ...provideAppI18n(),
    ...(toastHandler ? [{ provide: TOAST_HANDLER, useExisting: toastHandler }] : []),
    ...provideAppErrors(),
    ...provideAppAuth(auth),
  ];
}
