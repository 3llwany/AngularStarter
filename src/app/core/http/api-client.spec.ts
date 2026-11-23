import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '@core/config';
import { ApiClient } from './api-client';
import { SKIP_BASE_URL, SKIP_COMMON_PARAMS } from './http.context';
import { apiBaseUrlInterceptor, commonParamsInterceptor } from '@core/interceptors';

interface TestUser {
  readonly id: string;
  readonly name: string;
}

interface CreateUserDto {
  readonly name: string;
}

describe('ApiClient', () => {
  let client: ApiClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiClient,
        provideHttpClient(withInterceptors([apiBaseUrlInterceptor, commonParamsInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AppConfigService,
          useValue: {
            apiBaseUrl: () => 'https://api.mozakrety.com',
          },
        },
      ],
    });
    client = TestBed.inject(ApiClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    TestBed.resetTestingModule();
  });

  it('performs GET with typed response and base URL interception', () => {
    let result: TestUser | undefined;
    client.get<TestUser>('users/123').subscribe((data) => {
      result = data;
    });

    const req = httpTesting.expectOne((r) => r.url.endsWith('users/123'));
    expect(req.request.method).toBe('GET');
    req.flush({ id: '123', name: 'Ahmed' });

    expect(result).toEqual({ id: '123', name: 'Ahmed' });
  });

  it('performs POST with typed body and response', () => {
    let created: TestUser | undefined;
    const payload: CreateUserDto = { name: 'Sara' };

    client.post<TestUser, CreateUserDto>('users', payload).subscribe((data) => {
      created = data;
    });

    const req = httpTesting.expectOne((r) => r.url.endsWith('users'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: '456', name: 'Sara' });

    expect(created).toEqual({ id: '456', name: 'Sara' });
  });

  it('performs PUT with typed body and response', () => {
    client.put<TestUser, CreateUserDto>('users/123', { name: 'Updated' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url.endsWith('users/123'));
    expect(req.request.method).toBe('PUT');
    req.flush({ id: '123', name: 'Updated' });
  });

  it('performs PATCH with typed body and response', () => {
    client.patch<TestUser, Partial<CreateUserDto>>('users/123', { name: 'Patched' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url.endsWith('users/123'));
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: '123', name: 'Patched' });
  });

  it('performs DELETE with typed response', () => {
    client.delete<{ success: boolean }>('users/123').subscribe();

    const req = httpTesting.expectOne((r) => r.url.endsWith('users/123'));
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('supports skipBaseUrl and skipCommonParams convenience options', () => {
    client
      .get<string>('https://other-domain.com/status', {
        skipBaseUrl: true,
        skipCommonParams: true,
      })
      .subscribe();

    const req = httpTesting.expectOne('https://other-domain.com/status');
    expect(req.request.context.get(SKIP_BASE_URL)).toBe(true);
    expect(req.request.context.get(SKIP_COMMON_PARAMS)).toBe(true);
    req.flush('OK');
  });
});
