import { TestBed } from '@angular/core/testing';
import { MissingTranslationHandlerParams, TranslateService } from '@ngx-translate/core';
import { describe, expect, it, vi } from 'vitest';
import {
  MozMissingTranslationHandler,
  THROW_ON_MISSING_TRANSLATION,
} from './missing-translation.handler';

describe('MozMissingTranslationHandler', () => {
  it('logs an error and returns a visible marker in dev mode when THROW_ON_MISSING_TRANSLATION is false', () => {
    TestBed.configureTestingModule({});
    const handler = TestBed.inject(MozMissingTranslationHandler);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = handler.handle({
      key: 'common.non_existent_key',
      translateService: {} as TranslateService,
    } satisfies MissingTranslationHandlerParams);

    expect(result).toBe('⚠ [common.non_existent_key]');
    expect(errorSpy).toHaveBeenCalledWith(
      '[Mozakrety i18n] Missing translation for key: "common.non_existent_key"',
    );
    errorSpy.mockRestore();
  });

  it('throws loudly when THROW_ON_MISSING_TRANSLATION is enabled', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: THROW_ON_MISSING_TRANSLATION, useValue: true }],
    });
    const handler = TestBed.inject(MozMissingTranslationHandler);

    expect(() =>
      handler.handle({
        key: 'common.missing_strict',
        translateService: {} as TranslateService,
      }),
    ).toThrowError('[Mozakrety i18n] Missing translation for key: "common.missing_strict"');
  });
});
