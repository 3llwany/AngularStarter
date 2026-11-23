import { Routes } from '@angular/router';
import { guestGuard, roleGuard, roleRedirectGuard } from './core/guards/auth.guards';
import { APP_ROUTES } from './core/routes/app-routes';
import { devRoutes } from './dev/dev.routes';

export const routes: Routes = [
  {
    path: APP_ROUTES.root.base,
    loadComponent: () =>
      import('./layout/app-shell.component').then((m) => m.AppShellComponent),
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
        path: APP_ROUTES.dashboard.base,
        canActivate: [roleRedirectGuard],
        children: [
          { path: APP_ROUTES.root.base, redirectTo: APP_ROUTES.auth.login.full, pathMatch: 'full' },
        ],
      },
      {
        path: APP_ROUTES.roles.student.base,
        canMatch: [roleGuard('student')],
        loadChildren: () =>
          import('./features/student/student.routes').then((m) => m.studentRoutes),
      },
      {
        path: APP_ROUTES.roles.parent.base,
        canMatch: [roleGuard('parent')],
        loadChildren: () => import('./features/parent/parent.routes').then((m) => m.parentRoutes),
      },
      {
        path: APP_ROUTES.roles.teacher.base,
        canMatch: [roleGuard('teacher')],
        loadChildren: () =>
          import('./features/teacher/teacher.routes').then((m) => m.teacherRoutes),
      },
      {
        path: APP_ROUTES.roles.school.base,
        canMatch: [roleGuard('school')],
        loadChildren: () => import('./features/school/school.routes').then((m) => m.schoolRoutes),
      },
      {
        path: APP_ROUTES.roles.partner.base,
        canMatch: [roleGuard('partner')],
        loadChildren: () =>
          import('./features/partner/partner.routes').then((m) => m.partnerRoutes),
      },
      {
        path: APP_ROUTES.roles.admin.base,
        canMatch: [roleGuard('admin')],
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
      },
      {
        path: APP_ROUTES.mock.base,
        loadChildren: () => import('./features/mock/mock.routes').then((m) => m.mockRoutes),
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
