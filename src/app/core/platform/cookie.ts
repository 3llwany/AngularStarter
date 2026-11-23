import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, PLATFORM_ID, REQUEST, Service } from '@angular/core';

export interface CookieWriteOptions {
  readonly maxAgeSeconds?: number;
  readonly path?: string;
  readonly sameSite?: 'Lax' | 'Strict' | 'None';
  readonly secure?: boolean;
}

const DEFAULT_MAX_AGE_SECONDS = 31536000;

@Service()
export class CookieService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });

  get(name: string): string | null {
    const rawCookieHeader = this.readCookieSource();
    if (!rawCookieHeader) {
      return null;
    }

    const encodedName = encodeURIComponent(name);
    const parts = rawCookieHeader.split(';');
    for (const part of parts) {
      const trimmed = part.trim();
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) {
        continue;
      }
      const key = trimmed.slice(0, eqIndex).trim();
      if (key === encodedName || key === name) {
        const rawVal = trimmed.slice(eqIndex + 1).trim();
        try {
          return decodeURIComponent(rawVal);
        } catch {
          return rawVal;
        }
      }
    }
    return null;
  }

  set(name: string, value: string, options: CookieWriteOptions = {}): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const path = options.path ?? '/';
    const maxAge = options.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
    const sameSite = options.sameSite ?? 'Lax';
    const isSecureOrigin =
      options.secure ?? this.document.defaultView?.location?.protocol === 'https:';

    const segments = [
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
      `Path=${path}`,
      `Max-Age=${String(maxAge)}`,
      `SameSite=${sameSite}`,
    ];

    if (isSecureOrigin) {
      segments.push('Secure');
    }

    try {
      this.document.cookie = segments.join('; ');
    } catch {
      // Browser storage/cookies blocked; keep in-memory state only.
    }
  }

  getAcceptLanguageHeader(): string | null {
    return this.request?.headers.get('accept-language') ?? null;
  }

  getBrowserLanguages(): readonly string[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }
    const nav = this.document.defaultView?.navigator;
    if (!nav) {
      return [];
    }
    if (Array.isArray(nav.languages) && nav.languages.length > 0) {
      return nav.languages;
    }
    return nav.language ? [nav.language] : [];
  }

  private readCookieSource(): string {
    if (isPlatformBrowser(this.platformId)) {
      try {
        return this.document.cookie ?? '';
      } catch {
        return '';
      }
    }
    return this.request?.headers.get('cookie') ?? '';
  }
}
