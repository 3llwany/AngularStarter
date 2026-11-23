import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

export type AppErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'AUTH_INVALID_IDENTIFIER'
  | 'UNKNOWN_ERROR';

export interface AppError {
  readonly code: AppErrorCode;
  readonly status: number | null;
  readonly translationKey: string;
  readonly translationParams?: Readonly<Record<string, string | number>>;
  readonly details?: string;
  readonly notified?: boolean;
  readonly cause?: unknown;
  readonly timestamp: number;
}

export interface CreateAppErrorInput {
  readonly code: AppErrorCode;
  readonly status?: number | null;
  readonly errorKey: string;
  readonly translationParams?: Readonly<Record<string, string | number>>;
  readonly details?: string;
  readonly notified?: boolean;
  readonly cause?: unknown;
  readonly timestamp?: number;
}

const APP_ERROR_CODES: ReadonlySet<string> = new Set<AppErrorCode>([
  'NETWORK_ERROR',
  'TIMEOUT_ERROR',
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'SERVER_ERROR',
  'AUTH_INVALID_IDENTIFIER',
  'UNKNOWN_ERROR',
]);

interface StatusMapping {
  readonly code: AppErrorCode;
  readonly errorKey: string;
}

const HTTP_STATUS_MAP: Readonly<Record<number, StatusMapping>> = {
  0: { code: 'NETWORK_ERROR', errorKey: 'errors.http.network' },
  400: { code: 'BAD_REQUEST', errorKey: 'errors.http.bad_request' },
  401: { code: 'UNAUTHORIZED', errorKey: 'errors.http.unauthorized' },
  403: { code: 'FORBIDDEN', errorKey: 'errors.http.forbidden' },
  404: { code: 'NOT_FOUND', errorKey: 'errors.http.not_found' },
  408: { code: 'TIMEOUT_ERROR', errorKey: 'errors.http.timeout' },
  409: { code: 'CONFLICT', errorKey: 'errors.http.conflict' },
  422: { code: 'VALIDATION_ERROR', errorKey: 'errors.http.validation' },
  429: { code: 'RATE_LIMITED', errorKey: 'errors.http.rate_limited' },
};

const SERVER_ERROR_MAPPING: StatusMapping = {
  code: 'SERVER_ERROR',
  errorKey: 'errors.http.server',
};

const TIMEOUT_ERROR_MAPPING: StatusMapping = {
  code: 'TIMEOUT_ERROR',
  errorKey: 'errors.http.timeout',
};

const UNEXPECTED_ERROR_MAPPING: StatusMapping = {
  code: 'UNKNOWN_ERROR',
  errorKey: 'errors.unexpected',
};

/**
 * Constructs an immutable typed domain/infrastructure error with a required i18n key.
 */
export function createAppError(input: CreateAppErrorInput): AppError {
  return {
    code: input.code,
    status: input.status ?? null,
    translationKey: input.errorKey,
    translationParams: input.translationParams,
    details: input.details,
    notified: input.notified ?? false,
    cause: input.cause,
    timestamp: input.timestamp ?? Date.now(),
  };
}

/**
 * Runtime type guard for AppError objects.
 */
export function isAppError(value: unknown): value is AppError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<Record<keyof AppError, unknown>>;
  return (
    typeof candidate.code === 'string' &&
    APP_ERROR_CODES.has(candidate.code) &&
    (typeof candidate.status === 'number' || candidate.status === null) &&
    typeof candidate.translationKey === 'string' &&
    typeof candidate.timestamp === 'number'
  );
}

/**
 * Normalizes HttpErrorResponse, TimeoutError, AppError, and arbitrary thrown values into AppError.
 */
export function mapHttpErrorToAppError(error: unknown, notified = false): AppError {
  if (isAppError(error)) {
    return error.notified === notified ? error : { ...error, notified };
  }

  if (error instanceof TimeoutError || (error instanceof Error && error.name === 'TimeoutError')) {
    return createAppError({
      code: TIMEOUT_ERROR_MAPPING.code,
      status: 408,
      errorKey: TIMEOUT_ERROR_MAPPING.errorKey,
      details: error instanceof Error ? error.message : 'Request timed out',
      notified,
      cause: error,
    });
  }

  if (error instanceof HttpErrorResponse) {
    const mapped =
      HTTP_STATUS_MAP[error.status] ??
      (error.status >= 500 ? SERVER_ERROR_MAPPING : UNEXPECTED_ERROR_MAPPING);

    return createAppError({
      code: mapped.code,
      status: error.status,
      errorKey: mapped.errorKey,
      details: error.message,
      notified,
      cause: error,
    });
  }

  return createAppError({
    code: UNEXPECTED_ERROR_MAPPING.code,
    status: null,
    errorKey: UNEXPECTED_ERROR_MAPPING.errorKey,
    details: error instanceof Error ? error.message : String(error),
    notified,
    cause: error,
  });
}
