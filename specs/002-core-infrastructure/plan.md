# خطة التنفيذ التقنية: المرحلة الثانية — البنية التحتية الأساسية للتطبيق

**الفرع**: `002-core-infrastructure` | **التاريخ**: 2026-11-15 | **المواصفة**: [spec.md](spec.md)

## الملخص التنفيذي

تشييد البنية التحتية المشتركة لتطبيق مذاكرتي داخل `src/app/core/**` بدون واجهات عرض نهائية أو إطارات (Shells):

- **نطاق المصادقة (`src/app/core/auth/`)**: نماذج المستخدم وحالة الجلسة وبيانات الدخول (`AuthUser`, `AuthStatus`, `Role`)، مجرد `AuthApi` مع رمز الحقن `AUTH_API` ومزود المحاكاة `MockAuthApi` وقالب `HttpAuthApi`، خدمة `AuthService` المبنية على الـ Signals (بدون حالة على مستوى الـ Module وبدون تخزين توكنات في المتصفح)، مصنع وسجل الاستراتيجيات `AuthStrategy` / `AUTH_STRATEGIES` / `AuthStrategyFactory` للأدوار الخمسة مع مركزية الأنماط المؤقتة في `identifier-patterns.ts`، واستعادة الجلسة المشروطة في المتصفح فقط عبر `provideAppInitializer` والمعزولة في `session-transport.ts`.
- **حراس المسارات (`src/app/core/auth/guards/`)**: `roleGuard(role)` (`CanMatchFn`)، و `roleRedirectGuard` (`CanActivateFn`)، و `guestGuard` (`CanMatchFn`) مع إعادة توجيه عبر `UrlTree` لمنع تحميل حزم الأدوار غير المصرح بها.
- **البنية التحتية للـ HTTP (`src/app/core/http/`)**: سلسلة functional interceptors مرتبة (`apiBaseUrlInterceptor`, `commonParamsInterceptor`, `credentialsInterceptor`, `localeHeaderInterceptor`, مكان محجوز لـ `loadingInterceptor` في المرحلة الثالثة، `errorMappingInterceptor`) مسجلة داخل `provideMozHttp()`، وضبط كاش النقل في SSR (`withHttpTransferCacheOptions`) لاستبعاد الطلبات المعتمدة على الكوكيز ومسارات `/auth/`.
- **الـ SEO وحالة SSR (`src/app/core/seo/`)**: خدمة `SeoService` الآمنة للـ SSR، ومولّدات `JSON-LD` (`Person`, `Course`, `VideoObject`, `EducationalOrganization`, `BreadcrumbList`)، وروابط `hreflang`، وكود HTTP `404` الحقيقي عبر `RESPONSE_INIT`، وملف `public/robots.txt`.
- **سجل التنقل وناقل الأحداث**: `NAV_ITEMS` + `provideNavItems()` + `NavService`، و `EventBusService` (RxJS `Subject` + إشارة `lastEvent`).
- **الأخطاء ومنفذ التنبيهات وصفحة 404**: `AppError` + `mapHttpErrorToAppError`، وجسر `TOAST_PORT` لربط `NotificationService` بخدمة `ToastService` في `shared/ui/toast/` مع الحفاظ على حدود Sheriff، ومعالج `GlobalErrorHandler`، وصفحة `NotFoundPageComponent`.

> **سجل التحقق من Angular 22 MCP**:
> تم فحص وثائق Angular v22 عبر أداة `@angular/cli` MCP للتأكد من واجهات `provideAppInitializer`, `RESPONSE_INIT`, `withHttpTransferCacheOptions`, `CanMatchFn`, `HttpInterceptorFn`, `Meta`, و `ErrorHandler`.

## السياق التقني

- **التقنيات**: TypeScript ~6.0 (الوضع الصارم)، Angular ^22.2 بدون `zone.js` مع `@angular/ssr`، `@ngx-translate/core` ^18.1.0، `rxjs`، ومكتبة `shared/ui/toast/`.
- **الاختبارات**: Vitest عبر `ng test` لجميع الخدمات والحراس والـ Interceptors وصفحة 404، وفحص الـ SSR الحقيقي عبر `npm run build` و `server.mjs`.
- **القيود المعمارية**: التزام تام بحدود **Sheriff** (`core` لا يستورد من `shared` أو `features`)، منع استيراد `primeng/*` خارج `shared/ui` و `core/{theme,config}`، الكلاسات المنطقية للاتجاهات فقط (`ms-*`, `me-*`, `text-start`)، والترجمة الكاملة في `ar.json` و `en.json`.

## فحص التوافق مع دستور المشروع (Constitution Check)

| المبدأ | الحالة | آلية التحقق |
|---|---|---|
| I–II. Angular الحديثة + MCP | ناجح | الاعتماد على `@Service()`، `inject()`، Signals، ومراجعة وثائق Angular 22 الرسمية |
| III–IV. الهيكلية وحدود Sheriff | ناجح | التقسيم النظيف تحت `src/app/core/*` واستخدام `TOAST_PORT` في `app.config.ts` لعزل `core` عن `shared` |
| V–VI. التوجيه بالأدوار و SOLID | ناجح | استخدام `CanMatchFn` في `roleGuard(role)` ورموز `multi: true` للاستراتيجيات وقوائم التنقل |
| VII–IX. الحالة، الواجهة والترجمة | ناجح | Signals للحالة، RxJS `Subject` فقط لتيار الأحداث، وفحص `i18n:check` لكل مفتاح نصي |
| X–XV. SSR والـ SEO والأمن والجودة | ناجح | كود `404` عبر `RESPONSE_INIT`، منع `localStorage`/`sessionStorage` للتوكنات، وإعادة استخدام `ToastService` الموجودة |

## هيكل الملفات المنجزة في المرحلة الثانية

```text
src/app/core/
├── auth/{models,api,strategies,guards,auth.service.ts,session-transport.ts,auth.providers.ts}
├── http/{http.context.ts,http.providers.ts,interceptors/}
├── seo/{seo.models.ts,json-ld.builders.ts,seo.service.ts}
├── navigation/{nav-item.model.ts,nav.service.ts}
├── events/{domain-event.model.ts,event-bus.service.ts}
└── errors/{app-error.model.ts,error-mapper.ts,toast.port.ts,notification.service.ts,global-error.handler.ts,error.providers.ts,not-found.page.ts}
```
