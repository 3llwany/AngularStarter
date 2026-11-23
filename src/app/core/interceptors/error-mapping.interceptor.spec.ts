import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '@core/auth';
import { isAppError, TOAST_HANDLER, ToastHandler } from '@core/errors';
import { IResponse, MESSAGE_TYPES, createApiContext } from '@core/http';
import { errorMappingInterceptor } from './error-mapping.interceptor';

describe('errorMappingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let toastSpy: ToastHandler;
  let authHandleUnauthorizedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    toastSpy = {
      error: vi.fn(async () => undefined),
    };
    authHandleUnauthorizedSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: TOAST_HANDLER, useValue: toastSpy },
        { provide: AuthService, useValue: { handleUnauthorized: authHandleUnauthorizedSpy } },
        provideHttpClient(withInterceptors([errorMappingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('maps HTTP failures to AppError and displays translated toast via TOAST_HANDLER', async () => {
    const reqPromise = firstValueFrom(http.get('/api/lessons'));
    const req = httpMock.expectOne('/api/lessons');
    req.flush({ message: 'Server down' }, { status: 500, statusText: 'Internal Server Error' });

    let caught: unknown;
    try {
      await reqPromise;
    } catch (error: unknown) {
      caught = error;
    }

    expect(isAppError(caught)).toBe(true);
    expect(caught).toEqual(
      expect.objectContaining({
        code: 'SERVER_ERROR',
        status: 500,
        translationKey: 'errors.http.server',
        notified: true,
      }),
    );
    expect(toastSpy.error).toHaveBeenCalledWith('errors.http.server');
    expect(authHandleUnauthorizedSpy).not.toHaveBeenCalled();
  });

  it('clears session on 401 response and suppresses toast when SKIP_ERROR_TOAST is true', async () => {
    const reqPromise = firstValueFrom(
      http.get('auth/me', {
        context: createApiContext({ skipErrorToast: true }),
      }),
    );
    const req = httpMock.expectOne('auth/me');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    let caught: unknown;
    try {
      await reqPromise;
    } catch (error: unknown) {
      caught = error;
    }

    expect(caught).toEqual(
      expect.objectContaining({
        code: 'UNAUTHORIZED',
        status: 401,
        translationKey: 'errors.http.unauthorized',
        notified: false,
      }),
    );
    expect(toastSpy.error).not.toHaveBeenCalled();
    expect(authHandleUnauthorizedSpy).toHaveBeenCalledTimes(1);
  });

  it('rejects 200 OK IResponse with Fail messageType and shows toast for every message', async () => {
    const body: IResponse<null> = {
      message: {
        messageType: MESSAGE_TYPES.Fail,
        messageTypeName: 'Fail',
        messages: [
          { code: 101, message: 'Email is required' },
          { code: 102, message: 'Row is invalid', rowNumber: 4, excelSheetName: 'Students' },
        ],
      },
      data: null,
    };

    const reqPromise = firstValueFrom(http.post('/api/students/import', {}));
    const req = httpMock.expectOne('/api/students/import');
    req.flush(body, { status: 200, statusText: 'OK' });

    let caught: unknown;
    try {
      await reqPromise;
    } catch (error: unknown) {
      caught = error;
    }

    expect(isAppError(caught)).toBe(true);
    expect(caught).toEqual(
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        status: 200,
        notified: true,
      }),
    );
    expect(toastSpy.error).toHaveBeenCalledTimes(2);
    expect(toastSpy.error).toHaveBeenNthCalledWith(1, 'Email is required');
    expect(toastSpy.error).toHaveBeenNthCalledWith(2, 'Row is invalid (#4) [Students]');
  });

  it('allows 200 OK IResponse with Success messageType without showing error toasts', async () => {
    const body: IResponse<{ readonly count: number }> = {
      message: {
        messageType: MESSAGE_TYPES.Success,
        messageTypeName: 'Success',
        messages: [],
      },
      data: { count: 5 },
    };

    const reqPromise = firstValueFrom(
      http.get<IResponse<{ readonly count: number }>>('/api/students'),
    );
    const req = httpMock.expectOne('/api/students');
    req.flush(body, { status: 200, statusText: 'OK' });

    const response = await reqPromise;
    expect(response.data.count).toBe(5);
    expect(toastSpy.error).not.toHaveBeenCalled();
  });

  it('resolves TOAST_HANDLER lazily so i18n JSON requests do not trigger NG0200 circular dependency', async () => {
    TestBed.resetTestingModule();
    const toastFactory = vi.fn(() => toastSpy);

    TestBed.configureTestingModule({
      providers: [
        { provide: TOAST_HANDLER, useFactory: toastFactory },
        provideHttpClient(withInterceptors([errorMappingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    const localHttp = TestBed.inject(HttpClient);
    const localMock = TestBed.inject(HttpTestingController);

    const i18nPromise = firstValueFrom(localHttp.get<{ readonly hello: string }>('/i18n/ar.json'));
    const i18nReq = localMock.expectOne('/i18n/ar.json');
    i18nReq.flush({ hello: 'مرحبا' });

    await i18nPromise;
    expect(toastFactory).not.toHaveBeenCalled();
    localMock.verify();
  });
});
