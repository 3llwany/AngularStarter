import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, PLATFORM_ID, Service, signal, TransferState } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG_STATE_KEY, AppConfig, DEFAULT_APP_CONFIG } from './app-config';

@Service()
export class AppConfigService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  private readonly http = inject(HttpClient);

  private readonly _config = signal<AppConfig>(DEFAULT_APP_CONFIG);

  /** Readonly signal holding the active runtime configuration. */
  readonly config = this._config.asReadonly();

  /** Convenience computed signal for the base API URL without trailing slash. */
  readonly apiBaseUrl = computed(() => {
    const raw = this._config().apiBaseUrl.trim();
    return raw.endsWith('/') ? raw.slice(0, -1) : raw;
  });

  /**
   * Initializes application configuration.
   * Reads from public/config.json as the SINGLE source of truth (works on both Server SSR and Browser).
   * Supports server-side environment override (API_BASE_URL) for Docker deployments,
   * and transfers the loaded config to the client via TransferState for zero hydration latency.
   */
  async loadConfig(): Promise<AppConfig> {
    const isBrowser = isPlatformBrowser(this.platformId);

    // 1. If TransferState has the key (client-side after SSR hydration), use it immediately
    if (this.transferState.hasKey(APP_CONFIG_STATE_KEY)) {
      const stateConfig = this.transferState.get(APP_CONFIG_STATE_KEY, DEFAULT_APP_CONFIG);
      this.transferState.remove(APP_CONFIG_STATE_KEY);
      this._config.set(stateConfig);
      return stateConfig;
    }

    // 2. Check if a server environment variable overrides the URL (e.g. in Docker)
    if (!isBrowser) {
      const globalProc = (
        globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }
      ).process;
      const envUrl = globalProc?.env ? globalProc.env['API_BASE_URL'] : undefined;
      if (envUrl?.trim()) {
        const envConfig: AppConfig = { apiBaseUrl: envUrl.trim() };
        this.transferState.set(APP_CONFIG_STATE_KEY, envConfig);
        this._config.set(envConfig);
        return envConfig;
      }
    }

    // 3. Single source of truth: fetch /config.json (works on both SSR server and Browser client)
    try {
      const fetchedConfig = await firstValueFrom(
        this.http.get<AppConfig>('/config.json', { headers: { 'Cache-Control': 'no-cache' } }),
      );
      const mergedConfig: AppConfig = {
        apiBaseUrl: fetchedConfig.apiBaseUrl?.trim() || '',
      };

      if (!isBrowser) {
        // Transfer to browser so client hydration has zero network delay
        this.transferState.set(APP_CONFIG_STATE_KEY, mergedConfig);
      }

      this._config.set(mergedConfig);
      return mergedConfig;
    } catch {
      this._config.set(DEFAULT_APP_CONFIG);
      return DEFAULT_APP_CONFIG;
    }
  }
}
