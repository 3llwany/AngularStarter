import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppConfigService } from '@core/config';
import { SKIP_BASE_URL } from '@core/http';

const STATIC_PREFIXES = ['assets/', '/assets/', 'i18n/', '/i18n/', 'fonts/', '/fonts/'];

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_BASE_URL)) {
    return next(req);
  }

  const url = req.url;

  // Skip absolute URLs, protocol-relative URLs, and static asset requests
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//') ||
    url === '/config.json' ||
    STATIC_PREFIXES.some((prefix) => url.startsWith(prefix))
  ) {
    return next(req);
  }

  const configService = inject(AppConfigService);
  const baseUrl = configService.apiBaseUrl();

  if (!baseUrl) {
    return next(req);
  }

  const normalizedEndpoint = url.startsWith('/') ? url.slice(1) : url;
  const fullUrl = `${baseUrl}/${normalizedEndpoint}`;

  return next(req.clone({ url: fullUrl }));
};
