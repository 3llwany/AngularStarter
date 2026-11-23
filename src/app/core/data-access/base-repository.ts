import { HttpResourceOptions, HttpResourceRef } from '@angular/common/http';
import { computed, inject, signal, WritableSignal } from '@angular/core';
import { defer, finalize, Observable } from 'rxjs';
import { ApiClient, ApiRequestOptions } from '../http/api-client';
import { PaginatedResult } from '../http/api-response';

export interface RepositoryEndpoints {
  readonly getAll: string;
  readonly getPaginated: string;
  readonly getById: string;
  readonly create: string;
  readonly update: string;
  readonly patch: string;
  readonly delete: string;
}

export const DEFAULT_REPOSITORY_ENDPOINTS: RepositoryEndpoints = {
  getAll: 'GetAll',
  getPaginated: 'GetList',
  getById: 'GetById',
  create: 'Create',
  update: 'Edit',
  patch: 'Patch',
  delete: 'Delete',
};

function isPrimitiveId(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}

function trackSignalCounter<T>(
  counter: WritableSignal<number>,
  source$: Observable<T>,
): Observable<T> {
  return defer(() => {
    counter.update((count) => count + 1);
    return source$.pipe(finalize(() => counter.update((count) => Math.max(0, count - 1))));
  });
}

/**
 * Generic abstract CRUD repository for domain entities in Mozakrety.
 * Injects `ApiClient` (which automatically unwraps `IResponse<T>` / `IResponseList<T>`),
 * tracks `isLoading` / `isSaving` / `isDeleting` signals, and provides reactive `httpResource` helpers.
 */
export abstract class BaseRepository<
  TEntity,
  TId = string,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TEntity>,
