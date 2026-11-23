# قرار معماري ADR-0007: خدمة الـ SEO الموحّدة وكود حالة HTTP الحقيقي في الـ SSR

- **الحالة**: مقبول (Accepted) — مُحدّث بعد تبسيط `core/seo/` ونقل صفحة `404`
- **التاريخ**: 2026-11-16
- **السياق**: تحتاج الصفحات العامة وصفحات العرض إلى إدارة موحّدة للعناوين (مع لاحقة `| Mozakrety`)، ووسوم التواصل الاجتماعي (Open Graph / Twitter)، والروابط الأساسية (`canonical`)، ووسوم تعدد اللغات (`hreflang` للعربية والإنجليزية)، وبيانات `JSON-LD` المنظمة، ووسم `noindex`، بالإضافة إلى إرجاع كود الحالة الحقيقي **`404`** في استجابة الـ SSR بدلاً من إرجاع `200 OK` عند المسارات غير الموجودة (تجنباً لمشكلة Soft-404 في محركات البحث).

## القرار

1. **خدمة `SeoService` (`src/app/core/seo/seo.service.ts`)**:
   - تضم الواجهة العامة والأنواع معاً في ملف واحد: `setPage(config)`, `setTitle(title, rawTitle?)`, `setStatus(status)`, `setNotFound(title, description?)`, `setJsonLd(schema)`, `clearJsonLd()`.
   - تعمل بالكامل عبر خدمات مرتبطة بالـ DI لكل طلب/نسخة (`Title`, `Meta`, `DOCUMENT`, `LocaleService`, `RESPONSE_INIT`) دون أي حالة عامة على مستوى الـ Module.
   - تدير وسماً وحيداً `<script type="application/ld+json" id="moz-seo-jsonld">` ووسوم `data-moz-seo="hreflang"` بحيث تُنظَّف وتُحدَّث عند التنقل بين الصفحات دون تراكم.
   - *(ملاحظة)*: أُجِّلت دوال توليد قوالب `JSON-LD` الخاصة بالكورسات والفيديوهات لحين بناء صفحاتها الفعلية في المراحل القادمة، مع بقاء `setJsonLd(schema)` جاهزاً لاستقبال أي كائن بيانات منظمة.

2. **كود الحالة `404` الحقيقي عبر Angular 22 `RESPONSE_INIT`**:
   - يوفّر `@angular/core` الرمز `RESPONSE_INIT: InjectionToken<ResponseInit | null>`.
   - يحقن `SeoService` هذا الرمز اختيارياً (`{ optional: true }`) — إذ يكون `null` في المتصفح وعند البناء الثابت (SSG) — ويضبط `responseInit.status = status` على الخادم.
   - تم نقل مكوّن `NotFoundPageComponent` إلى مكانه المعماري في `src/app/features/public/pages/not-found.page.ts` وضبط مساري `not-found` و `**` في `src/app/app.routes.server.ts` على وضع `RenderMode.Server` ليعرض الخادم صفحة 404 مع وسم `noindex, nofollow` وكود استجابة HTTP `404` فعلي.

3. **سياسة الزحف (`robots.txt`)**:
   - حظر زحف محركات البحث لصفحات `/auth/` وجميع مسارات الأدوار و `/dashboard` و `/dev/` في `public/robots.txt` مع ترك تعليق موثّق لرابط الـ Sitemap المستقبلي.

## النتائج والتبعات

- جميع صفحات التطبيق تتحكم بالـ SEO وكود الـ HTTP من خلال خدمة موحدة واحدة متوافقة مع SSR.
- تم التحقق من استجابة الـ SSR وضبط الـ `404` و `noindex` في الاختبارات وفي خادم الـ SSR المبني.

---

## دليل الاستخدام العملي (متى وكيف تُستخدم SeoService؟)

### 1. أين تُستخدم وأين لا تُستخدم؟
- **لا تُستخدم في مكونات الـ UI الفرعية (`ui/*` أو `shared/ui/*`)**: مثل كروت الكورسات أو الفورم أو المودال؛ لأن الـ SEO يخص الصفحة كاملة.
- **في صفحات لوحات التحكم بعد تسجيل الدخول (`student/`, `teacher/`, `parent/`, `admin/`...)**: محركات البحث لا تتصفح خلف تسجيل الدخول، لذلك يكفي في مكوّن الصفحة استخدام `setTitle(...)` لتحديث عنوان التبويب (أو تمرير `noindex: true`).
- **في الصفحات العامة وتفاصيل الكورسات وبروفايلات المدرسين**: هنا تُستخدم `SeoService` بالكامل عبر `setPage(...)` واختيارياً `setJsonLd(...)` ليظهر العنوان والوصف وصورة المشاركة بشكل صحيح في نتائج بحث Google وعند مشاركة الرابط على واتساب وفيسبوك.

