import { inject, InjectionToken, isDevMode, Service } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

export const THROW_ON_MISSING_TRANSLATION = new InjectionToken<boolean>(
  'THROW_ON_MISSING_TRANSLATION',
  {
    providedIn: 'root',
    factory: () => false,
  },
);

@Service()
export class MozMissingTranslationHandler implements MissingTranslationHandler {
  private readonly throwOnMissing = inject(THROW_ON_MISSING_TRANSLATION);
  private readonly loggedKeys = new Set<string>();

  handle(params: MissingTranslationHandlerParams): string {
    const message = `[Mozakrety i18n] Missing translation for key: "${params.key}"`;

    if (this.throwOnMissing) {
      throw new Error(message);
    }

    if (isDevMode()) {
      console.error(message);
      return `⚠ [${params.key}]`;
    }

    if (!this.loggedKeys.has(params.key)) {
      this.loggedKeys.add(params.key);
      console.warn(message);
    }
    return params.key;
  }
}
