# أبحاث التصميم والقرارات التقنية: المرحلة الثانية — البنية التحتية (`002-core-infrastructure`)

**الفرع**: `002-core-infrastructure` | **التاريخ**: 2026-11-15 | **المواصفة**: [spec.md](spec.md)

**المصادر**: أداة وثائق Angular v22 الرسمية عبر `@angular/cli` MCP، فحص الشيفرة القائمة في `src/app/core/**` و `src/app/shared/ui/toast/**`، ملف `sheriff.config.ts`، الدستور، وملف `AGENTS.md`.

---

## D1 — نقل الجلسة واستعادة البدء المشروطة (`ADR-0005`)

- **القرار**:
  - عزل آليات نقل الجلسة (كوكي التلميح غير الحساس `SESSION_HINT_COOKIE = 'moz_session_hint'` ودالة `shouldAttemptSessionRestore`) في ملف واحد `src/app/core/auth/session-transport.ts`.
  - في بيئة **SSR** (`!isPlatformBrowser`): يُعلِّم `provideAppInitializer` الحالة فوراً كـ `'anonymous'` دون طلبات شبكة لمنع أي تسرب بين الطلبات المتزامنة.
  - في **المتصفح**: يتم استدعاء `authService.restoreSession()` فقط إذا وُجد كوكي التلميح أو بدأ المستخدم من `/auth/**` أو أحد مسارات الأدوار؛ أما الصفحات العامة فتفتح فوراً بحالة `'anonymous'` دون تأخير.
  - حراس المسارات يستدعون `ensureSessionResolved()` بدمج الاستدعاءات المتزامنة في وعد (`Promise`) واحد عند بقاء الحالة `'unknown'`.
- **السبب**: حماية الزوار ومحركات البحث من بطء فحص الجلسة وضمان عدم كتابة أي توكن في `localStorage` أو `sessionStorage`.

---

## D2 — نمط الاستراتيجيات والسجل المتعدد (`ADR-0006`)

- **القرار**: تعريف واجهة `AuthStrategy` ورمز `AUTH_STRATEGIES` متعدد المزودين وخدمة `AuthStrategyFactory` (`@Service()`), مع حصر جميع تعابير التحقق المبدئية في `src/app/core/auth/strategies/identifier-patterns.ts`.
- **السبب**: تحقيق مبدأ Open/Closed بحيث تتم إضافة استراتيجية دور سادس بتسجيل مزود جديد فقط عبر `provideAuthStrategy(...)` دون تعديل المصنع أو الاستراتيجيات الخمس الموجودة.

---

## D3 — حماية المسارات وعزل التحميل الكسول via `CanMatchFn`

- **القرار**: تنفيذ `roleGuard(expectedRole)` و `guestGuard` باستخدام `CanMatchFn`، و `roleRedirectGuard` باستخدام `CanActivateFn`، مع إرجاع `UrlTree` عبر `router.createUrlTree(...)`.
- **البديل المرفوض**: استخدام `canActivate` لمسارات الأدوار، لأنه يسمح للراوتر بتحميل حزمة الـ JS الكسولة للدور قبل فحص الصلاحية.

---

## D4 — سلسلة الـ HTTP Interceptors وكاش النقل SSR

- **القرار**:
  - توسيع `http.context.ts` برموز `SKIP_CREDENTIALS` و `SKIP_ERROR_TOAST` ودالة `isStaticAssetUrl`.
  - إضافة `credentialsInterceptor` و `localeHeaderInterceptor` و `errorMappingInterceptor` ضمن `provideMozHttp()` مع تعليق يحجز موضع `loadingInterceptor` للمرحلة الثالثة.
  - ضبط `withHttpTransferCacheOptions` في `provideClientHydration(...)` داخل `core.providers.ts` لكاش الطلبات العامة فقط ومنع تخزين الطلبات الحاملة للكوكيز أو الترويسات الأمنية أو `/auth/*` أو `POST`.

---

## D5 — خدمة الـ SEO ومولّدات `JSON-LD` وكود `404` عبر `RESPONSE_INIT` (`ADR-0007`)

- **القرار**: استخدام `Title` و `Meta` و `DOCUMENT` و `LocaleService` و `RESPONSE_INIT` (`@angular/core`) داخل `SeoService` لتوحيد ضبط العنوان، الوصف، `canonical`، `hreflang`، `JSON-LD`، `noindex`، وكود `404` الحقيقي في الـ SSR عند ضبط مسار `**` بنمط `RenderMode.Server`؛ وإنشاء `public/robots.txt`.

---

## D6 و D7 — سجل التنقل `NAV_ITEMS` وناقل الأحداث `EventBusService`

- **القرار**:
  - `provideNavItems(items)` يسجل عناصر الميزات في الرمز المتعدد `NAV_ITEMS`، وتعرض `NavService` إشارات `computed()` مصفّاة ومرتبة حسب `order`.
  - `EventBusService` يعتمد على RxJS `Subject` لكل نسخة DI (بدلاً من Signals منفردة) لئلا تسقط الأحداث المتزامنة السريعة، مع إشارة `lastEvent` للمراقبة.

---

## D8 و D9 و D10 — جسر الأخطاء `TOAST_PORT` وتوزيع المسارات والانحرافات

- **القرار**: إعادة استخدام `ToastService` الموجودة في `src/app/shared/ui/toast/` (بفصلها إلى `toast.service.ts` لمنع تضخم الحزمة الابتدائية فوق `500 kB`) وربطها بالـ `core` عبر `TOAST_PORT` في `app.config.ts` دون كسر حدود Sheriff. كما يضبط `HAS_DEV_ROUTES` مسارات السيرفر التطويرية في `app.routes.server.ts`.
