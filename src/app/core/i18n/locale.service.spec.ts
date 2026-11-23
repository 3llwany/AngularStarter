import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CookieService } from '../platform/cookie';
import { LocaleService } from './locale.service';

describe('LocaleService', () => {
  let doc: Document;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService({ lang: 'ar', fallbackLang: 'ar' })],
    });
    doc = TestBed.inject(DOCUMENT);
    translateService = TestBed.inject(TranslateService);
    doc.cookie = 'moz_lang=; Path=/; Max-Age=0';
    doc.documentElement.removeAttribute('lang');
    doc.documentElement.removeAttribute('dir');
  });

  it('defaults to "ar" with dir="rtl" when no cookie or matching browser preference exists', () => {
    const cookieService = TestBed.inject(CookieService);
    vi.spyOn(cookieService, 'getBrowserLanguages').mockReturnValue(['fr-FR']);

    const service = TestBed.inject(LocaleService);
    expect(service.currentLang()).toBe('ar');
    expect(service.currentDir()).toBe('rtl');
    expect(doc.documentElement.getAttribute('lang')).toBe('ar');
    expect(doc.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('switches to "en" (ltr), calls TranslateService.use("en"), and persists moz_lang cookie', () => {
    const useSpy = vi.spyOn(translateService, 'use').mockReturnValue(of({}));
    const service = TestBed.inject(LocaleService);

    service.setLang('en');

    expect(service.currentLang()).toBe('en');
    expect(service.currentDir()).toBe('ltr');
    expect(doc.documentElement.getAttribute('lang')).toBe('en');
    expect(doc.documentElement.getAttribute('dir')).toBe('ltr');
    expect(doc.cookie).toContain('moz_lang=en');
    expect(useSpy).toHaveBeenCalledWith('en');
  });

  it('detects "en" from browser languages on first visit when no cookie is present', () => {
    const cookieService = TestBed.inject(CookieService);
    vi.spyOn(cookieService, 'getBrowserLanguages').mockReturnValue(['en-US', 'ar-EG']);

    const service = TestBed.inject(LocaleService);
    expect(service.currentLang()).toBe('en');
    expect(service.currentDir()).toBe('ltr');
  });

  it('discards an invalid cookie and falls back to detected/default language', () => {
    doc.cookie = 'moz_lang=invalid_lang; Path=/';
    const cookieService = TestBed.inject(CookieService);
    vi.spyOn(cookieService, 'getBrowserLanguages').mockReturnValue(['de-DE']);

    const service = TestBed.inject(LocaleService);
    expect(service.currentLang()).toBe('ar');
    expect(service.currentDir()).toBe('rtl');
  });
});
