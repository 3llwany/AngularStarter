import { Routes } from '@angular/router';

export const HAS_DEV_ROUTES = true as boolean;

export const devRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dev/foundation',
  },
  {
    path: 'dev/foundation',
    loadComponent: () =>
      import('./foundation.page').then((m) => m.FoundationPageComponent),
  },
  {
    path: 'dev/i18n-ssr',
    loadComponent: () =>
      import('./i18n-ssr.page').then((m) => m.I18nSsrPageComponent),
  },
];
