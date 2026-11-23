import { EnvironmentProviders, inject, Provider, provideAppInitializer } from '@angular/core';
import {
  provideMissingTranslationHandler,
  provideTranslateLoader,
  provideTranslateService,
} from '@ngx-translate/core';
import { DEFAULT_LANG, SUPPORTED_LANGS } from '../i18n/locale';
import { LocaleService } from '../i18n/locale.service';
import { MozMissingTranslationHandler } from '../i18n/missing-translation.handler';
import { SSRTranslateLoader } from '../i18n/ssr-translate.loader';
import { ThemeService } from '../theme/theme.service';

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
