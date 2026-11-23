import { Routes } from '@angular/router';

export const mockRoutes: Routes = [
  {
    path: '',
    redirectTo: 'students',
    pathMatch: 'full',
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./pages/mock-student-list.page').then((m) => m.MockStudentListPageComponent),
  },
];
