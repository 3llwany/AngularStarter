import { HttpContext, HttpContextToken } from '@angular/common/http';

const STATIC_PREFIXES = ['assets/', '/assets/', 'i18n/', '/i18n/', 'fonts/', '/fonts/'];

/**
 * When set to `true`, the `apiBaseUrlInterceptor` will not prepend the base API URL.
 */
export const SKIP_BASE_URL = new HttpContextToken<boolean>(() => false);

/**
 * When set to `true`, the `commonParamsInterceptor` will not append global query parameters.
 */
export const SKIP_COMMON_PARAMS = new HttpContextToken<boolean>(() => false);

/**
 * When set to `true`, the `credentialsInterceptor` will not attach `withCredentials: true`.
 */
export const SKIP_CREDENTIALS = new HttpContextToken<boolean>(() => false);

/**
 * When set to `true`, the `errorMappingInterceptor` will map errors to `AppError`
 * without displaying a toast notification (used for silent session restore probes).
 */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/**
 * When set to `true`, the optional `loadingInterceptor` will not increment `LoadingService`.
 */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

/**
 * Checks whether the request URL targets static frontend assets or runtime configuration.
 */
export function isStaticAssetUrl(url: string): boolean {
  return (
    url === '/config.json' ||
    url === '/robots.txt' ||
    STATIC_PREFIXES.some((prefix) => url.startsWith(prefix))
  );
}

/**
 * Convenience helper to create an HttpContext with specific tokens.
 */
export function createApiContext(options?: {
  skipBaseUrl?: boolean;
  skipCommonParams?: boolean;
  skipCredentials?: boolean;
  skipErrorToast?: boolean;
  skipLoading?: boolean;
}): HttpContext {
  const context = new HttpContext();
  if (options?.skipBaseUrl) {
    context.set(SKIP_BASE_URL, true);
  }
  if (options?.skipCommonParams) {
    context.set(SKIP_COMMON_PARAMS, true);
  }
  if (options?.skipCredentials) {
    context.set(SKIP_CREDENTIALS, true);
  }
  if (options?.skipErrorToast) {
    context.set(SKIP_ERROR_TOAST, true);
  }
  if (options?.skipLoading) {
    context.set(SKIP_LOADING, true);
  }
  return context;
}

