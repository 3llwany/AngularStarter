import { Routes } from '@angular/router';

/**
 * Public feature route skeleton (Phase 3 will populate landing & catalog pages).
 */
export const publicRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/starter-home.page').then((page) => page.StarterHomePageComponent),
  },
];
