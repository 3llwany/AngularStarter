import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

export type LinkVariant = 'primary' | 'muted' | 'destructive';

@Component({
  selector: 'app-link',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './link.html',
})
export class AppLink {
  readonly variant = input<LinkVariant>('primary');
  readonly label = input<string>('');
  readonly href = input<string | undefined>(undefined);
  readonly routerLink = input<string | any[] | undefined>(undefined);
  readonly underline = input<boolean>(false);

  protected readonly linkClasses = computed(() => {
    const v = this.variant();
    let colorClass = 'text-primary-600 hover:text-primary-700 active:text-primary-800';
    if (v === 'muted') {
      colorClass = 'text-surface-500 hover:text-surface-700 active:text-surface-900';
    } else if (v === 'destructive') {
      colorClass = 'text-rose-600 hover:text-rose-700 active:text-rose-800';
    }

    const underlineClass = this.underline() ? 'underline underline-offset-4' : 'no-underline hover:underline';
    return `${colorClass} ${underlineClass}`;
  });
}

export { AppLink as Link };
