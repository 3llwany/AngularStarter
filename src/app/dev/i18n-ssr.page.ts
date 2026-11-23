import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-i18n-ssr-page',
  imports: [TranslatePipe],
  template: `
    <main class="min-h-screen bg-slate-50 text-slate-900 p-8 text-start">
      <div class="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 id="ssr-probe-title" class="text-2xl font-bold text-primary-600">
          {{ 'dev.i18n_ssr.title' | translate }}
        </h1>
        <p id="ssr-probe-description" class="mt-2 text-base text-slate-700">
          {{ 'dev.i18n_ssr.description' | translate }}
        </p>
        <p id="ssr-probe-stream" class="mt-4 text-sm font-medium text-slate-500">
          {{ streamLabel() }}
        </p>
      </div>
    </main>
  `,
})
export class I18nSsrPageComponent {
  private readonly translate = inject(TranslateService);

  protected readonly streamLabel = toSignal(this.translate.stream('dev.i18n_ssr.stream_label'), {
    initialValue: '',
  });
}
