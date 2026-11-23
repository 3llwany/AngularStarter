import { HttpClient } from '@angular/common/http';
import { inject, InjectionToken, makeStateKey, Service, StateKey, TransferState } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { from, Observable, of, tap } from 'rxjs';
import { DEFAULT_LANG, isSupportedLang, SupportedLang } from './locale';

export type ServerTranslationReader = (lang: SupportedLang) => Promise<TranslationObject>;

export const SERVER_TRANSLATION_READER = new InjectionToken<ServerTranslationReader>(
  'SERVER_TRANSLATION_READER',
);

export function translationStateKey(lang: SupportedLang): StateKey<TranslationObject> {
  return makeStateKey<TranslationObject>(`moz.i18n.${lang}`);
}

@Service()
export class SSRTranslateLoader implements TranslateLoader {
  private readonly http = inject(HttpClient);
  private readonly transferState = inject(TransferState);
  private readonly serverReader = inject(SERVER_TRANSLATION_READER, { optional: true });

  getTranslation(lang: string): Observable<TranslationObject> {
    const resolvedLang: SupportedLang = isSupportedLang(lang) ? lang : DEFAULT_LANG;
    const key = translationStateKey(resolvedLang);

    if (this.transferState.hasKey(key)) {
      const cached = this.transferState.get(key, {});
      this.transferState.remove(key);
      return of(cached);
    }

    if (this.serverReader) {
      return from(this.serverReader(resolvedLang)).pipe(
        tap((translations) => {
          this.transferState.set(key, translations);
        }),
      );
    }

    return this.http.get<TranslationObject>(`/i18n/${resolvedLang}.json`).pipe(
      tap((translations) => {
        this.transferState.set(key, translations);
      }),
    );
  }
}
