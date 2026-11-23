import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Message } from 'primeng/message';

export type BannerTone = 'info' | 'warning' | 'error' | 'success';

@Component({
  selector: 'app-banner',
  imports: [Message, TranslatePipe],
  templateUrl: './banner.html',
})
export class AppBanner {
  readonly tone = input<BannerTone>('info');
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly message = input<string>('');
  readonly dismissible = input<boolean>(false);
  readonly onDismiss = output<void>();

  protected readonly primeSeverity = computed<'info' | 'warn' | 'error' | 'success'>(() => {
    const t = this.tone();
    if (t === 'warning') return 'warn';
    if (t === 'error') return 'error';
    if (t === 'success') return 'success';
    return 'info';
  });

  protected readonly iconClass = computed<string>(() => {
    const t = this.tone();
    if (t === 'warning') return 'pi pi-exclamation-triangle';
    if (t === 'error') return 'pi pi-times-circle';
    if (t === 'success') return 'pi pi-check-circle';
    return 'pi pi-info-circle';
  });

  protected readonly containerClasses = computed(() => {
    const t = this.tone();
    if (t === 'warning') {
      return 'bg-[#fff1d6] border-[#8a5a00]/20 text-[#8a5a00]';
    }
    if (t === 'error') {
      return 'bg-[#fde4e1] border-[#ef5a4a]/40 text-[#b42318]';
    }
    if (t === 'success') {
      return 'bg-[#ddf6ec] border-[#13795b]/20 text-[#13795b]';
    }
    return 'bg-primary-50 border-primary-200/80 text-primary-950';
  });
}

export { AppBanner as Banner };
