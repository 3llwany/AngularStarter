import { Routes } from '@angular/router';
import { guestGuard } from '@core/guards';
import { APP_ROUTES } from '@core/routes';
import { devRoutes } from './dev/dev.routes';

export const routes: Routes = [
  {
    path: APP_ROUTES.root.base,
    loadComponent: () => import('./layout/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      ...devRoutes,
      {
        path: APP_ROUTES.root.base,
        loadChildren: () => import('./features/public/public.routes').then((m) => m.publicRoutes),
      },
      {
        path: APP_ROUTES.auth.base,
        canMatch: [guestGuard],
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
      },
      {
        path: APP_ROUTES.notFound.base,
        loadComponent: () =>
          import('./features/public/pages/not-found.page').then((m) => m.NotFoundPageComponent),
      },
      {
        path: APP_ROUTES.fallback,
        loadComponent: () =>
          import('./features/public/pages/not-found.page').then((m) => m.NotFoundPageComponent),
      },
    ],
  },
];
