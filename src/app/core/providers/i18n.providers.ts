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
  MozMissingTranslationHandler,
  SSRTranslateLoader,
} from '@core/i18n';
import { ThemeService } from '@core/theme';

export function provideMozI18n(): (Provider | EnvironmentProviders)[] {
  return [
    ...provideTranslateService({
      lang: DEFAULT_LANG,
      fallbackLang: DEFAULT_LANG,
      langs: [...SUPPORTED_LANGS],
      loader: provideTranslateLoader(SSRTranslateLoader),
      missingTranslationHandler: provideMissingTranslationHandler(MozMissingTranslationHandler),
    }),
    provideAppInitializer(async () => {
      inject(ThemeService);
      const locale = inject(LocaleService);
      await locale.init();
    }),
  ];
}
