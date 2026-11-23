import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlSegment } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards';
import { AuthService, SESSION_HINT_COOKIE } from './auth.service';
import { DEMO_PASSWORD, MockAuthApi, provideMockAuthApi } from './mock-auth-api';

describe('AuthService and authentication guards', () => {
  let auth: AuthService;
  let api: MockAuthApi;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideMockAuthApi(), provideRouter([])],
    });
    auth = TestBed.inject(AuthService);
    api = TestBed.inject(MockAuthApi);
    router = TestBed.inject(Router);
  });

  it('starts unresolved and stores a signed-in user without web storage', async () => {
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    expect(auth.status()).toBe('unknown');

    const user = await auth.login({ identifier: 'demo@example.test', password: DEMO_PASSWORD });

    expect(user.identifier).toBe('demo@example.test');
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.user()?.displayName).toBe('demo@example.test');
    expect(document.cookie).toContain(`${SESSION_HINT_COOKIE}=1`);
    expect(storageSpy).not.toHaveBeenCalled();
    storageSpy.mockRestore();
  });

  it('rejects an invalid password and always clears session state on logout', async () => {
    await expect(auth.login({ identifier: 'demo@example.test', password: 'wrong' })).rejects.toMatchObject({
      status: 401,
    });
    expect(auth.isAuthenticated()).toBe(false);

    await auth.login({ identifier: 'demo@example.test', password: DEMO_PASSWORD });
    await auth.logout();
    expect(auth.user()).toBeNull();
    expect(auth.status()).toBe('anonymous');
  });

  it('shares concurrent session restoration calls', async () => {
    api.delayMs = 5;
    api.currentUser = { id: 'demo-1', displayName: 'Demo User', identifier: 'demo@example.test' };
    const meSpy = vi.spyOn(api, 'me');

    const [first, second] = await Promise.all([auth.restoreSession(), auth.restoreSession()]);

    expect(meSpy).toHaveBeenCalledTimes(1);
    expect(first?.id).toBe('demo-1');
    expect(second?.id).toBe('demo-1');
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('redirects anonymous visitors to login and allows authenticated visitors through', async () => {
    const anonymousResult = await TestBed.runInInjectionContext(() =>
      authGuard({} as never, [new UrlSegment('private', {})], {} as never),
    );
    expect(router.serializeUrl(anonymousResult as never)).toBe('/auth/login?returnUrl=%2Fprivate');

    await auth.login({ identifier: 'demo@example.test', password: DEMO_PASSWORD });
    const authenticatedResult = await TestBed.runInInjectionContext(() =>
      authGuard({} as never, [new UrlSegment('private', {})], {} as never),
    );
    expect(authenticatedResult).toBe(true);
  });

  it('redirects authenticated visitors away from guest-only routes', async () => {
    await auth.login({ identifier: 'demo@example.test', password: DEMO_PASSWORD });
    const result = await TestBed.runInInjectionContext(() => guestGuard({} as never, [], {} as never));
    expect(router.serializeUrl(result as never)).toBe('/');
  });
});
