import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SKIP_LOADING } from '@core/http';
import { LoadingService } from '@core/loading';
import { loadingInterceptor } from './loading.interceptor';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let loading: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpTesting.verify();
    TestBed.resetTestingModule();
  });

  it('tracks active HTTP requests and decrements on response', () => {
    expect(loading.isLoading()).toBe(false);

    http.get('/api/courses').subscribe();
    expect(loading.isLoading()).toBe(true);
    expect(loading.activeCount()).toBe(1);

    httpTesting.expectOne('/api/courses').flush([]);
    expect(loading.isLoading()).toBe(false);
    expect(loading.activeCount()).toBe(0);
  });

  it('decrements loading count on HTTP error', () => {
    http.get('/api/fail').subscribe({ error: () => undefined });
    expect(loading.isLoading()).toBe(true);

    httpTesting.expectOne('/api/fail').flush('Boom', { status: 500, statusText: 'Server Error' });
    expect(loading.isLoading()).toBe(false);
  });

  it('skips static assets and requests marked with SKIP_LOADING', () => {
    http.get('/i18n/ar.json').subscribe();
    expect(loading.isLoading()).toBe(false);
    httpTesting.expectOne('/i18n/ar.json').flush({});

    const context = new HttpContext().set(SKIP_LOADING, true);
    http.get('/api/silent', { context }).subscribe();
    expect(loading.isLoading()).toBe(false);
    httpTesting.expectOne('/api/silent').flush({});
  });
});
