import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '@core/auth';
import { APP_ROUTES } from '@core/routes';

function loginPage(router: Router, returnUrl?: string): UrlTree {
  const keepReturnUrl =
    returnUrl && returnUrl !== APP_ROUTES.root.full && !returnUrl.startsWith(APP_ROUTES.auth.full);
  return router.createUrlTree([APP_ROUTES.auth.login.full], {
    queryParams: keepReturnUrl ? { returnUrl } : undefined,
  });
}

/** Protects a lazy route using authentication status only. */
export const authGuard: CanMatchFn = async (_route, segments) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ensureSessionResolved();

  if (!auth.isAuthenticated()) {
    return loginPage(router, '/' + segments.map((segment) => segment.path).join('/'));
  }
  return true;
};

/** Keeps authenticated users away from guest-only auth pages. */
export const guestGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ensureSessionResolved();
  return auth.isAuthenticated() ? router.createUrlTree([APP_ROUTES.root.full]) : true;
};
