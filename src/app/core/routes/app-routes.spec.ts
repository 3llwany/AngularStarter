import { APP_ROUTES, buildAppRoute } from './app-routes';

describe('APP_ROUTES and buildAppRoute', () => {
  it('defines generic application route roots', () => {
    expect(APP_ROUTES.root.full).toBe('/');
    expect(APP_ROUTES.auth.login.full).toBe('/auth/login');
    expect(APP_ROUTES.notFound.full).toBe('/not-found');
  });

  it('removes undefined query values and keeps typed values', () => {
    expect(buildAppRoute('/items/12', { tab: 'details', page: 2, filter: undefined })).toEqual({
      path: '/items/12',
      queryParams: { tab: 'details', page: 2 },
    });
  });

  it('omits query parameters when no defined value remains', () => {
    expect(buildAppRoute('/items', { filter: undefined })).toEqual({ path: '/items' });
  });
});
