import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SeoService } from '@core/seo';

/**
 * Translated 404 Not Found skeleton route setting `noindex` metadata and real SSR HTTP 404 status.
 */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslatePipe],
  template: `
    <main
      class="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <p class="mb-3 rounded-full bg-surface-100 px-4 py-1 text-sm font-semibold text-surface-700">
        {{ 'errors.not_found.badge' | translate }}
      </p>
      <h1 class="mb-4 text-3xl font-bold tracking-tight text-surface-900">
        {{ 'errors.not_found.title' | translate }}
      </h1>
      <p class="mb-8 text-base text-surface-600">
        {{ 'errors.not_found.description' | translate }}
      </p>
      <a
        routerLink="/"
        class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
        {{ 'errors.not_found.back_home' | translate }}
      </a>
    </main>
  `,
})
export class NotFoundPageComponent {
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);

  private readonly seoTitle = toSignal(this.translate.stream('errors.not_found.seo_title'), {
    initialValue: '404',
  });
  private readonly seoDescription = toSignal(
    this.translate.stream('errors.not_found.description'),
    { initialValue: '' },
  );

  constructor() {
    this.seo.setNotFound(this.seoTitle(), this.seoDescription() || undefined);

    effect(() => {
      const title = this.seoTitle();
      const description = this.seoDescription();
      this.seo.setNotFound(title, description || undefined);
    });
  }
}
