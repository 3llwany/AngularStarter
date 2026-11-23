import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { NotFoundPageComponent } from './not-found.page';

describe('NotFoundPageComponent', () => {
  it('renders translated 404 skeleton, sets noindex meta tag, and assigns SSR status 404', () => {
    const responseInit: ResponseInit = {};

    TestBed.configureTestingModule({
      imports: [NotFoundPageComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: RESPONSE_INIT, useValue: responseInit },
      ],
    });

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      errors: {
        not_found: {
          badge: '404',
          seo_title: 'Page Not Found (404)',
          title: 'Page not found',
          description: 'Missing page',
          back_home: 'Back to home',
        },
      },
    });
    translate.use('en');

    const fixture = TestBed.createComponent(NotFoundPageComponent);
    fixture.detectChanges();

    const meta = TestBed.inject(Meta);
    expect(meta.getTag('name="robots"')?.content).toBe('noindex, nofollow');
    expect(responseInit.status).toBe(404);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Page not found');
  });
});
