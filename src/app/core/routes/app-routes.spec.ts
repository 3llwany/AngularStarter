import { APP_ROUTES, buildAppRoute, ROLE_ROUTE_ROOTS } from './app-routes';

describe('APP_ROUTES and buildAppRoute', () => {
  it('defines consistent base and full paths for core and role roots', () => {
    expect(APP_ROUTES.root.full).toBe('/');
    expect(APP_ROUTES.auth.login.full).toBe('/auth/login');
    expect(APP_ROUTES.dashboard.full).toBe('/dashboard');
    expect(APP_ROUTES.notFound.full).toBe('/not-found');
    expect(APP_ROUTES.roles.student.full).toBe(`/${ROLE_ROUTE_ROOTS.student}`);
    expect(APP_ROUTES.roles.admin.full).toBe(`/${ROLE_ROUTE_ROOTS.admin}`);
  });

  it('builds complex nested route with encoded params and optional queryParams', () => {
    const withoutQuery = APP_ROUTES.examples.courseLesson.full({
      courseId: 10,
      unitId: 'u-2',
      lessonId: 'intro 1',
    });
    expect(withoutQuery).toEqual({
      path: '/student/courses/10/units/u-2/lessons/intro%201',
    });

    const withQuery = APP_ROUTES.examples.courseLesson.full(
      { courseId: 10, unitId: 3, lessonId: 45 },
      { tab: 'quiz', timestamp: 120 },
    );
    expect(withQuery).toEqual({
      path: '/student/courses/10/units/3/lessons/45',
      queryParams: { tab: 'quiz', timestamp: 120 },
    });
  });

  it('strips undefined query values in buildAppRoute()', () => {
    expect(buildAppRoute('/student/courses', { tab: undefined, page: 2 })).toEqual({
      path: '/student/courses',
      queryParams: { page: 2 },
    });
  });
});
