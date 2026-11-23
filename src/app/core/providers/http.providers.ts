import {
  HttpInterceptorFn,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { EnvironmentProviders, inject, Provider, provideAppInitializer } from '@angular/core';
import { AppConfigService } from '@core/config';
import {
  apiBaseUrlInterceptor,
  commonParamsInterceptor,
  credentialsInterceptor,
  errorMappingInterceptor,
  localeHeaderInterceptor,
} from '@core/interceptors';

/**
 * Registers the core HTTP client and standardized interceptor chain.
 *
 * Chain order:
 * 1. apiBaseUrlInterceptor    - prepends runtime API base URL
 * 2. commonParamsInterceptor  - attaches active lang & role query parameters
 * 3. credentialsInterceptor   - attaches withCredentials: true for HttpOnly sessions
 * 4. localeHeaderInterceptor  - attaches Accept-Language header from LocaleService
 * 5. [Opt-in slot]            - loadingInterceptor (available in core/interceptors/loading.interceptor.ts; intentionally not enabled by default)
 * 6. errorMappingInterceptor  - normalizes errors into AppError & notifies via TOAST_HANDLER
 */
export function provideMozHttp(
  extraInterceptors: readonly HttpInterceptorFn[] = [],
): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(
      withFetch(),
      withInterceptors([
        apiBaseUrlInterceptor,
        commonParamsInterceptor,
        credentialsInterceptor,
        localeHeaderInterceptor,
        // Optional opt-in: import { loadingInterceptor } from '@core/interceptors';
        ...extraInterceptors,
        errorMappingInterceptor,
      ]),
    ),
    provideAppInitializer(async () => {
      const configService = inject(AppConfigService);
      await configService.loadConfig();
    }),
  ];
}
