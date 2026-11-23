import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    service = TestBed.inject(LoadingService);
  });

  it('initializes with isLoading = false and count = 0', () => {
    expect(service.isLoading()).toBe(false);
    expect(service.activeCount()).toBe(0);
  });

  it('increments on show() and decrements on hide() with lower bound 0', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
    expect(service.activeCount()).toBe(1);

    service.hide();
    expect(service.isLoading()).toBe(false);
    expect(service.activeCount()).toBe(0);

    // Bounded at 0
    service.hide();
    expect(service.activeCount()).toBe(0);
  });

  it('handles Observable withLoading() on success and error', () => {
    expect(service.isLoading()).toBe(false);

    let emitted = false;
    service.withLoading(of('data')).subscribe((val) => {
      emitted = val === 'data';
    });

    expect(emitted).toBe(true);
    expect(service.isLoading()).toBe(false);

    // Error case
    let errorCaught = false;
    service.withLoading(throwError(() => new Error('err'))).subscribe({
      error: () => {
        errorCaught = true;
      },
    });
    expect(errorCaught).toBe(true);
    expect(service.isLoading()).toBe(false);
  });

  it('handles withLoadingAsync() on Promise resolution and rejection', async () => {
    const result = await service.withLoadingAsync(async () => {
      expect(service.isLoading()).toBe(true);
      return 'success';
    });

    expect(result).toBe('success');
    expect(service.isLoading()).toBe(false);

    // Failure case
    await expect(
      service.withLoadingAsync(async () => {
        throw new Error('fail');
      }),
    ).rejects.toThrow('fail');

    expect(service.isLoading()).toBe(false);
  });
});
