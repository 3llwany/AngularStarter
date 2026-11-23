import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { AuthService } from '@core/auth';
import {
  createAppError,
  isAppError,
  mapHttpErrorToAppError,
  TOAST_HANDLER,
  ToastHandler,
} from '@core/errors';
import {
  formatResponseMessage,
  isApiResponseEnvelope,
  MESSAGE_TYPES,
  SKIP_ERROR_TOAST,
} from '@core/http';

function extractEnvelopeMessages(body: unknown): string[] {
  if (!isApiResponseEnvelope(body)) {
    return [];
  }
  return body.message.messages.map(formatResponseMessage).filter((text) => text.length > 0);
}

function notifyList(
  resolveToast: () => ToastHandler | null,
  level: 'error' | 'warn' | 'info',
  messages: readonly string[],
  skipToast: boolean,
  fallbackKey?: string,
): void {
  if (skipToast) {
    return;
  }
  const toast = resolveToast();
  const notify = toast?.[level]?.bind(toast);
  if (!notify) {
    return;
  }
  const items = messages.length > 0 ? messages : fallbackKey ? [fallbackKey] : [];
  for (const msg of items) {
    void notify(msg).catch(() => undefined);
  }
}

/**
 * Normalizes failed HTTP responses and `IResponse` Fail envelopes into `AppError`,
 * displays translated/backend toasts (unless `SKIP_ERROR_TOAST` is set),
 * and clears expired sessions on 401 responses.
 */
export const errorMappingInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const getToast = () => injector.get(TOAST_HANDLER, null, { optional: true });

  return next(req).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse) || !isApiResponseEnvelope(event.body)) {
        return event;
      }

      const skipToast = req.context.get(SKIP_ERROR_TOAST);
      const messages = extractEnvelopeMessages(event.body);
      const { messageType } = event.body.message;

      if (messageType === MESSAGE_TYPES.Fail) {
        notifyList(getToast, 'error', messages, skipToast, 'errors.http.validation');
        throw createAppError({
          code: 'VALIDATION_ERROR',
          status: event.status,
          errorKey: messages[0] ?? 'errors.http.validation',
          details: messages.join(' | ') || undefined,
          notified: !skipToast,
          cause: event.body,
        });
      }

      if (messageType === MESSAGE_TYPES.Warning) {
        notifyList(getToast, 'warn', messages, skipToast);
      } else if (messageType === MESSAGE_TYPES.Info) {
        notifyList(getToast, 'info', messages, skipToast);
      }

      return event;
    }),
    catchError((error: unknown) => {
      if (isAppError(error)) {
        return throwError(() => error);
      }

      const skipToast = req.context.get(SKIP_ERROR_TOAST);
      const appError = mapHttpErrorToAppError(error, !skipToast);

      if (appError.status === 401 && !req.url.endsWith('auth/login')) {
        injector.get(AuthService, null, { optional: true })?.handleUnauthorized();
      }

      const toast = !skipToast ? getToast() : null;
      if (toast) {
        const envelopeMessages =
          error instanceof HttpErrorResponse ? extractEnvelopeMessages(error.error) : [];
        if (envelopeMessages.length > 0) {
          notifyList(() => toast, 'error', envelopeMessages, false);
        } else {
          void toast.error(appError.translationKey).catch(() => undefined);
        }
      }

      return throwError(() => appError);
    }),
  );
};
