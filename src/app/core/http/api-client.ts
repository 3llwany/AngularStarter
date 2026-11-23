import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
  httpResource,
  HttpResourceOptions,
  HttpResourceRef,
} from '@angular/common/http';
import { inject, Injector, runInInjectionContext, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  IResponse,
  IResponseList,
  PaginatedResult,
  unwrapPaginatedResponse,
  unwrapResponseData,
} from './api-response';
import { SKIP_BASE_URL, SKIP_COMMON_PARAMS } from './http.context';

export interface ApiRequestOptions {
  readonly headers?: HttpHeaders | Record<string, string | string[]>;
  readonly params?:
    | HttpParams
    | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  readonly context?: HttpContext;
  readonly reportProgress?: boolean;
  readonly withCredentials?: boolean;
  readonly skipBaseUrl?: boolean;
  readonly skipCommonParams?: boolean;
}

@Service()
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);

  /**
   * Performs an HTTP GET request and unwraps `IResponse<T>.data` automatically.
   */
  get<TResponse>(endpoint: string, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http
      .get<IResponse<TResponse> | TResponse>(endpoint, this.buildHttpOptions(options))
      .pipe(map((res) => unwrapResponseData<TResponse>(res)));
  }

  /**
   * Performs a paginated HTTP GET request and returns `{ data, meta }`.
   */
  getPaginated<TResponse>(
    endpoint: string,
    options?: ApiRequestOptions,
  ): Observable<PaginatedResult<TResponse>> {
    return this.http
      .get<IResponseList<TResponse> | TResponse>(endpoint, this.buildHttpOptions(options))
      .pipe(map((res) => unwrapPaginatedResponse<TResponse>(res)));
  }

  /**
   * Performs an HTTP POST request and unwraps `IResponse<T>.data` automatically.
   */
  post<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ): Observable<TResponse> {
    return this.http
      .post<IResponse<TResponse> | TResponse>(endpoint, body, this.buildHttpOptions(options))
      .pipe(map((res) => unwrapResponseData<TResponse>(res)));
  }

  /**
   * Performs an HTTP PUT request and unwraps `IResponse<T>.data` automatically.
   */
  put<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ): Observable<TResponse> {
    return this.http
      .put<IResponse<TResponse> | TResponse>(endpoint, body, this.buildHttpOptions(options))
      .pipe(map((res) => unwrapResponseData<TResponse>(res)));
  }

  /**
   * Performs an HTTP PATCH request and unwraps `IResponse<T>.data` automatically.
   */
  patch<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ): Observable<TResponse> {
    return this.http
      .patch<IResponse<TResponse> | TResponse>(endpoint, body, this.buildHttpOptions(options))
      .pipe(map((res) => unwrapResponseData<TResponse>(res)));
  }

  /**
   * Performs an HTTP DELETE request and unwraps `IResponse<T>.data` automatically.
   */
  delete<TResponse>(endpoint: string, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http
      .delete<IResponse<TResponse> | TResponse>(endpoint, this.buildHttpOptions(options))
      .pipe(map((res) => unwrapResponseData<TResponse>(res)));
  }

  /**
   * Modern Angular 22 Signal-based reactive data fetching via `httpResource`.
   * Automatically reacts to parameter/url signal changes, unwraps `IResponse<T>.data` by default,
   * and returns { value, isLoading, error, reload }.
   */
  resource<TResponse>(
    urlFn: () => string | undefined,
    options?: HttpResourceOptions<TResponse, unknown>,
  ): HttpResourceRef<TResponse | undefined> {
    const resolvedOptions: HttpResourceOptions<TResponse, unknown> = {
      parse: unwrapResponseData<TResponse>,
      ...options,
    };
    return runInInjectionContext(this.injector, () =>
      httpResource<TResponse>(() => urlFn(), resolvedOptions),
    );
  }

  private buildHttpOptions(options?: ApiRequestOptions) {
    if (!options) {
      return {};
    }

    let context = options.context;
    if (options.skipBaseUrl || options.skipCommonParams) {
      context = context ? context : new HttpContext();
      if (options.skipBaseUrl) {
        context.set(SKIP_BASE_URL, true);
      }
      if (options.skipCommonParams) {
        context.set(SKIP_COMMON_PARAMS, true);
      }
    }

    return {
      headers: options.headers,
      params: options.params,
      context,
      reportProgress: options.reportProgress,
      withCredentials: options.withCredentials,
    };
  }
}
