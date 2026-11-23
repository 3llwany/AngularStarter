import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { createApiContext } from '@core/http';
import { credentialsInterceptor } from './credentials.interceptor';

describe('credentialsInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('attaches withCredentials: true to API requests', async () => {
    const reqPromise = firstValueFrom(http.get('/api/courses'));
    const req = httpMock.expectOne('/api/courses');

    expect(req.request.withCredentials).toBe(true);

    req.flush({});
    await reqPromise;
  });

  it('skips withCredentials for static assets and config requests', async () => {
    const assetPromise = firstValueFrom(http.get('/i18n/ar.json'));
    const assetReq = httpMock.expectOne('/i18n/ar.json');
    expect(assetReq.request.withCredentials).toBe(false);
    assetReq.flush({});
    await assetPromise;

    const configPromise = firstValueFrom(http.get('/config.json'));
    const configReq = httpMock.expectOne('/config.json');
    expect(configReq.request.withCredentials).toBe(false);
    configReq.flush({});
    await configPromise;
  });

  it('respects SKIP_CREDENTIALS context opt-out', async () => {
    const reqPromise = firstValueFrom(
      http.get('https://cdn.example.com/public.json', {
        context: createApiContext({ skipCredentials: true }),
      }),
    );
    const req = httpMock.expectOne('https://cdn.example.com/public.json');

    expect(req.request.withCredentials).toBe(false);

    req.flush({});
    await reqPromise;
  });
});
