import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PIcon } from '@primeicons/angular/p-icon';
import { ButtonDirective, ButtonVariant } from 'primeng/button';
import { BaseButton } from '../foundation/base-button';

export type AppButtonVariant = 'primary' | 'glass' | 'tinted' | 'outlined' | 'text' | 'link';
export type AppButtonSize = 'large' | 'medium' | 'small';

@Component({
  selector: 'app-button',
  imports: [ButtonDirective, TranslatePipe, PIcon],
  templateUrl: './button.html',
})
export class AppButton extends BaseButton {
  override readonly variant = input<AppButtonVariant | ButtonVariant | string | undefined>('primary');
  readonly size = input<AppButtonSize>('large');
  readonly fullWidth = input<boolean>(false);

  /** Whether the loading spinner should appear after (trailing) the label instead of before. */
  readonly loadingTrailing = input<boolean>(false);
  /** Alias for loadingTrailing. */
  readonly loadingAfter = input<boolean>(false);

  protected readonly isTrailingLoading = computed(() => this.loadingTrailing() || this.loadingAfter());

  protected readonly spinnerSizeClass = computed(() => {
    const s = this.size();
    if (s === 'medium') return 'w-4 h-4';
    if (s === 'small') return 'w-3.5 h-3.5';
    return 'w-5 h-5';
  });

  protected readonly computedClasses = computed(() => {
    const s = this.size();
    const v = this.variant();
    const sev = this.severity();
    const isOutlined = this.outlined() || v === 'outlined';
    const isTinted = v === 'tinted';
    const isGlass = v === 'glass';
    const isFull = this.fullWidth();

    // Sizing tokens from Figma
    let sizeClasses = 'min-h-[56px] px-6 text-[16px] gap-2';
    if (s === 'medium') {
      sizeClasses = 'min-h-[44px] px-[18px] text-[16px] gap-1.5';
    } else if (s === 'small') {
      sizeClasses = 'min-h-[36px] px-[14px] text-[13px] gap-1.5';
    }

    const widthClass = isFull ? 'w-full' : 'w-fit';

    // Variant styling
    let variantClasses: string;
    if (isGlass) {
      variantClasses =
        'glass-surface text-ink hover:bg-white/80 active:bg-white/90 border border-white/75';
    } else if (isTinted) {
      variantClasses =
        'bg-primary-tint text-primary-600 hover:bg-primary-tint-hover active:bg-primary-tint-active border-transparent';
    } else if (isOutlined) {
      if (sev === 'danger') {
        variantClasses = 'bg-transparent border border-rose-300 text-rose-600 hover:bg-rose-50';
      } else if (sev === 'secondary') {
        variantClasses = 'bg-transparent border border-surface-200 text-surface-700 hover:bg-surface-100';
      } else {
        variantClasses = 'bg-transparent border border-primary-300 text-primary-600 hover:bg-primary-50';
      }
    } else {
      // Filled variants
      if (sev === 'danger') {
        variantClasses = 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border-transparent';
      } else if (sev === 'secondary') {
        variantClasses =
          'bg-surface-100 text-surface-700 hover:bg-surface-200 active:bg-surface-300 border border-surface-200/80';
      } else {
        // Primary
        variantClasses =
          'bg-primary-600 text-on-primary hover:bg-primary-700 active:bg-primary-800 border-transparent' +
          (s === 'large' ? ' shadow-glow-lg' : '');
      }
    }

    return `${widthClass} ${sizeClasses} ${variantClasses} ${this.styleClass() ?? ''}`;
  });
}

export { AppButton as Button };