### 2. ملخص دوال الخدمة ومتى تنادي كل دالة

| الدالة | الوظيفة | متى تُستخدم؟ |
|---|---|---|
| `setPage(config)` | تضبط `<title>` والوصف ووسوم Open Graph / Twitter و`canonical` و`hreflang` و`robots` في خطوة واحدة | الصفحات العامة وصفحات تفاصيل الكورسات والمدرسين |
| `setTitle(title, rawTitle?)` | تغيّر عنوان التبويب (`<title>` و `og:title` و `twitter:title`) فقط مع لاحقة `\| Mozakrety` | صفحات لوحات التحكم الداخلية بعد تسجيل الدخول |
| `setNotFound(title, desc?)` | تمسح `JSON-LD` وتضبط `noindex, nofollow` مع إرجاع كود HTTP `404` حقيقي في الـ SSR | صفحة `404` العامة أو عند عدم وجود عنصر مطلوب في الباك إند (راجع [not-found.page.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/features/public/pages/not-found.page.ts)) |
| `setJsonLd(schema)` / `clearJsonLd()` | تدرج وتنظف بيانات منظمة بصيغة `application/ld+json` داخل `<head>` | صفحات تفاصيل الكورس أو بروفايل المدرس أو الصفحة الرئيسية |
| `setStatus(status)` | تضبط كود استجابة HTTP على خادم الـ SSR عبر `RESPONSE_INIT` (اختيارية في المتصفح) | عند الحاجة لتمرير كود حالة HTTP غير `200` مباشرة من الخادم |

### 3. ما فائدة `setJsonLd`؟ (البيانات المنظمة ونتائج Google الغنية)
عندما يزحف Google إلى صفحة كورس، يرى نصوصاً وأرقاماً عادية في الـ HTML. عبر `setJsonLd(schema)` نُعرّف الصفحة رسمياً بصيغة `schema.org` داخل `<script id="moz-seo-jsonld" type="application/ld+json">` ليفهم Google أن هذا المحتوى هو `Course` ويميز اسمه، وسعره، وتقييمه، واسم المدرس/المنظمة.

الفائدة العملية في **نتائج البحث (Rich Results)** هي إمكانية ظهور تفاصيل إضافية مباشرة تحت رابط الصفحة في Google مثل نجوم التقييم أو السعر أو اسم المدرس أو الأسئلة الشائعة (`FAQ`)، وهي **اختيارية** وتُنظّف عند مغادرة الصفحة عبر `clearJsonLd()`.

### 4. مثال عملي مع بيانات الباك إند (صفحة تفاصيل كورس)

عند جلب البيانات عبر `resourceById` (المبنية على `httpResource`)، انتظر وصول البيانات داخل `effect()` في مكوّن الصفحة. في مرحلة الـ SSR ينتظر Angular انتهاء الطلب قبل إرسال الـ HTML، فتظهر البيانات فوراً لروبوتات البحث والمشاركة:

```ts
import { Component, DestroyRef, effect, inject, input } from '@angular/core';
import { SEO_SITE_NAME, SeoService } from '@core/seo';
import { CoursesRepository } from '../data-access/courses.repository';

@Component({
  selector: 'moz-course-details-page',
  template: `
    @if (courseResource.isLoading()) {
      <!-- Skeleton -->
    } @else if (courseResource.hasValue()) {
      <h1>{{ courseResource.value()?.title }}</h1>
    }
  `,
})
export class CourseDetailsPageComponent {
  private readonly seo = inject(SeoService);
  private readonly repo = inject(CoursesRepository);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input.required<string>();
  readonly courseResource = this.repo.resourceById(() => this.id());

  constructor() {
    effect(() => {
      // 1) عند فشل الطلب أو عدم وجود الكورس في الباك إند
      if (this.courseResource.error()) {
        this.seo.setNotFound('الكورس غير موجود');
        return;
      }

      // 2) عند وصول بيانات الكورس من الباك إند
      if (this.courseResource.hasValue()) {
        const course = this.courseResource.value();
        if (!course) return;

        this.seo.setPage({
          title: course.title, // يتحول تلقائياً إلى: "اسم الكورس | Mozakrety"
          description: course.shortDescription,
          image: course.thumbnailUrl,
          canonical: `https://mozakrety.com/courses/${course.slug}`,
          type: 'article',
        });

        // بيانات منظمة اختيارية لظهور الكورس كـ Rich Result في Google
        this.seo.setJsonLd({
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course.title,
          description: course.shortDescription,
          provider: {
            '@type': 'Organization',
            name: SEO_SITE_NAME,
          },
        });
      }
    });

    // إزالة وسم JSON-LD عند الخروج من صفحة الكورس
    this.destroyRef.onDestroy(() => this.seo.clearJsonLd());
  }
}
```
