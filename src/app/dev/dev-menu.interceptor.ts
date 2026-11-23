import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from '@core/auth';
import { IResponse, MESSAGE_TYPES } from '@core/http';
import { NavItem, USER_MENU_ENDPOINT } from '@core/navigation';
import { Role } from '@core/theme';

const ROLE_DEV_MENUS: Record<Role, readonly NavItem[]> = {
  student: [
    {
      id: 'overview',
      labelKey: 'dev.menu.overview',
      route: '/dev/foundation',
      icon: 'pi pi-home',
      order: 1,
    },
    {
      id: 'courses',
      labelKey: 'dev.menu.courses',
      route: '/dev/foundation',
      icon: 'pi pi-book',
      order: 2,
    },
    {
      id: 'assignments',
      labelKey: 'dev.menu.assignments',
      route: '/dev/foundation',
      icon: 'pi pi-check-square',
      order: 3,
    },
    {
      id: 'exams',
      labelKey: 'dev.menu.exams',
      route: '/dev/foundation',
      icon: 'pi pi-file-edit',
      order: 4,
    },
    {
      id: 'wallet',
      labelKey: 'dev.menu.wallet',
      route: '/dev/foundation',
      icon: 'pi pi-wallet',
      order: 5,
    },
  ],
  parent: [
    {
      id: 'overview',
      labelKey: 'dev.menu.overview',
      route: '/dev/foundation',
      icon: 'pi pi-home',
      order: 1,
    },
    {
      id: 'students',
      labelKey: 'dev.menu.students',
      route: '/dev/foundation',
      icon: 'pi pi-users',
      order: 2,
    },
    {
      id: 'reports',
      labelKey: 'dev.menu.reports',
      route: '/dev/foundation',
      icon: 'pi pi-chart-bar',
      order: 3,
    },
    {
      id: 'wallet',
      labelKey: 'dev.menu.wallet',
      route: '/dev/foundation',
      icon: 'pi pi-wallet',
      order: 4,
    },
  ],
  teacher: [
    {
      id: 'overview',
      labelKey: 'dev.menu.overview',
      route: '/dev/foundation',
      icon: 'pi pi-home',
      order: 1,
    },
    {
      id: 'courses',
      labelKey: 'dev.menu.courses',
      route: '/dev/foundation',
      icon: 'pi pi-book',
      order: 2,
    },
    {
      id: 'lessons',
      labelKey: 'dev.menu.lessons',
      route: '/dev/foundation',
      icon: 'pi pi-video',
      order: 3,
    },
    {
      id: 'assignments',
      labelKey: 'dev.menu.assignments',
      route: '/dev/foundation',
      icon: 'pi pi-check-square',
      order: 4,
    },
    {
      id: 'exams',
      labelKey: 'dev.menu.exams',
      route: '/dev/foundation',
      icon: 'pi pi-file-edit',
      order: 5,
    },
    {
      id: 'students',
      labelKey: 'dev.menu.students',
      route: '/dev/foundation',
      icon: 'pi pi-users',
      order: 6,
    },
    {
      id: 'calendar',
      labelKey: 'dev.menu.calendar',
      route: '/dev/foundation',
      icon: 'pi pi-calendar',
      order: 7,
    },
    {
      id: 'wallet',
      labelKey: 'dev.menu.wallet',
      route: '/dev/foundation',
      icon: 'pi pi-wallet',
      order: 8,
    },
    {
      id: 'certificates',
      labelKey: 'dev.menu.certificates',
      route: '/dev/foundation',
      icon: 'pi pi-verified',
      order: 9,
    },
    {
      id: 'messages',
      labelKey: 'dev.menu.messages',
      route: '/dev/foundation',
      icon: 'pi pi-comments',
      order: 10,
    },
    {
      id: 'notifications',
      labelKey: 'dev.menu.notifications',
      route: '/dev/foundation',
      icon: 'pi pi-bell',
      order: 11,
    },
    {
      id: 'analytics',
      labelKey: 'dev.menu.analytics',
      route: '/dev/foundation',
      icon: 'pi pi-chart-line',
      order: 12,
    },
    {
      id: 'reports',
      labelKey: 'dev.menu.reports',
      route: '/dev/foundation',
      icon: 'pi pi-chart-bar',
      order: 13,
    },
    {
      id: 'support',
      labelKey: 'dev.menu.support',
      route: '/dev/foundation',
      icon: 'pi pi-life-ring',
      order: 14,
    },
    {
      id: 'settings',
      labelKey: 'dev.menu.settings',
      route: '/dev/foundation',
      icon: 'pi pi-cog',
      order: 15,
    },
  ],
  school: [
    {
      id: 'overview',
      labelKey: 'dev.menu.overview',
      route: '/dev/foundation',
      icon: 'pi pi-home',
      order: 1,
    },
    {
      id: 'students',
      labelKey: 'dev.menu.students',
      route: '/dev/foundation',
      icon: 'pi pi-users',
      order: 2,
    },
    {
      id: 'courses',
      labelKey: 'dev.menu.courses',
      route: '/dev/foundation',
      icon: 'pi pi-book',
      order: 3,
    },
    {
      id: 'calendar',
      labelKey: 'dev.menu.calendar',
      route: '/dev/foundation',
      icon: 'pi pi-calendar',
      order: 4,
    },
    {
      id: 'analytics',
      labelKey: 'dev.menu.analytics',
      route: '/dev/foundation',
      icon: 'pi pi-chart-line',
      order: 5,
    },
    {
      id: 'reports',
      labelKey: 'dev.menu.reports',
      route: '/dev/foundation',
      icon: 'pi pi-chart-bar',
      order: 6,
    },
    {
      id: 'settings',
      labelKey: 'dev.menu.settings',
      route: '/dev/foundation',
      icon: 'pi pi-cog',
      order: 7,
    },
  ],
  partner: [
    {
      id: 'overview',
      labelKey: 'dev.menu.overview',
      route: '/dev/foundation',
      icon: 'pi pi-home',
      order: 1,
    },
    {
      id: 'wallet',
      labelKey: 'dev.menu.wallet',
      route: '/dev/foundation',
      icon: 'pi pi-wallet',
      order: 2,
    },
    {
      id: 'reports',
      labelKey: 'dev.menu.reports',
      route: '/dev/foundation',
      icon: 'pi pi-chart-bar',
      order: 3,
    },
    {
      id: 'support',
      labelKey: 'dev.menu.support',
      route: '/dev/foundation',
      icon: 'pi pi-life-ring',
      order: 4,
    },
    {
      id: 'settings',
      labelKey: 'dev.menu.settings',
      route: '/dev/foundation',
      icon: 'pi pi-cog',
      order: 5,
    },
  ],
  admin: [
    {
      id: 'overview',
      labelKey: 'dev.menu.overview',
      route: '/dev/foundation',
      icon: 'pi pi-home',
      order: 1,
    },
    {
      id: 'courses',
      labelKey: 'dev.menu.courses',
      route: '/dev/foundation',
      icon: 'pi pi-book',
      order: 2,
    },
    {
      id: 'students',
      labelKey: 'dev.menu.students',
      route: '/dev/foundation',
      icon: 'pi pi-users',
      order: 3,
    },
    {
      id: 'wallet',
      labelKey: 'dev.menu.wallet',
      route: '/dev/foundation',
      icon: 'pi pi-wallet',
      order: 4,
    },
    {
      id: 'analytics',
      labelKey: 'dev.menu.analytics',
      route: '/dev/foundation',
      icon: 'pi pi-chart-line',
      order: 5,
    },
    {
      id: 'reports',
      labelKey: 'dev.menu.reports',
      route: '/dev/foundation',
      icon: 'pi pi-chart-bar',
      order: 6,
    },
    {
      id: 'messages',
      labelKey: 'dev.menu.messages',
      route: '/dev/foundation',
      icon: 'pi pi-comments',
      order: 7,
    },
    {
      id: 'notifications',
      labelKey: 'dev.menu.notifications',
      route: '/dev/foundation',
      icon: 'pi pi-bell',
      order: 8,
    },
    {
      id: 'support',
      labelKey: 'dev.menu.support',
      route: '/dev/foundation',
      icon: 'pi pi-life-ring',
      order: 9,
    },
    {
      id: 'settings',
      labelKey: 'dev.menu.settings',
      route: '/dev/foundation',
      icon: 'pi pi-cog',
      order: 10,
    },
  ],
};

/**
 * معترض تطويري مؤقت يوفّر عناصر قائمة تجريبية عند استدعاء `auth/menu`
 * أثناء تجربة الواجهات بدون باك إند. يُزال عند تعطيل `HAS_DEV_ROUTES`.
 */
export const devMenuInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || !req.url.endsWith(USER_MENU_ENDPOINT)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const role = auth.role() ?? 'student';
  const body: IResponse<readonly NavItem[]> = {
    message: {
      messageType: MESSAGE_TYPES.Success,
      messageTypeName: 'Success',
      messages: [],
    },
    data: ROLE_DEV_MENUS[role] ?? ROLE_DEV_MENUS.student,
  };

  return of(new HttpResponse({ status: 200, body }));
};
