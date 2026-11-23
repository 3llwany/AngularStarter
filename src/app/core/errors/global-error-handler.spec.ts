import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { createAppError } from './app-error';
import { GlobalErrorHandler, TOAST_HANDLER, ToastHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let toastSpy: ToastHandler;
  let handler: ErrorHandler;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    toastSpy = {
      error: vi.fn(async () => undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TOAST_HANDLER, useValue: toastSpy },
        { provide: ErrorHandler, useExisting: GlobalErrorHandler },
      ],
    });

    handler = TestBed.inject(ErrorHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows translated generic error toast for unexpected runtime errors', () => {
    handler.handleError(new Error('Unexpected failure'));

    expect(toastSpy.error).toHaveBeenCalledTimes(1);
    expect(toastSpy.error).toHaveBeenCalledWith('errors.unexpected');
  });

  it('unwraps unhandled promise rejections before mapping', () => {
    const appErr = createAppError({
      code: 'NOT_FOUND',
      status: 404,
      errorKey: 'errors.http.not_found',
      notified: false,
    });

    handler.handleError({ rejection: appErr });

    expect(toastSpy.error).toHaveBeenCalledWith('errors.http.not_found');
  });

  it('suppresses duplicate toast when an AppError was already notified by HTTP interceptor', () => {
    const notifiedError = createAppError({
      code: 'SERVER_ERROR',
      status: 500,
      errorKey: 'errors.http.server',
      notified: true,
    });

    handler.handleError(notifiedError);

    expect(toastSpy.error).not.toHaveBeenCalled();
  });
});
