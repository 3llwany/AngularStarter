import { Role } from '@core/theme';

/** جذور مسارات الأدوار الستة (مُستخدمة في `app.routes.ts` و الحراس). */
export const ROLE_ROUTE_ROOTS = {
  student: 'student',
  parent: 'parent',
  teacher: 'teacher',
  school: 'school',
  partner: 'partner',
  admin: 'admin',
} as const satisfies Record<Role, string>;

export interface LessonRouteParams {
  readonly courseId: string | number;
  readonly unitId: string | number;
  readonly lessonId: string | number;
}

export interface LessonRouteQuery {
  readonly tab?: 'overview' | 'materials' | 'quiz';
  readonly timestamp?: number;
}

export interface BuiltAppRoute {
  readonly path: string;
  readonly queryParams?: Record<string, string | number | boolean>;
}

/**
 * يبني كائن مسار متكامل (`path` + `queryParams` اختيارية) مع تجاهل القيم غير المعرّفة (`undefined`).
 *
 * @example
 * const target = APP_ROUTES.examples.courseLesson.full(
 *   { courseId: 12, unitId: 3, lessonId: 45 },
 *   { tab: 'quiz', timestamp: 120 },
 * );
 * this.router.navigate([target.path], { queryParams: target.queryParams });
 */
export function buildAppRoute(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): BuiltAppRoute {
  if (!query) {
    return { path };
  }

  const entries = Object.entries(query).filter(
    (entry): entry is [string, string | number | boolean] => entry[1] !== undefined,
  );
  if (entries.length === 0) {
    return { path };
  }

  return {
    path,
    queryParams: Object.fromEntries(entries),
  };
}

/**
 * سجل المسارات المركزي على مستوى التطبيق (`core`):
 * - يضم فقط المسارات العامة، مسارات المصادقة، وجذور الأدوار لمنع تضخم `core` واحترام حدود Sheriff.
 * - كل ميزة (`student`, `teacher`, ...) تعرف مساراتها الداخلية بنفسها بنفس النمط (`base` للـ Route Config و `full` للتنقل).
 */
export const APP_ROUTES = {
  root: {
    base: '',
    full: '/',
  },
  auth: {
    base: 'auth',
    full: '/auth',
    login: {
      base: 'login',
      full: '/auth/login',
    },
    register: {
      base: 'register',
      full: '/auth/register',
    },
  },
  dashboard: {
    base: 'dashboard',
    full: '/dashboard',
  },
  mock: {
    base: 'mock',
    full: '/mock',
    students: {
      base: 'students',
      full: '/mock/students',
    },
  },
  notFound: {
    base: 'not-found',
    full: '/not-found',
  },
  fallback: '**',
  roles: {
    student: { base: ROLE_ROUTE_ROOTS.student, full: `/${ROLE_ROUTE_ROOTS.student}` },
    parent: { base: ROLE_ROUTE_ROOTS.parent, full: `/${ROLE_ROUTE_ROOTS.parent}` },
    teacher: { base: ROLE_ROUTE_ROOTS.teacher, full: `/${ROLE_ROUTE_ROOTS.teacher}` },
    school: { base: ROLE_ROUTE_ROOTS.school, full: `/${ROLE_ROUTE_ROOTS.school}` },
    partner: { base: ROLE_ROUTE_ROOTS.partner, full: `/${ROLE_ROUTE_ROOTS.partner}` },
    admin: { base: ROLE_ROUTE_ROOTS.admin, full: `/${ROLE_ROUTE_ROOTS.admin}` },
  },
  /**
   * مثال مرجعي لمسار متداخل معقد متعدد المعاملات + Query Params اختيارية
   * يُحتذى به عند بناء مسارات الميزات الداخلية (مثل `student-routes.ts`).
   */
  examples: {
    courseLesson: {
      base: 'courses/:courseId/units/:unitId/lessons/:lessonId',
      full: (params: LessonRouteParams, query?: LessonRouteQuery): BuiltAppRoute =>
        buildAppRoute(
          `/${ROLE_ROUTE_ROOTS.student}/courses/${encodeURIComponent(String(params.courseId))}/units/${encodeURIComponent(String(params.unitId))}/lessons/${encodeURIComponent(String(params.lessonId))}`,
          { tab: query?.tab, timestamp: query?.timestamp },
        ),
    },
  },
} as const;
