import { DOCUMENT } from '@angular/common';
import { Component, Injector, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { CookieService } from '../platform/cookie';
import { ThemeService } from '../theme/theme.service';
import { AuthApi } from './auth-api';
import { guestGuard, roleGuard, roleRedirectGuard } from '../guards/auth.guards';
import { AuthService, SESSION_HINT_COOKIE } from './auth.service';
import { buildLoginRequest, isValidIdentifier, LOGIN_METHODS } from './login-methods';
import { DEMO_PASSWORD, MockAuthApi, provideMockAuthApi } from './mock-auth-api';

@Component({ template: '' })
class DummyPageComponent {}

describe('Auth (login-methods, AuthService, guards)', () => {
  describe('login-methods', () => {
    it('validates and builds normalized login requests for all 5 primary roles', () => {
      expect(Object.keys(LOGIN_METHODS)).toEqual([
        'student',
        'parent',
        'teacher',
        'school',
        'partner',
      ]);

      expect(isValidIdentifier('student', 'student@mozakrety.test')).toBe(true);
      expect(isValidIdentifier('student', 'not-an-email')).toBe(false);
      expect(
        buildLoginRequest('student', { email: undefined, identifier: '  Student@Example.com ', password: 'secret' } as { identifier: string; password: string }),
      ).toEqual({
        role: 'student',
        identifier: 'student@example.com',
        identifierType: 'email',
        password: 'secret',
      });

      expect(isValidIdentifier('parent', '010 1234-5678')).toBe(true);
      expect(isValidIdentifier('parent', '01912345678')).toBe(false);
      expect(
        buildLoginRequest('parent', { identifier: '012-3456-7890', password: 'secret' }),
      ).toEqual({
        role: 'parent',
        identifier: '01234567890',
        identifierType: 'mobileNumber',
        password: 'secret',
      });

      expect(isValidIdentifier('teacher', 'tch-1042')).toBe(true);
      expect(isValidIdentifier('teacher', '!')).toBe(false);
      expect(
        buildLoginRequest('teacher', { identifier: ' tch-1042 ', password: 'secret' }),
      ).toEqual({
        role: 'teacher',
        identifier: 'TCH-1042',
        identifierType: 'teacherId',
        password: 'secret',
      });

      expect(isValidIdentifier('school', 'sch-2026')).toBe(true);
      expect(isValidIdentifier('school', 'a')).toBe(false);
      expect(
        buildLoginRequest('school', { identifier: ' sch-2026 ', password: 'secret' }),
      ).toEqual({
        role: 'school',
        identifier: 'SCH-2026',
        identifierType: 'schoolCode',
        password: 'secret',
      });

      expect(isValidIdentifier('partner', 'ops@company.com')).toBe(true);
      expect(isValidIdentifier('partner', 'invalid')).toBe(false);
      expect(
        buildLoginRequest('partner', { identifier: ' OPS@Company.com ', password: 'secret' }),
      ).toEqual({
        role: 'partner',
        identifier: 'ops@company.com',
        identifierType: 'businessEmail',
        password: 'secret',
      });
    });
  });

  describe('AuthService', () => {
    let service: AuthService;
    let mockApi: MockAuthApi;
    let themeService: ThemeService;
    let doc: Document;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [...provideMockAuthApi()],
      });

      service = TestBed.inject(AuthService);
      mockApi = TestBed.inject(MockAuthApi);
      themeService = TestBed.inject(ThemeService);
      doc = TestBed.inject(DOCUMENT);
      doc.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; Path=/`;
    });

    it('starts in unknown status with null user and role', () => {
      expect(service.status()).toBe('unknown');
      expect(service.user()).toBeNull();
      expect(service.role()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('signs in a student, updates signals/theme, sets hint cookie, and never uses Web Storage', async () => {
      const localSetSpy = vi.spyOn(Storage.prototype, 'setItem');

      const user = await service.login('student', {
        identifier: 'STUDENT@MOZAKRETY.TEST',
        password: DEMO_PASSWORD,
      });

      expect(user.role).toBe('student');
      expect(user.identifier).toBe('student@mozakrety.test');
      expect(service.status()).toBe('authenticated');
      expect(service.role()).toBe('student');
      expect(service.isAuthenticated()).toBe(true);
      expect(themeService.currentRole()).toBe('student');
      expect(doc.cookie).toContain(`${SESSION_HINT_COOKIE}=1`);
      expect(localSetSpy).not.toHaveBeenCalled();

      localSetSpy.mockRestore();
    });

    it('rejects invalid identifier before calling AuthApi', async () => {
      const loginSpy = vi.spyOn(mockApi, 'login');

      await expect(
        service.login('parent', {
          identifier: '12345',
          password: DEMO_PASSWORD,
        }),
      ).rejects.toMatchObject({
        code: 'AUTH_INVALID_IDENTIFIER',
        translationKey: 'auth.fields.mobile_number.error',
      });

      expect(loginSpy).not.toHaveBeenCalled();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('clears state on logout even if AuthApi.logout fails', async () => {
      await service.login('teacher', {
        identifier: 'tch-1001',
        password: DEMO_PASSWORD,
      });

      mockApi.failWith = new Error('Network unavailable');

      await expect(service.logout()).rejects.toThrow('Network unavailable');

      expect(service.status()).toBe('anonymous');
      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('deduplicates concurrent restoreSession calls and handles restore failures gracefully', async () => {
      mockApi.delayMs = 10;
      mockApi.currentUser = {
        id: 'usr-school-1',
        role: 'school',
        displayName: 'Al-Nile School',
        identifier: 'SCH-2026',
      };
      const meSpy = vi.spyOn(mockApi, 'me');

      const [first, second] = await Promise.all([
        service.restoreSession(),
        service.restoreSession(),
      ]);

      expect(meSpy).toHaveBeenCalledTimes(1);
      expect(first?.role).toBe('school');
      expect(second?.id).toBe('usr-school-1');
      expect(service.status()).toBe('authenticated');
      expect(themeService.currentRole()).toBe('school');

      mockApi.failWith = new Error('Session endpoint unavailable');
      const fallback = await service.restoreSession();

      expect(fallback).toBeNull();
      expect(service.status()).toBe('anonymous');
      expect(service.user()).toBeNull();
    });

    it('handles HTTP 401 expiry via handleUnauthorized without leaking across injectors', async () => {
      await service.login('partner', {
        identifier: 'partner@mozakrety.test',
        password: DEMO_PASSWORD,
      });

      const isolatedInjector = Injector.create({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' },
          { provide: DOCUMENT, useValue: doc },
          { provide: CookieService, useClass: CookieService },
          { provide: MockAuthApi, useClass: MockAuthApi },
          { provide: AuthApi, useExisting: MockAuthApi },
          { provide: AuthService, useClass: AuthService },
        ],
      });
      const isolatedAuth = isolatedInjector.get(AuthService);
      expect(isolatedAuth.status()).toBe('unknown');

      service.handleUnauthorized();

      expect(service.status()).toBe('anonymous');
      expect(service.user()).toBeNull();
    });
  });

  describe('auth.guards', () => {
    let mockApi: MockAuthApi;
    let authService: AuthService;
    let router: Router;
    const loadedChunks: string[] = [];

    beforeEach(() => {
      loadedChunks.length = 0;

      TestBed.configureTestingModule({
        providers: [
          ...provideMockAuthApi(),
          provideRouter([
            { path: '', component: DummyPageComponent },
            {
              path: 'auth',
              canMatch: [guestGuard],
              children: [{ path: 'login', component: DummyPageComponent }],
            },
            {
              path: 'dashboard',
              canActivate: [roleRedirectGuard],
              component: DummyPageComponent,
            },
            {
              path: 'student',
              canMatch: [roleGuard('student')],
              loadChildren: async () => {
                loadedChunks.push('student');
                return [{ path: '', component: DummyPageComponent }];
              },
            },
            {
              path: 'teacher',
              canMatch: [roleGuard('teacher')],
              loadChildren: async () => {
                loadedChunks.push('teacher');
                return [{ path: '', component: DummyPageComponent }];
              },
            },
          ]),
        ],
      });

      mockApi = TestBed.inject(MockAuthApi);
      authService = TestBed.inject(AuthService);
      router = TestBed.inject(Router);
    });

    it('redirects anonymous user to /auth/login with returnUrl and never loads guarded lazy chunk', async () => {
      const navigated = await router.navigateByUrl('/student');

      expect(navigated).toBe(true);
      expect(router.url).toBe('/auth/login?returnUrl=%2Fstudent');
      expect(loadedChunks).toEqual([]);
    });

    it('redirects authenticated wrong role to their own area without downloading target chunk', async () => {
      await authService.login('teacher', {
        identifier: 'TCH-1001',
        password: DEMO_PASSWORD,
      });

      const navigated = await router.navigateByUrl('/student');

      expect(navigated).toBe(true);
      expect(router.url).toBe('/teacher');
      expect(loadedChunks).toEqual(['teacher']);
      expect(loadedChunks).not.toContain('student');
    });

    it('allows right role after restoring session on fresh browser load', async () => {
      mockApi.currentUser = {
        id: 'usr-student-1',
        role: 'student',
        displayName: 'Sara Student',
        identifier: 'student@mozakrety.test',
      };

      expect(authService.status()).toBe('unknown');

      const navigated = await router.navigateByUrl('/student');

      expect(navigated).toBe(true);
      expect(router.url).toBe('/student');
      expect(authService.status()).toBe('authenticated');
      expect(loadedChunks).toEqual(['student']);
    });

    it('redirects authenticated user away from /auth/* via guestGuard', async () => {
      await authService.login('student', {
        identifier: 'student@mozakrety.test',
        password: DEMO_PASSWORD,
      });

      const navigated = await router.navigateByUrl('/auth/login');

      expect(navigated).toBe(true);
      expect(router.url).toBe('/student');
    });

    it('routes /dashboard via roleRedirectGuard based on authentication state', async () => {
      await router.navigateByUrl('/dashboard');
      expect(router.url).toBe('/auth/login');

      await authService.login('student', {
        identifier: 'student@mozakrety.test',
        password: DEMO_PASSWORD,
      });

      const result = await TestBed.runInInjectionContext(() =>
        roleRedirectGuard({} as never, {} as never),
      );
      expect(result).toBeInstanceOf(UrlTree);
      expect(router.serializeUrl(result as UrlTree)).toBe('/student');
    });
  });
});
