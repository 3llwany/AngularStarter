import { DOCUMENT, computed, inject, Service, Signal, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { CookieService } from '../platform/cookie';
import {
  DEFAULT_LANG,
  Direction,
  directionForLang,
  isSupportedLang,
  LANG_COOKIE_NAME,
  SUPPORTED_LANGS,
  SupportedLang,
} from './locale';

@Service()
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  private readonly cookies = inject(CookieService);
  private readonly translate = inject(TranslateService);

  private readonly langSignal = signal<SupportedLang>(DEFAULT_LANG);

  readonly currentLang: Signal<SupportedLang> = this.langSignal.asReadonly();
  readonly currentDir: Signal<Direction> = computed(() => directionForLang(this.langSignal()));
  readonly lang: Signal<SupportedLang> = this.currentLang;
  readonly dir: Signal<Direction> = this.currentDir;

  constructor() {
    this.translate.addLangs([...SUPPORTED_LANGS]);
    const initial = this.resolveInitialLang();
    this.applyDomAttributes(initial);
    this.langSignal.set(initial);
  }

  async init(): Promise<void> {
    const initial = this.langSignal();
    await firstValueFrom(this.translate.use(initial));
  }

  setLang(lang: unknown): void {
    const validated: SupportedLang = isSupportedLang(lang) ? lang : DEFAULT_LANG;
    this.langSignal.set(validated);
    this.applyDomAttributes(validated);
    this.cookies.set(LANG_COOKIE_NAME, validated);
    this.translate.use(validated).subscribe();
  }

  setLanguage(lang: unknown): void {
    this.setLang(lang);
  }

  private resolveInitialLang(): SupportedLang {
    const cookieLang = this.cookies.get(LANG_COOKIE_NAME);
    if (isSupportedLang(cookieLang)) {
      return cookieLang;
    }

    const acceptLanguage = this.cookies.getAcceptLanguageHeader();
    if (acceptLanguage) {
      const detectedFromHeader = this.matchSupportedFromList(
        acceptLanguage.split(',').map((part) => part.split(';')[0]?.trim() ?? ''),
      );
      if (detectedFromHeader) {
        return detectedFromHeader;
      }
    }

    const browserLangs = this.cookies.getBrowserLanguages();
    const detectedFromBrowser = this.matchSupportedFromList(browserLangs);
    if (detectedFromBrowser) {
      return detectedFromBrowser;
    }

    return DEFAULT_LANG;
  }

  private matchSupportedFromList(candidates: readonly string[]): SupportedLang | null {
    for (const candidate of candidates) {
      const normalized = candidate.trim().toLowerCase();
      if (normalized.startsWith('ar')) {
        return 'ar';
      }
      if (normalized.startsWith('en')) {
        return 'en';
      }
    }
    return null;
  }

  private applyDomAttributes(lang: SupportedLang): void {
    const root = this.document.documentElement;
    if (!root) {
      return;
    }
    root.setAttribute('lang', lang);
    root.setAttribute('dir', directionForLang(lang));
  }
}
