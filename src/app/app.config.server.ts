import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { TranslationObject } from '@ngx-translate/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { SupportedLang } from './core/i18n/locale';
import { SERVER_TRANSLATION_READER } from './core/i18n/ssr-translate.loader';

async function readServerTranslations(lang: SupportedLang): Promise<TranslationObject> {
  const candidatePaths = [
    resolve(process.cwd(), 'public', 'i18n', `${lang}.json`),
    resolve(process.cwd(), 'dist', 'mozakrety', 'browser', 'i18n', `${lang}.json`),
  ];

  for (const filePath of candidatePaths) {
    try {
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content) as TranslationObject;
    } catch {
      // try next path
    }
  }
  throw new Error(`[Mozakrety SSR i18n] Could not locate translation file for "${lang}".`);
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: SERVER_TRANSLATION_READER,
      useValue: readServerTranslations,
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
