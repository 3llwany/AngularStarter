import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { isStaticAssetUrl } from '@core/http';
import { LocaleService } from '@core/i18n';

/**
 * Sets the `Accept-Language` header from the active LocaleService on outbound API calls,
 * preserving caller-specified headers and skipping static frontend assets.
 */
export const localeHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  if (isStaticAssetUrl(req.url) || req.headers.has('Accept-Language')) {
    return next(req);
  }

  const localeService = inject(LocaleService, { optional: true });
  if (!localeService) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        'Accept-Language': localeService.lang(),
      },
    }),
  );
};
