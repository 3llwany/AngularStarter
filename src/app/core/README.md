# `src/app/core` — نواة التطبيق والبنية التحتية المركزية

يضم هذا المجلد الخدمات المفردة المركزية (Singletons)، ومغلفات البيئة الآمنة لـ **SSR**، وإعدادات الإطار العام للتطبيق:

- `assets/`: ثوابت مسارات الأصول الثابتة (`APP_ASSETS` في `app-assets.ts`) المتوافقة مع `NgOptimizedImage`.
- `auth/`: المصادقة، جدول طرق الدخول (`LOGIN_METHODS` في `login-methods.ts`)، وإدارة الجلسة بالـ Signals (`AuthService`).
- `guards/`: حراس المسارات (`roleGuard`, `roleRedirectGuard`, `guestGuard` في `auth.guards.ts`).
- `http/`: عميل `ApiClient` وسياق الطلبات (`http.context.ts`).
- `interceptors/`: سلسلة الـ Interceptors (`apiBaseUrl`, `commonParams`, `credentials`, `localeHeader`, `errorMapping`، بالإضافة إلى `loadingInterceptor` الاختياري غير المفعّل افتراضياً).
- `layout/`: خدمة تخطيط الواجهة (`LayoutService` و `ROLE_LAYOUT_MODE` في `layout.service.ts`) لتبديل عرض الروابط بين `Navbar` و `Sidebar` حسب الدور أو يدوياً.
- `errors/`: نموذج الخطأ الموحّد والمحوّل (`app-error.ts`) ومعالج الأخطاء العام وربط التوست (`GlobalErrorHandler` و `TOAST_HANDLER` في `global-error-handler.ts`).
- `routes/`: ثوابت المسارات المركزية (`APP_ROUTES` و `buildAppRoute` في `app-routes.ts`) مع المثال المعقد للمسارات المتداخلة.
- `seo/`: خدمة `SeoService` (`seo.service.ts`) لإدارة وسوم الـ SEO و `JSON-LD` وكود الحالة في SSR عبر `RESPONSE_INIT`.
- `navigation/`: خدمة قائمة التنقل للمستخدم (`NavService` و `USER_MENU_ENDPOINT` في `nav.service.ts`) عبر `ApiClient.resource()`.
- `providers/`: جميع ملفات تسجيل الخدمات عند تشغيل التطبيق (`provideCore`، و `auth/http/i18n/primeng.providers.ts`).
- `theme/` و `i18n/` و `config/` و `platform/` و `loading/` و `file/` و `data-access/`.

## قواعد الحدود المعمارية (تُفرَض عبر Sheriff و ESLint)

- **الاستيراد المسموح**: الحزم الخارجية، والملفات الأخرى داخل `src/app/core/**`.
- **الاستيراد الممنوع**: `src/app/features/**` و `src/app/shared/**`.
- **متوافق مع SSR**: استخدام `DOCUMENT` و `REQUEST` و `PLATFORM_ID` و `RESPONSE_INIT` دائماً؛ يُمنع استخدام `window` أو `document` أو `localStorage`/`sessionStorage` مباشرة.
