import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { createAppError, mapHttpErrorToAppError } from './app-error';

describe('mapHttpErrorToAppError', () => {
  it('preserves existing AppError and updates notified flag when requested', () => {
    const existing = createAppError({
      code: 'AUTH_INVALID_IDENTIFIER',
      errorKey: 'auth.fields.email.error',
      status: null,
      notified: false,
    });

    const mapped = mapHttpErrorToAppError(existing, true);

    expect(mapped).not.toBe(existing);
    expect(mapped.code).toBe('AUTH_INVALID_IDENTIFIER');
    expect(mapped.translationKey).toBe('auth.fields.email.error');
    expect(mapped.notified).toBe(true);
  });

  it('maps status 0 HttpErrorResponse to NETWORK_ERROR', () => {
    const err = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    const mapped = mapHttpErrorToAppError(err, true);

    expect(mapped.code).toBe('NETWORK_ERROR');
    expect(mapped.status).toBe(0);
    expect(mapped.translationKey).toBe('errors.http.network');
    expect(mapped.notified).toBe(true);
  });

  it('maps RxJS TimeoutError to TIMEOUT_ERROR', () => {
    const mapped = mapHttpErrorToAppError(new TimeoutError());

    expect(mapped.code).toBe('TIMEOUT_ERROR');
    expect(mapped.status).toBe(408);
    expect(mapped.translationKey).toBe('errors.http.timeout');
  });

  it.each([
    [400, 'BAD_REQUEST', 'errors.http.bad_request'],
    [401, 'UNAUTHORIZED', 'errors.http.unauthorized'],
    [403, 'FORBIDDEN', 'errors.http.forbidden'],
    [404, 'NOT_FOUND', 'errors.http.not_found'],
    [408, 'TIMEOUT_ERROR', 'errors.http.timeout'],
    [409, 'CONFLICT', 'errors.http.conflict'],
    [422, 'VALIDATION_ERROR', 'errors.http.validation'],
    [429, 'RATE_LIMITED', 'errors.http.rate_limited'],
    [500, 'SERVER_ERROR', 'errors.http.server'],
    [503, 'SERVER_ERROR', 'errors.http.server'],
  ] as const)('maps HTTP %s to %s', (status, expectedCode, expectedKey) => {
    const mapped = mapHttpErrorToAppError(new HttpErrorResponse({ status, statusText: 'Err' }));

    expect(mapped.code).toBe(expectedCode);
    expect(mapped.status).toBe(status);
    expect(mapped.translationKey).toBe(expectedKey);
  });

  it('falls back to UNKNOWN_ERROR with generic translated key for unknown errors', () => {
    const mapped = mapHttpErrorToAppError(new Error('Boom'));

    expect(mapped.code).toBe('UNKNOWN_ERROR');
    expect(mapped.status).toBeNull();
    expect(mapped.translationKey).toBe('errors.unexpected');
    expect(mapped.details).toBe('Boom');
  });
});
