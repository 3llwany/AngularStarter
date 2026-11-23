import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SKIP_COMMON_PARAMS } from '@core/http';
import { LocaleService } from '@core/i18n';

const STATIC_PREFIXES = ['assets/', '/assets/', 'i18n/', '/i18n/', 'fonts/', '/fonts/'];

export const commonParamsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_COMMON_PARAMS)) {
    return next(req);
  }

  const url = req.url;
  if (url === '/config.json' || STATIC_PREFIXES.some((prefix) => url.startsWith(prefix))) {
    return next(req);
  }

  const localeService = inject(LocaleService, { optional: true });

  let params = req.params;

  // Automatically attach active language if not explicitly provided
  if (localeService && !params.has('lang')) {
    params = params.set('lang', localeService.lang());
  }

  return next(req.clone({ params }));
};
