import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocaleService, SUPPORTED_LANGS, directionForLang } from '@core/i18n';
import { ROLE_PALETTES, contrastRatio } from './role-palettes';
import { ROLES } from './role';
import { ThemeService } from './theme.service';

/**
 * Role × direction matrix: every role theme must work identically in Arabic (RTL) and English (LTR).
 * Color contrast of the CSS tokens themselves is gated by `tools/check-theme-a11y.mjs` (npm run lint).
 */
describe('Theme × Locale matrix (6 roles × ar/rtl + en/ltr)', () => {
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService({ lang: 'ar', fallbackLang: 'ar' })],
    });
    doc = TestBed.inject(DOCUMENT);
    doc.cookie = 'moz_role=; Path=/; Max-Age=0';
    doc.cookie = 'moz_lang=; Path=/; Max-Age=0';
    for (const attr of ['data-role', 'lang', 'dir']) {
      doc.documentElement.removeAttribute(attr);
    }
    vi.spyOn(TestBed.inject(TranslateService), 'use').mockReturnValue(of({}));
  });

  for (const role of ROLES) {
    for (const lang of SUPPORTED_LANGS) {
      const dir = directionForLang(lang);

      it(`applies role "${role}" with lang "${lang}" (${dir}) on <html> independently`, () => {
        const theme = TestBed.inject(ThemeService);
        const locale = TestBed.inject(LocaleService);

        theme.setRole(role);
        locale.setLang(lang);

        const html = doc.documentElement;
        expect(html.getAttribute('data-role')).toBe(role);
        expect(html.getAttribute('lang')).toBe(lang);
        expect(html.getAttribute('dir')).toBe(dir);

        // Switching language must not reset the role, and switching role must not reset direction.
        const otherLang = SUPPORTED_LANGS.find((l) => l !== lang) ?? lang;
        locale.setLang(otherLang);
        expect(theme.currentRole()).toBe(role);
        expect(html.getAttribute('data-role')).toBe(role);

        theme.setRole(role === 'admin' ? 'student' : 'admin');
        expect(locale.currentDir()).toBe(directionForLang(otherLang));
        expect(html.getAttribute('dir')).toBe(directionForLang(otherLang));
      });
    }

    it(`keeps WCAG AA contrast for "${role}" text on tinted (primary-50) surfaces`, () => {
      const { scale } = ROLE_PALETTES[role];
      expect(contrastRatio(scale['700'], scale['50'])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(scale['600'], '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    });
  }
});
