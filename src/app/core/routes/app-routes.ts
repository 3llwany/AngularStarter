export interface BuiltAppRoute {
  readonly path: string;
  readonly queryParams?: Record<string, string | number | boolean>;
}

/**
 * يبني كائن مسار متكامل (`path` + `queryParams` اختيارية) مع تجاهل القيم غير المعرّفة (`undefined`).
 *
 * @example
 * const target = buildAppRoute('/items/12', { tab: 'details', page: 2 });
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
 * Contains only application-wide route roots. Feature routes remain owned by each feature.
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
  notFound: {
    base: 'not-found',
    full: '/not-found',
  },
  fallback: '**',
} as const;
