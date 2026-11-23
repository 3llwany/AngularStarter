import { ErrorHandler, inject, InjectionToken, Injector, isDevMode, Provider, Service } from '@angular/core';
import { isAppError, mapHttpErrorToAppError } from './app-error';

/** Minimal toast contract wired in `app.config.ts` so `core/` stays independent of `shared/`. */
export interface ToastHandler {
  error(detailKey: string): Promise<void>;
  warn?(detailKey: string): Promise<void>;
  info?(detailKey: string): Promise<void>;
}

export const TOAST_HANDLER = new InjectionToken<ToastHandler>('TOAST_HANDLER');

function unwrapThrownError(error: unknown): unknown {
  if (typeof error === 'object' && error !== null && 'rejection' in error) {
    return (error as { readonly rejection: unknown }).rejection;
  }
  return error;
}

/**
 * Global ErrorHandler mapping unexpected client/async exceptions to a translated error toast
 * without duplicating toasts for HTTP errors already notified by errorMappingInterceptor.
 */
@Service()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly injector = inject(Injector);

  handleError(error: unknown): void {
    const unwrapped = unwrapThrownError(error);
    const appError = mapHttpErrorToAppError(unwrapped);

    if (isDevMode()) {
      console.error('[GlobalErrorHandler]', appError.code, unwrapped);
    }

    if (isAppError(unwrapped) && unwrapped.notified) {
      return;
    }

    const toast = this.injector.get(TOAST_HANDLER, null, { optional: true });
    void toast?.error(appError.translationKey).catch(() => undefined);
  }
}

/**
 * Registers global unexpected exception handling across client and SSR runtimes.
 */
export function provideAppErrors(): Provider[] {
  return [{ provide: ErrorHandler, useExisting: GlobalErrorHandler }];
}
