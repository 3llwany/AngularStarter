import { EnvironmentProviders, inject, Provider, provideAppInitializer } from '@angular/core';
import {
  provideMissingTranslationHandler,
  provideTranslateLoader,
  provideTranslateService,
} from '@ngx-translate/core';
import {
  DEFAULT_LANG,
  SUPPORTED_LANGS,
  LocaleService,
  AppMissingTranslationHandler,
  SSRTranslateLoader,
} from '@core/i18n';

export function provideAppI18n(): (Provider | EnvironmentProviders)[] {
  return [
    ...provideTranslateService({
      lang: DEFAULT_LANG,
      fallbackLang: DEFAULT_LANG,
      langs: [...SUPPORTED_LANGS],
      loader: provideTranslateLoader(SSRTranslateLoader),
      missingTranslationHandler: provideMissingTranslationHandler(AppMissingTranslationHandler),
    }),
    provideAppInitializer(async () => {
      const locale = inject(LocaleService);
      await locale.init();
    }),
  ];
}
