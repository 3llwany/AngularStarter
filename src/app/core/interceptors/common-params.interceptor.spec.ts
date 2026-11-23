import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocaleService } from '../i18n/locale.service';
import { ThemeService } from '../theme/theme.service';
import { SKIP_COMMON_PARAMS } from '../http/http.context';
import { commonParamsInterceptor } from './common-params.interceptor';

describe('commonParamsInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  const mockLang = signal<'ar' | 'en'>('ar');
  const mockRole = signal('student');

  beforeEach(() => {
    mockLang.set('ar');
    mockRole.set('student');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([commonParamsInterceptor])),
        provideHttpClientTesting(),
        {
          provide: LocaleService,
          useValue: { lang: mockLang },
        },
        {
          provide: ThemeService,
          useValue: { role: mockRole },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('automatically adds lang and role query parameters', () => {
    http.get('api/lessons').subscribe();

    const req = httpTesting.expectOne((r) => r.url === 'api/lessons');
    expect(req.request.params.get('lang')).toBe('ar');
    expect(req.request.params.get('role')).toBe('student');
    req.flush([]);
  });

  it('does not overwrite explicitly provided lang or role parameters', () => {
    http.get('api/lessons', { params: { lang: 'en', role: 'teacher' } }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === 'api/lessons');
    expect(req.request.params.get('lang')).toBe('en');
    expect(req.request.params.get('role')).toBe('teacher');
    req.flush([]);
  });

  it('bypasses common parameters when SKIP_COMMON_PARAMS context token is true', () => {
    const context = new HttpContext().set(SKIP_COMMON_PARAMS, true);
    http.get('api/ping', { context }).subscribe();

    const req = httpTesting.expectOne('api/ping');
    expect(req.request.params.has('lang')).toBe(false);
    expect(req.request.params.has('role')).toBe(false);
    req.flush({});
  });

  it('skips static asset requests', () => {
    http.get('assets/icons.svg').subscribe();

    const req = httpTesting.expectOne('assets/icons.svg');
    expect(req.request.params.has('lang')).toBe(false);
    req.flush('');
  });
});

