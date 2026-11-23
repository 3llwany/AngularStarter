import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from 'primeng/button';

export type IconButtonShape = 'circle' | 'square';
export type IconButtonSize = 'medium' | 'small';
export type IconButtonVariant = 'ghost' | 'tinted' | 'surface' | 'glass';

@Component({
  selector: 'app-icon-button',
  imports: [ButtonDirective, TranslatePipe],
  templateUrl: './icon-button.html',
})
export class AppIconButton {
  readonly ariaLabel = input.required<string>();
  readonly shape = input<IconButtonShape>('circle');
  readonly size = input<IconButtonSize>('medium');
  readonly variant = input<IconButtonVariant>('ghost');
  readonly disabled = input<boolean>(false);
  readonly onClick = output<MouseEvent>();

  protected readonly containerClasses = computed(() => {
    const sh = this.shape();
    const sz = this.size();
    const v = this.variant();

    const shapeClass = sh === 'circle' ? 'rounded-full !rounded-full' : 'rounded-xl !rounded-xl';
    const sizeClass = sz === 'medium' ? 'h-11 w-11' : 'h-9 w-9';

    let variantClass = 'bg-transparent text-surface-600 hover:bg-surface-100 active:bg-surface-200 border-transparent';
    if (v === 'tinted') {
      variantClass = 'bg-primary-tint text-primary-600 hover:bg-primary-tint-hover active:bg-primary-tint-active border-transparent';
    } else if (v === 'surface') {
      variantClass = 'bg-surface-0 border border-surface-200/80 text-surface-700 hover:bg-surface-50 shadow-2xs';
    } else if (v === 'glass') {
      variantClass = 'glass-surface text-ink hover:bg-white/80 active:bg-white/90 border border-white/75';
    }

    return `${shapeClass} ${sizeClass} ${variantClass}`;
  });
}

export { AppIconButton as IconButton };
