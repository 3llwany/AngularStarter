import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '@core/config';
import { SKIP_BASE_URL } from '@core/http';
import { apiBaseUrlInterceptor } from './api-base-url.interceptor';

describe('apiBaseUrlInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AppConfigService,
          useValue: {
            apiBaseUrl: () => 'https://api.mozakrety.com',
          },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('prepends apiBaseUrl to relative endpoints', () => {
    http.get('students/profile').subscribe();

    const req = httpTesting.expectOne('https://api.mozakrety.com/students/profile');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('normalizes leading slash in relative endpoints', () => {
    http.get('/teachers/classes').subscribe();

    const req = httpTesting.expectOne('https://api.mozakrety.com/teachers/classes');
    req.flush({});
  });

  it('leaves absolute URLs untouched', () => {
    http.get('https://external-service.com/data').subscribe();

    const req = httpTesting.expectOne('https://external-service.com/data');
    req.flush({});
  });

  it('leaves static assets and i18n requests untouched', () => {
    http.get('i18n/ar.json').subscribe();
    http.get('/config.json').subscribe();

    httpTesting.expectOne('i18n/ar.json').flush({});
    httpTesting.expectOne('/config.json').flush({});
  });

  it('bypasses baseUrl prepending when SKIP_BASE_URL context token is true', () => {
    const context = new HttpContext().set(SKIP_BASE_URL, true);
    http.get('custom/relative/path', { context }).subscribe();

    const req = httpTesting.expectOne('custom/relative/path');
    req.flush({});
  });
});
