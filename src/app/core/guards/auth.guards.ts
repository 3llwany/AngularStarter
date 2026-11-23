import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { Role } from '@core/theme';
import { roleHomePath, AuthService } from '@core/auth';
import { APP_ROUTES } from '@core/routes';

function loginPage(router: Router, returnUrl?: string): UrlTree {
  const keepReturnUrl =
    returnUrl && returnUrl !== APP_ROUTES.root.full && !returnUrl.startsWith(APP_ROUTES.auth.full);
  return router.createUrlTree([APP_ROUTES.auth.login.full], {
    queryParams: keepReturnUrl ? { returnUrl } : undefined,
  });
}

/**
 * Only lets users of `role` into the area. Runs as `canMatch`, so other roles
 * never even download that area's code.
 */
export function roleGuard(role: Role): CanMatchFn {
  return async (_route, segments) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    await auth.ensureSessionResolved();

    const userRole = auth.role();
    if (!userRole) {
      return loginPage(router, '/' + segments.map((s) => s.path).join('/'));
    }
    return userRole === role ? true : router.createUrlTree([roleHomePath(userRole)]);
  };
}

/** `/dashboard`: sends signed-in users to their own area, others to login. */
export const roleRedirectGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ensureSessionResolved();

  const userRole = auth.role();
  return userRole ? router.createUrlTree([roleHomePath(userRole)]) : loginPage(router);
};

/** `/auth/**`: signed-in users don't need the login page, send them home. */
export const guestGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ensureSessionResolved();

  const userRole = auth.role();
  return userRole ? router.createUrlTree([roleHomePath(userRole)]) : true;
};
