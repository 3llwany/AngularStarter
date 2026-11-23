import { computed, Service, signal } from '@angular/core';
import { defer, finalize, Observable } from 'rxjs';

/**
 * Modern Signal-based application loading service.
 * Eliminates heavy 3rd-party dependencies like ngx-spinner.
 * Tracks active loading requests and provides reactive `isLoading` signal and RxJS/Promise operators.
 */
@Service()
export class LoadingService {
  private readonly _activeCount = signal(0);

  /** Readonly signal indicating if any loading operation is currently in progress. */
  readonly isLoading = computed(() => this._activeCount() > 0);

  /** Current number of active loading tasks. */
  readonly activeCount = this._activeCount.asReadonly();

  /** Manually increment active loading count. */
  show(): void {
    this._activeCount.update((count) => count + 1);
  }

  /** Manually decrement active loading count (bounded at 0). */
  hide(): void {
    this._activeCount.update((count) => Math.max(0, count - 1));
  }

  /** Reset active loading count to 0. */
  reset(): void {
    this._activeCount.set(0);
  }

  /**
   * Automatically manages loading state for an Observable pipeline.
   * Increments on subscribe and decrements on completion/error (finalize).
   */
  withLoading<T>(source$: Observable<T>): Observable<T> {
    return defer(() => {
      this.show();
      return source$.pipe(finalize(() => this.hide()));
    });
  }

  /**
   * Automatically manages loading state for an asynchronous Promise task.
   */
  async withLoadingAsync<T>(taskFn: () => Promise<T>): Promise<T> {
    this.show();
    try {
      return await taskFn();
    } finally {
      this.hide();
    }
  }
}