> {
  protected readonly api = inject(ApiClient);

  private readonly loadingCount = signal(0);
  private readonly savingCount = signal(0);
  private readonly deletingCount = signal(0);

  /** `true` while `getAll`, `getPaginated`, or `getById` is in flight. */
  readonly isLoading = computed(() => this.loadingCount() > 0);
  /** `true` while `create`, `update`, or `patch` is in flight. */
  readonly isSaving = computed(() => this.savingCount() > 0);
  /** `true` while `delete` is in flight. */
  readonly isDeleting = computed(() => this.deletingCount() > 0);

  /** Base controller route for this entity (e.g. '/students' or '/courses'). */
  protected abstract readonly endpoint: string;

  /**
   * Optional per-action endpoint overrides (e.g. `{ getAll: 'GetAllActive', create: '' }`).
   * Unspecified keys fall back to `DEFAULT_REPOSITORY_ENDPOINTS`.
   */
  protected readonly endpoints: Partial<RepositoryEndpoints> = {};

  /** Builds the full action URL, appending `id` when provided. */
  protected buildUrl(action: keyof RepositoryEndpoints, id?: TId): string {
    const trimmedEndpoint = this.endpoint.replace(/\/+$/, '');
    const rawAction = this.endpoints[action] ?? DEFAULT_REPOSITORY_ENDPOINTS[action];
    const trimmedAction = rawAction.replace(/^\/+|\/+$/g, '');
    const base = trimmedAction ? `${trimmedEndpoint}/${trimmedAction}` : trimmedEndpoint;
    return id !== undefined ? `${base}/${String(id)}` : base;
  }

  protected trackLoading<T>(source$: Observable<T>): Observable<T> {
    return trackSignalCounter(this.loadingCount, source$);
  }

  protected trackSaving<T>(source$: Observable<T>): Observable<T> {
    return trackSignalCounter(this.savingCount, source$);
  }

  protected trackDeleting<T>(source$: Observable<T>): Observable<T> {
    return trackSignalCounter(this.deletingCount, source$);
  }

  /** Retrieves all records for this entity. */
  getAll(options?: ApiRequestOptions): Observable<TEntity[]> {
    return this.trackLoading(this.api.get<TEntity[]>(this.buildUrl('getAll'), options));
  }

  /** Retrieves paginated records together with `IMetaModel` pagination metadata. */
  getPaginated(options?: ApiRequestOptions): Observable<PaginatedResult<TEntity[]>> {
    return this.trackLoading(
      this.api.getPaginated<TEntity[]>(this.buildUrl('getPaginated'), options),
    );
  }

  /** Retrieves a single entity by its identifier. */
  getById(id: TId, options?: ApiRequestOptions): Observable<TEntity> {
    return this.trackLoading(this.api.get<TEntity>(this.buildUrl('getById', id), options));
  }

  /** Creates a new entity. */
  create(dto: TCreateDto, options?: ApiRequestOptions): Observable<TEntity> {
    return this.trackSaving(
      this.api.post<TEntity, TCreateDto>(this.buildUrl('create'), dto, options),
    );
  }

  /** Updates an entity (`PUT /endpoint/Edit` when ID is in body or `options.params`). */
  update(dto: TUpdateDto, options?: ApiRequestOptions): Observable<TEntity>;
  /** Updates an entity by path ID (`PUT /endpoint/Edit/:id`). */
  update(id: TId, dto: TUpdateDto, options?: ApiRequestOptions): Observable<TEntity>;
  update(
    idOrDto: TId | TUpdateDto,
    dtoOrOptions?: TUpdateDto | ApiRequestOptions,
    options?: ApiRequestOptions,
  ): Observable<TEntity> {
    const hasPathId = isPrimitiveId(idOrDto);
    const url = hasPathId ? this.buildUrl('update', idOrDto as TId) : this.buildUrl('update');
    const body = (hasPathId ? dtoOrOptions : idOrDto) as TUpdateDto;
    const reqOptions = hasPathId ? options : (dtoOrOptions as ApiRequestOptions | undefined);

    return this.trackSaving(this.api.put<TEntity, TUpdateDto>(url, body, reqOptions));
  }

  /** Partially updates an entity (`PATCH /endpoint/Patch` when ID is in body or `options.params`). */
  patch(dto: Partial<TUpdateDto>, options?: ApiRequestOptions): Observable<TEntity>;
  /** Partially updates an entity by path ID (`PATCH /endpoint/Patch/:id`). */
  patch(id: TId, dto: Partial<TUpdateDto>, options?: ApiRequestOptions): Observable<TEntity>;
  patch(
    idOrDto: TId | Partial<TUpdateDto>,
    dtoOrOptions?: Partial<TUpdateDto> | ApiRequestOptions,
    options?: ApiRequestOptions,
  ): Observable<TEntity> {
    const hasPathId = isPrimitiveId(idOrDto);
    const url = hasPathId ? this.buildUrl('patch', idOrDto as TId) : this.buildUrl('patch');
    const body = (hasPathId ? dtoOrOptions : idOrDto) as Partial<TUpdateDto>;
    const reqOptions = hasPathId ? options : (dtoOrOptions as ApiRequestOptions | undefined);

    return this.trackSaving(this.api.patch<TEntity, Partial<TUpdateDto>>(url, body, reqOptions));
  }

  /** Deletes an entity by path ID (`DELETE /endpoint/Delete/:id`). */
  delete(id: TId, options?: ApiRequestOptions): Observable<void>;
  /** Deletes an entity passing ID via `options.params` (`DELETE /endpoint/Delete`). */
  delete(options?: ApiRequestOptions): Observable<void>;
  delete(
    idOrOptions?: TId | ApiRequestOptions,
    options?: ApiRequestOptions,
  ): Observable<void> {
    const hasPathId = isPrimitiveId(idOrOptions);
    const url = hasPathId ? this.buildUrl('delete', idOrOptions as TId) : this.buildUrl('delete');
    const reqOptions = hasPathId ? options : (idOrOptions as ApiRequestOptions | undefined);

    return this.trackDeleting(this.api.delete<void>(url, reqOptions));
  }

  /** Reactive Signal-based fetching for all records via `httpResource`. */
  resourceAll(
    options?: HttpResourceOptions<TEntity[], unknown>,
  ): HttpResourceRef<TEntity[] | undefined> {
    return this.api.resource<TEntity[]>(() => this.buildUrl('getAll'), options);
  }

  /**
   * Reactive Signal-based data fetching for a single entity by ID.
   * Returns `undefined` when ID is `undefined` (no network call triggered).
   */
  resourceById(
    idFn: () => TId | undefined,
    options?: HttpResourceOptions<TEntity, unknown>,
  ): HttpResourceRef<TEntity | undefined> {
    return this.api.resource<TEntity>(() => {
      const id = idFn();
      return id !== undefined ? this.buildUrl('getById', id) : undefined;
    }, options);
  }
}
