import { DOCUMENT } from '@angular/common';
import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;
  let titleService: Title;
  let metaService: Meta;
  let doc: Document;
  let responseInit: ResponseInit;

  beforeEach(() => {
    responseInit = {};

    TestBed.configureTestingModule({
      providers: [{ provide: RESPONSE_INIT, useValue: responseInit }],
    });

    seo = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    seo.clearJsonLd();
  });

  it('sets formatted title, meta tags, canonical link, and hreflang alternates', () => {
    seo.setPage({
      title: 'Algebra Basics',
      description: 'Learn Algebra step by step',
      canonical: 'https://starter.com/courses/algebra',
      image: 'https://starter.com/og/algebra.png',
      type: 'article',
      alternates: [
        { hreflang: 'ar', href: 'https://starter.com/ar/courses/algebra' },
        { hreflang: 'en', href: 'https://starter.com/en/courses/algebra' },
        { hreflang: 'x-default', href: 'https://starter.com/courses/algebra' },
      ],
    });

    expect(titleService.getTitle()).toBe('Algebra Basics | Starter');
    expect(metaService.getTag('name="description"')?.content).toBe('Learn Algebra step by step');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Algebra Basics | Starter');
    expect(metaService.getTag('property="og:type"')?.content).toBe('article');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');

    const canonical = doc.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    expect(canonical?.href).toBe('https://starter.com/courses/algebra');

    const hreflangs = doc.head.querySelectorAll('link[rel="alternate"][data-app-seo="hreflang"]');
    expect(hreflangs).toHaveLength(3);
  });

  it('sets noindex, clears JSON-LD, and assigns real SSR 404 status via setNotFound', () => {
    seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Teacher Name',
    });

    seo.setNotFound('Not Found', 'Missing page');

    expect(metaService.getTag('name="robots"')?.content).toBe('noindex, nofollow');
    expect(responseInit.status).toBe(404);
    expect(doc.getElementById('app-seo-jsonld')).toBeNull();
  });

  it('creates valid JSON-LD script tags for schemas passed to setJsonLd', () => {
    seo.setJsonLd([
      { '@context': 'https://schema.org', '@type': 'Course', name: 'Physics 101' },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList' },
    ]);

    const script = doc.getElementById('app-seo-jsonld');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? '[]') as Record<string, unknown>[];
    expect(parsed).toHaveLength(2);
    expect(parsed[0]?.['@type']).toBe('Course');
    expect(parsed[1]?.['@type']).toBe('BreadcrumbList');
  });
});
