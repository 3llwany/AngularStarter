import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Tag } from 'primeng/tag';

export type TagTone = 'neutral' | 'primary' | 'success' | 'warning' | 'orange' | 'error';
export type TagSize = 'regular' | 'small';

@Component({
  selector: 'app-tag',
  imports: [Tag, TranslatePipe],
  templateUrl: './tag.html',
})
export class AppTag {
  readonly label = input<string>('');
  readonly tone = input<TagTone>('neutral');
  readonly size = input<TagSize>('regular');
  readonly showDot = input<boolean>(false);

  protected readonly primeSeverity = computed<'success' | 'info' | 'warn' | 'danger' | 'secondary'>(() => {
    const t = this.tone();
    if (t === 'primary') return 'info';
    if (t === 'success') return 'success';
    if (t === 'warning' || t === 'orange') return 'warn';
    if (t === 'error') return 'danger';
    return 'secondary';
  });

  protected readonly computedClasses = computed(() => {
    const t = this.tone();
    const s = this.size();

    let toneClass = 'bg-surface-100 text-surface-700 border-surface-200/80';
    if (t === 'primary') {
      toneClass = 'bg-primary-50 text-primary-700 border-primary-200/80';
    } else if (t === 'success') {
      toneClass = 'bg-[#ddf6ec] text-[#13795b] border-[#13795b]/20';
    } else if (t === 'warning') {
      toneClass = 'bg-[#fff1d6] text-[#8a5a00] border-[#8a5a00]/20';
    } else if (t === 'orange') {
      toneClass = 'bg-[#ffe8da] text-[#a4480f] border-[#a4480f]/20';
    } else if (t === 'error') {
      toneClass = 'bg-[#fde4e1] text-[#b42318] border-[#ef5a4a]/30';
    }

    const sizeClass = s === 'small' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-3 py-1 text-xs gap-1.5';

    return `${toneClass} ${sizeClass}`;
  });

  protected readonly dotClass = computed(() => {
    const t = this.tone();
    if (t === 'primary') return 'bg-primary-600';
    if (t === 'success') return 'bg-[#13795b]';
    if (t === 'warning') return 'bg-[#8a5a00]';
    if (t === 'orange') return 'bg-[#a4480f]';
    if (t === 'error') return 'bg-[#b42318]';
    return 'bg-surface-400';
  });
}

export { AppTag as Tag };
