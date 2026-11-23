import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocaleService } from '@core/i18n';
import { SKIP_COMMON_PARAMS } from '@core/http';
import { commonParamsInterceptor } from './common-params.interceptor';

describe('commonParamsInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  const mockLang = signal<'ar' | 'en'>('ar');

  beforeEach(() => {
    mockLang.set('ar');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([commonParamsInterceptor])),
        provideHttpClientTesting(),
        {
          provide: LocaleService,
          useValue: { lang: mockLang },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('automatically adds the current language query parameter', () => {
    http.get('api/items').subscribe();

    const req = httpTesting.expectOne((r) => r.url === 'api/items');
    expect(req.request.params.get('lang')).toBe('ar');
    req.flush([]);
  });

  it('does not overwrite an explicitly provided language parameter', () => {
    http.get('api/items', { params: { lang: 'en' } }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === 'api/items');
    expect(req.request.params.get('lang')).toBe('en');
    req.flush([]);
  });

  it('bypasses common parameters when SKIP_COMMON_PARAMS context token is true', () => {
    const context = new HttpContext().set(SKIP_COMMON_PARAMS, true);
    http.get('api/ping', { context }).subscribe();

    const req = httpTesting.expectOne('api/ping');
    expect(req.request.params.has('lang')).toBe(false);
    req.flush({});
  });

  it('skips static asset requests', () => {
    http.get('assets/icons.svg').subscribe();

    const req = httpTesting.expectOne('assets/icons.svg');
    expect(req.request.params.has('lang')).toBe(false);
    req.flush('');
  });
});
