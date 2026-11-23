import { RenderMode, ServerRoute } from '@angular/ssr';
import { HAS_DEV_ROUTES } from './dev/dev.routes';

const devServerRoutes: ServerRoute[] = HAS_DEV_ROUTES
  ? [
      {
        path: 'dev/foundation',
        renderMode: RenderMode.Client,
      },
      {
        path: 'dev/i18n-ssr',
        renderMode: RenderMode.Server,
      },
    ]
  : [];

export const serverRoutes: ServerRoute[] = [
  ...devServerRoutes,
  {
    path: 'auth/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'not-found',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
