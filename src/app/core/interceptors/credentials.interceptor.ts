import { HttpInterceptorFn } from '@angular/common/http';
import { SKIP_CREDENTIALS, isStaticAssetUrl } from '../http/http.context';
 
/**
 * Ensures API requests include browser/SSR cookie credentials by default while
 * skipping static local assets and requests opting out via SKIP_CREDENTIALS.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.withCredentials || req.context.get(SKIP_CREDENTIALS) || isStaticAssetUrl(req.url)) {
    return next(req);
  }

  return next(req.clone({ withCredentials: true }));
};
