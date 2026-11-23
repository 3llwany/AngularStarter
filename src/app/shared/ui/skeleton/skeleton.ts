import { Component, computed, input } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

export type SkeletonShape = 'line' | 'row' | 'card' | 'circle';

@Component({
  selector: 'app-skeleton',
  imports: [Skeleton],
  templateUrl: './skeleton.html',
})
export class AppSkeleton {
  readonly shape = input<SkeletonShape>('line');
  readonly width = input<string>('100%');
  readonly height = input<string | undefined>(undefined);
  readonly count = input<number>(1);

  protected readonly items = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }, (_, i) => i),
  );

  protected readonly primeShape = computed<'circle' | 'rectangle'>(() =>
    this.shape() === 'circle' ? 'circle' : 'rectangle',
  );

  protected readonly computedHeight = computed<string>(() => {
    const h = this.height();
    if (h) return h;
    const s = this.shape();
    if (s === 'circle') return '2.5rem';
    if (s === 'row') return '3rem';
    if (s === 'card') return '9rem';
    return '1rem';
  });

  protected readonly computedRadius = computed<string>(() => {
    const s = this.shape();
    if (s === 'circle') return '9999px';
    if (s === 'row') return '12px';
    if (s === 'card') return '16px';
    return '6px';
  });

  protected readonly shapeClass = computed<string>(() => {
    const s = this.shape();
    if (s === 'circle') return 'rounded-full';
    if (s === 'row') return 'rounded-xl';
    if (s === 'card') return 'rounded-2xl';
    return 'rounded-md';
  });
}

export { AppSkeleton as Skeleton };
