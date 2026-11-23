import { InjectionToken, makeStateKey } from '@angular/core';

export interface AppConfig {
  readonly apiBaseUrl: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  apiBaseUrl: '',
};

export const APP_CONFIG_STATE_KEY = makeStateKey<AppConfig>('moz.app_config');

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_APP_CONFIG,
});

