import { DOCUMENT } from '@angular/common';
import { inject, RESPONSE_INIT, Service } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LocaleService } from '@core/i18n';

export type SeoPageType = 'website' | 'article' | 'profile' | 'video.other';

export type SeoHreflang = 'ar' | 'en' | 'x-default';

export interface SeoAlternateLink {
  readonly hreflang: SeoHreflang;
  readonly href: string;
}

export interface PageSeoConfig {
  readonly title: string;
  readonly description?: string;
  readonly canonical?: string;
  readonly image?: string;
  readonly type?: SeoPageType;
  readonly noindex?: boolean;
  readonly rawTitle?: boolean;
  readonly alternates?: readonly SeoAlternateLink[];
  readonly status?: number;
}

export type JsonLdSchema = Record<string, unknown>;

export const SEO_SITE_NAME = 'Starter';
export const SEO_TITLE_SEPARATOR = ' | ';

const JSON_LD_SCRIPT_ID = 'app-seo-jsonld';
const CANONICAL_SELECTOR = 'link[rel="canonical"]';
const HREFLANG_ATTR = 'data-app-seo';

/**
 * خدمة الـ SEO الموحّدة والمتوافقة مع SSR لإدارة عناوين الصفحات، ووسوم Open Graph / Twitter،
 * وروابط `canonical` و `hreflang`، وبيانات `JSON-LD` المنظمة، وكود حالة HTTP على الخادم.
 *
 * ### متى تُستخدم؟
 * - تُستخدم فقط داخل مكونات الصفحات المرتبطة بالمسارات (`pages/` مثل `*.page.ts`)، وممنوع حقنها في مكونات الـ UI الفرعية (`ui/` أو `shared/ui/`).
 * - **Public pages**: use `setPage()` and optionally `setJsonLd()`.
 * - **Private application pages**: use `setTitle()` or `noindex: true` as appropriate.
 *
 * @example
 * // 1) صفحة عامة ثابتة مترجمة (استخدام toSignal + effect)
 * private readonly seo = inject(SeoService);
 * private readonly translate = inject(TranslateService);
 * private readonly title = toSignal(this.translate.stream('common.app_name'), { initialValue: SEO_SITE_NAME });
 * private readonly description = toSignal(this.translate.stream('common.tagline'), { initialValue: '' });
 *
 * constructor() {
 *   effect(() => {
 *     this.seo.setPage({
 *       title: this.title(),
 *       description: this.description() || undefined,
 *       canonical: 'https://starter.com/',
 *     });
 *   });
 * }
 *
 * @example
 * // 2) صفحة ديناميكية من الباك إند (تفاصيل كورس عبر resourceById)
 * private readonly seo = inject(SeoService);
 * private readonly repo = inject(CoursesRepository);
 * private readonly destroyRef = inject(DestroyRef);
 * readonly id = input.required<string>();
 * readonly courseResource = this.repo.resourceById(() => this.id());
 *
 * constructor() {
 *   effect(() => {
 *     if (this.courseResource.error()) {
 *       this.seo.setNotFound('الكورس غير موجود');
 *       return;
 *     }
 *     if (this.courseResource.hasValue()) {
 *       const course = this.courseResource.value();
 *       if (!course) return;
 *       this.seo.setPage({
 *         title: course.title,
 *         description: course.shortDescription,
 *         image: course.thumbnailUrl,
 *         canonical: `https://starter.com/courses/${course.slug}`,
 *         type: 'article',
 *       });
 *       this.seo.setJsonLd({
 *         '@context': 'https://schema.org',
 *         '@type': 'Course',
 *         name: course.title,
 *         description: course.shortDescription,
 *         provider: { '@type': 'Organization', name: SEO_SITE_NAME },
 *       });
 *     }
 *   });
 *   this.destroyRef.onDestroy(() => this.seo.clearJsonLd());
 * }
 */
