import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG_STATE_KEY } from './app-config';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let httpTesting: HttpTestingController;
  let transferState: TransferState;

  describe('on Server (SSR) with environment variable', () => {
    const getProcessEnv = (): Record<string, string | undefined> | undefined =>
      (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;

    const originalApiBaseUrl = getProcessEnv()?.['API_BASE_URL'];

    beforeEach(() => {
      const env = getProcessEnv();
      if (env) {
        env['API_BASE_URL'] = 'https://docker-env-api.mozakrety.com';
      }
      TestBed.configureTestingModule({
        providers: [
          AppConfigService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });
      service = TestBed.inject(AppConfigService);
      transferState = TestBed.inject(TransferState);
    });

    afterEach(() => {
      const env = getProcessEnv();
      if (env) {
        if (originalApiBaseUrl !== undefined) {
          env['API_BASE_URL'] = originalApiBaseUrl;
        } else {
          delete env['API_BASE_URL'];
        }
      }
      TestBed.resetTestingModule();
    });

    it('reads API_BASE_URL from server environment and stores in TransferState', async () => {
      const config = await service.loadConfig();
      expect(config.apiBaseUrl).toBe('https://docker-env-api.mozakrety.com');
      expect(service.apiBaseUrl()).toBe('https://docker-env-api.mozakrety.com');
      expect(transferState.hasKey(APP_CONFIG_STATE_KEY)).toBe(true);
    });
  });

  describe('on Browser with TransferState', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AppConfigService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
      transferState = TestBed.inject(TransferState);
      transferState.set(APP_CONFIG_STATE_KEY, { apiBaseUrl: 'https://staging.mozakrety.com/' });
      service = TestBed.inject(AppConfigService);
    });

    afterEach(() => {
      TestBed.resetTestingModule();
    });

    it('reads config from TransferState and trims trailing slashes without making HTTP calls', async () => {
      const config = await service.loadConfig();
      expect(config.apiBaseUrl).toBe('https://staging.mozakrety.com/');
      expect(service.apiBaseUrl()).toBe('https://staging.mozakrety.com');
      expect(transferState.hasKey(APP_CONFIG_STATE_KEY)).toBe(false);
    });
  });

  describe('Single source of truth: loading /config.json', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AppConfigService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
      service = TestBed.inject(AppConfigService);
      httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpTesting.verify();
      TestBed.resetTestingModule();
    });

    it('fetches /config.json when TransferState is absent', async () => {
      const loadPromise = service.loadConfig();

      const req = httpTesting.expectOne('/config.json');
      expect(req.request.method).toBe('GET');
      req.flush({ apiBaseUrl: 'https://api.mozakrety.com' });

      const config = await loadPromise;
      expect(config.apiBaseUrl).toBe('https://api.mozakrety.com');
      expect(service.apiBaseUrl()).toBe('https://api.mozakrety.com');
    });

    it('falls back gracefully to empty string if /config.json fails', async () => {
      const loadPromise = service.loadConfig();

      const req = httpTesting.expectOne('/config.json');
      req.error(new ProgressEvent('error'));

      const config = await loadPromise;
      expect(config.apiBaseUrl).toBe('');
      expect(service.apiBaseUrl()).toBe('');
    });
  });
});
