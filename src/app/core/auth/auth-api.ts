import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { isAppError } from '@core/errors';
import { ApiClient, createApiContext } from '@core/http';
import { AuthUser, LoginRequest } from './auth.models';

/**
 * What the app needs from the backend for auth.
 * `MockAuthApi` is used now; `HttpAuthApi` once the backend is ready.
 */
export abstract class AuthApi {
  abstract login(request: LoginRequest): Promise<AuthUser>;
  abstract logout(): Promise<void>;
  /** Returns the signed-in user, or `null` when there is no session. */
  abstract me(): Promise<AuthUser | null>;
}

/**
 * Real backend implementation (assumes HttpOnly cookie sessions).
 *
 * TODO(backend-contract): confirm paths, response shapes and CSRF rules:
 * - POST `auth/login`  body: LoginRequest -> AuthUser
 * - POST `auth/logout` -> 204
 * - GET  `auth/me`     -> AuthUser, or 401 when signed out
 */
@Service()
export class HttpAuthApi extends AuthApi {
  private readonly api = inject(ApiClient);
  private readonly silent = { context: createApiContext({ skipErrorToast: true }) };

  login(request: LoginRequest): Promise<AuthUser> {
    return firstValueFrom(this.api.post<AuthUser>('auth/login', request));
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.api.post<void>('auth/logout', {}, this.silent));
  }

  async me(): Promise<AuthUser | null> {
    try {
      return await firstValueFrom(this.api.get<AuthUser>('auth/me', this.silent));
    } catch (error: unknown) {
      if (isAppError(error) && error.status === 401) {
        return null;
      }
      throw error;
    }
  }
}
