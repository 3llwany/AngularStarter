export const SUPPORTED_LANGS = ['ar', 'en'] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export type Direction = 'rtl' | 'ltr';

export const DEFAULT_LANG: SupportedLang = 'ar';

export const LANG_COOKIE_NAME = 'app_lang';

export function isSupportedLang(value: unknown): value is SupportedLang {
  return typeof value === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

export function directionForLang(lang: SupportedLang): Direction {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
