import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { LocaleService } from '../i18n/locale.service';
import { localeHeaderInterceptor } from './locale-header.interceptor';

describe('localeHeaderInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const mockLang = signal<'ar' | 'en'>('ar');

  beforeEach(() => {
    mockLang.set('ar');
    TestBed.configureTestingModule({
      providers: [
        { provide: LocaleService, useValue: { lang: mockLang } },
        provideHttpClient(withInterceptors([localeHeaderInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sets Accept-Language from LocaleService active language', async () => {
    const firstPromise = firstValueFrom(http.get('/api/profile'));
    const firstReq = httpMock.expectOne('/api/profile');
    expect(firstReq.request.headers.get('Accept-Language')).toBe('ar');
    firstReq.flush({});
    await firstPromise;

    mockLang.set('en');
    const secondPromise = firstValueFrom(http.get('/api/profile'));
    const secondReq = httpMock.expectOne('/api/profile');
    expect(secondReq.request.headers.get('Accept-Language')).toBe('en');
    secondReq.flush({});
    await secondPromise;
  });

  it('preserves explicit Accept-Language header and skips static assets', async () => {
    const customPromise = firstValueFrom(
      http.get('/api/profile', { headers: { 'Accept-Language': 'fr' } }),
    );
    const customReq = httpMock.expectOne('/api/profile');
    expect(customReq.request.headers.get('Accept-Language')).toBe('fr');
    customReq.flush({});
    await customPromise;

    const assetPromise = firstValueFrom(http.get('/i18n/en.json'));
    const assetReq = httpMock.expectOne('/i18n/en.json');
    expect(assetReq.request.headers.has('Accept-Language')).toBe(false);
    assetReq.flush({});
    await assetPromise;
  });
});