@Service()
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly locale = inject(LocaleService, { optional: true });
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  /**
   * يضبط كافة وسوم الـ SEO الأساسية للصفحة في خطوة واحدة (`<title>`، `description`،
   * Open Graph، Twitter Cards، `canonical`، روابط `hreflang`، `robots`، وكود SSR).
   * مناسبة للصفحات العامة وصفحات تفاصيل الكورسات والمدرسين.
   */
  setPage(config: PageSeoConfig): void {
    this.setTitle(config.title, config.rawTitle);

    this.meta.updateTag({
      name: 'robots',
      content: config.noindex ? 'noindex, nofollow' : 'index, follow',
    });
    this.meta.updateTag({
      property: 'og:type',
      content: config.type ?? 'website',
    });
    this.meta.updateTag({
      property: 'og:locale',
      content: this.locale?.lang() === 'en' ? 'en_US' : 'ar_EG',
    });
    this.meta.updateTag({
      name: 'twitter:card',
      content: config.image ? 'summary_large_image' : 'summary',
    });

    this.syncOptionalMeta('name', 'description', config.description);
    this.syncOptionalMeta('property', 'og:description', config.description);
    this.syncOptionalMeta('name', 'twitter:description', config.description);

    this.syncOptionalMeta('property', 'og:url', config.canonical);
    this.syncCanonicalLink(config.canonical);

    this.syncOptionalMeta('property', 'og:image', config.image);
    this.syncOptionalMeta('name', 'twitter:image', config.image);

    this.syncAlternateLinks(config.alternates ?? []);

    if (config.status !== undefined) {
      this.setStatus(config.status);
    }
  }

  /**
   * يحدّث عنوان التبويب (`<title>` و `og:title` و `twitter:title`) فقط مع لاحقة `| Starter`
   * ما لم يُمرّر `rawTitle: true`. مناسبة لصفحات لوحات التحكم بعد تسجيل الدخول.
   */
  setTitle(title: string, rawTitle = false): void {
    const suffix = `${SEO_TITLE_SEPARATOR}${SEO_SITE_NAME}`;
    const formatted = rawTitle || !title || title.endsWith(suffix) ? title : `${title}${suffix}`;

    this.title.setTitle(formatted);
    this.meta.updateTag({ property: 'og:title', content: formatted });
    this.meta.updateTag({ name: 'twitter:title', content: formatted });
  }

  /** يضبط كود استجابة HTTP الحقيقي في مرحلة الـ SSR عبر `RESPONSE_INIT` (دون أثر في المتصفح). */
  setStatus(status: number): void {
    if (this.responseInit) {
      this.responseInit.status = status;
    }
  }

  /**
   * يمسح أي بيانات `JSON-LD` سابقة ويضبط الصفحة على `noindex, nofollow`
   * مع إرجاع كود HTTP `404` حقيقي في الـ SSR لتفادي مشكلة Soft-404.
   */
  setNotFound(title: string, description?: string): void {
    this.clearJsonLd();
    this.setPage({
      title,
      description,
      noindex: true,
      status: 404,
    });
  }

  /**
   * يدرج أو يحدّث وسم البيانات المنظمة `<script id="app-seo-jsonld" type="application/ld+json">`
   * في `<head>` لمساعدة Google على فهم نوع المحتوى (مثل `Course`) وعرض نتائج غنية (Rich Results
   * كالنجوم والسعر واسم المدرس). اختيارية ومخصصة للصفحات العامة المهمة.
   */
  setJsonLd(schema: JsonLdSchema | readonly JsonLdSchema[]): void {
    const head = this.document.head;
    if (!head) return;

    let script = this.document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = JSON_LD_SCRIPT_ID;
      script.type = 'application/ld+json';
      head.appendChild(script);
    }

    script.textContent = JSON.stringify(schema);
  }

  /** يزيل وسم `JSON-LD` من `<head>` عند مغادرة الصفحة (يفضل استدعاؤها مع `DestroyRef.onDestroy`). */
  clearJsonLd(): void {
    this.document.getElementById(JSON_LD_SCRIPT_ID)?.remove();
  }

  private syncOptionalMeta(attr: 'name' | 'property', key: string, value?: string): void {
    if (value) {
      this.meta.updateTag({ [attr]: key, content: value });
      return;
    }
    this.meta.removeTag(`${attr}="${key}"`);
  }

  private syncCanonicalLink(canonical?: string): void {
    const head = this.document.head;
    if (!head) return;

    const existing = head.querySelector(CANONICAL_SELECTOR) as HTMLLinkElement | null;
    if (!canonical) {
      existing?.remove();
      return;
    }

    const link = existing ?? this.document.createElement('link');
    link.rel = 'canonical';
    link.href = canonical;
    if (!existing) {
      head.appendChild(link);
    }
  }

  private syncAlternateLinks(alternates: readonly SeoAlternateLink[]): void {
    const head = this.document.head;
    if (!head) return;

    const previous = head.querySelectorAll(`link[rel="alternate"][${HREFLANG_ATTR}="hreflang"]`);
    previous.forEach((node) => node.remove());

    for (const alt of alternates) {
      const link = this.document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = alt.hreflang;
      link.href = alt.href;
      link.setAttribute(HREFLANG_ATTR, 'hreflang');
      head.appendChild(link);
    }
  }
}
