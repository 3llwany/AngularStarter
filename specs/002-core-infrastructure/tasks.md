# المهام التنفيذية: المرحلة الثانية — البنية التحتية الأساسية للتطبيق (`002-core-infrastructure`)

**المدخلات**: وثائق التصميم في `/specs/002-core-infrastructure/` (`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/core-contracts.md`)

## المرحلة 1: التهيئة وفصل خدمة التوست في المكتبة المشتركة

- [X] T001 مراجعة `.gitignore` و `.prettierignore` وضبط نظافة التهيئة دون إضعاف أي قاعدة جودة
- [X] T002 فصل `ToastService` و `ToastOptions` و `ToastSeverity` من `src/app/shared/ui/toast/toast.ts` إلى `src/app/shared/ui/toast/toast.service.ts` وإعادة تصديرها من `toast.ts` و `src/app/shared/ui/index.ts`
- [X] T003 تحديث `docs/ui-library-contributions.md` لتوثيق فصل `toast.service.ts` المتوافق عكسياً

---

## المرحلة 2: الأساسات (الترجمة، نموذج الأخطاء، منفذ التوست، وناقل الأحداث)

**الهدف**: بناء الركائز الأساسية المشتركة قبل تطبيق قصص المستخدم.

- [X] T004 إضافة مفاتيح `auth.*` و `errors.*` متطابقة في `public/i18n/ar.json` و `public/i18n/en.json`
- [X] T005 [P] إنشاء `src/app/core/errors/app-error.model.ts` (`AppError`, `AppErrorCode`, `createAppError`, `isAppError`)
- [X] T006 إنشاء `src/app/core/errors/error-mapper.ts` (`mapHttpErrorToAppError`) لتحويل أكواد HTTP والأخطاء غير المتوقعة إلى `AppError` مترجم
- [X] T007 [P] إنشاء `src/app/core/errors/error-mapper.spec.ts` لتغطية أخطاء الشبكة والمهلة و400/401/403/404/422/429/5xx والخطأ الافتراضي
- [X] T008 [P] إنشاء `src/app/core/errors/toast.port.ts` (`TOAST_PORT`, `ToastPort`, `ToastPortOptions`) و `src/app/core/errors/notification.service.ts` (`NotificationService`)
- [X] T009 إنشاء `src/app/core/errors/global-error.handler.ts` (`GlobalErrorHandler`) و `src/app/core/errors/global-error.handler.spec.ts`
- [X] T010 [P] إنشاء `src/app/core/events/domain-event.model.ts` (`DomainEvent`, `createDomainEvent`) و `src/app/core/events/event-bus.service.ts` (`EventBusService`)
- [X] T011 [P] إنشاء `src/app/core/events/event-bus.service.spec.ts` للتحقق من البث المحدد النوع والتصفية عبر `.on(type)` وإشارة `lastEvent`

---

## المرحلة 3: قصة المستخدم 1 — المصادقة المعتمدة على الدور ونظام الاستراتيجيات (أولوية P1)

**الهدف**: توفير إدارة الجلسة بالـ Signals (`user`, `role`, `status`)، واستراتيجيات الدخول القابلة للتمديد، ومحاكاة الـ API، واستعادة الجلسة بأمان مع SSR دون تخزين توكنات في المتصفح.

- [X] T012 [US1] إنشاء `src/app/core/auth/models/auth.models.ts` (`AuthUser`, `AuthStatus`, نماذج بيانات الدخول لكل دور، `RoleCredentialsInput`, `AuthLoginPayload`)
- [X] T013 [P] [US1] إنشاء `src/app/core/auth/strategies/identifier-patterns.ts` يجمع أنماط التحقق المبدئية (Provisional) للأدوار الخمسة في ملف واحد
- [X] T014 [US1] إنشاء `src/app/core/auth/strategies/auth-strategy.ts` و `src/app/core/auth/strategies/role-strategies.ts` (الاستراتيجيات الخمس + `provideDefaultAuthStrategies()`)
- [X] T015 [US1] إنشاء `src/app/core/auth/strategies/auth-strategy.factory.ts` (`AuthStrategyFactory`)
- [X] T016 [P] [US1] إنشاء `auth-api.ts` و `mock-auth.api.ts` (بتأخير وأخطاء قابلة للضبط) و `http-auth.api.ts` (قالب مع تعليقات `TODO(backend-contract)`)
- [X] T017 [P] [US1] إنشاء `src/app/core/auth/session-transport.ts` لعزل كوكي تلميح الجلسة ودالة `shouldAttemptSessionRestore()`
- [X] T018 [US1] إنشاء `src/app/core/auth/auth.service.ts` و `src/app/core/auth/auth.service.spec.ts`
- [X] T019 [US1] إنشاء `src/app/core/auth/auth.providers.ts` (`provideMozAuth()`) متضمناً `provideAppInitializer` المشروط للمتصفح فقط

---

## المرحلة 4: قصة المستخدم 2 — حماية المسارات وعزل الأدوار (أولوية P1)

**الهدف**: فرض عزل المسارات عبر `canMatch` وتوجيه الأدوار وحماية مسارات الضيوف باستخدام `UrlTree`.

- [X] T020 [US2] تطبيق `roleGuard(role)` (`CanMatchFn`) في `src/app/core/auth/guards/auth.guards.ts`
- [X] T021 [US2] تطبيق `roleRedirectGuard` (`CanActivateFn`) في `src/app/core/auth/guards/auth.guards.ts`
- [X] T022 [US2] تطبيق `guestGuard` (`CanMatchFn`) في `src/app/core/auth/guards/auth.guards.ts`
- [X] T023 [US2] تصدير `ROLE_HOME_PATHS` و `getRoleHomePath(role)` في `src/app/core/auth/models/auth.models.ts`
- [X] T024 [US2] إنشاء `src/app/core/auth/guards/auth.guards.spec.ts` لتغطية الزائر المجهول والدور الخاطئ والدور الصحيح واستعادة الجلسة عند إعادة التحميل و `guestGuard`

---

## المرحلة 5: قصة المستخدم 3 — القابلية للتمديد وفق مبدأ Open/Closed (أولوية P2)

**الهدف**: إثبات إضافة استراتيجية سادسة وعناصر تنقل من الميزات عبر DI multi-tokens دون تعديل أي كود قائم.

- [X] T025 [US3] إنشاء `src/app/core/auth/strategies/auth-strategy.factory.spec.ts` يثبت الاستراتيجيات الخمس وإضافة استراتيجية سادسة دون تعديل الاستراتيجيات الموجودة
- [X] T026 [P] [US3] إنشاء `src/app/core/navigation/nav-item.model.ts` (`NavItem`, `NAV_ITEMS`, `provideNavItems()`)
- [X] T027 [US3] إنشاء `src/app/core/navigation/nav.service.ts` (`NavService` بإشارات `computed` مفلترة حسب الدور ومرتبة حسب `order`)
- [X] T028 [US3] إنشاء `src/app/core/navigation/nav.service.spec.ts` لإثبات تسجيل عناصر الميزات دون لمس أي Shell

---

## المرحلة 6: قصة المستخدم 4 — البنية التحتية للـ HTTP وكاش SSR Transfer (أولوية P2)

**الهدف**: توحيد إرسال الكوكيز، ترويسة `Accept-Language`، تحويل أخطاء HTTP لتنبيهات مترجمة، حجز مكان الـ loading interceptor، وضبط كاش النقل في SSR.

- [X] T029 [P] [US4] توسيع `src/app/core/http/http.context.ts` برمزي `SKIP_CREDENTIALS` و `SKIP_ERROR_TOAST` ودالة `isStaticAssetUrl`
- [X] T030 [US4] إنشاء `credentials.interceptor.ts` و `credentials.interceptor.spec.ts`
- [X] T031 [US4] إنشاء `locale-header.interceptor.ts` و `locale-header.interceptor.spec.ts`
- [X] T032 [US4] إنشاء `error-mapping.interceptor.ts` و `error-mapping.interceptor.spec.ts`
- [X] T033 [US4] تحديث `src/app/core/http/http.providers.ts` (`provideMozHttp()`) بترتيب السلسلة الكامل والتعليق المحجوز لـ `loadingInterceptor`
- [X] T034 [US4] تحديث `src/app/core/config/core.providers.ts` بـ `withHttpTransferCacheOptions` وتوثيق الطلبات المخزنة والمستبعدة

---

## المرحلة 7: قصة المستخدم 5 — الـ SEO الآمن للـ SSR، البيانات المنظمة، `robots.txt` وصفحة 404 (أولوية P2)

**الهدف**: خدمة SEO موحدة مع مولّدات JSON-LD و `hreflang` و `noindex` وكود 404 حقيقي في الـ SSR عبر `RESPONSE_INIT`.

- [X] T035 [P] [US5] إنشاء `src/app/core/seo/seo.models.ts` و `src/app/core/seo/json-ld.builders.ts` (`Person`, `Course`, `VideoObject`, `EducationalOrganization`, `BreadcrumbList`)
- [X] T036 [US5] إنشاء `src/app/core/seo/seo.service.ts` و `src/app/core/seo/seo.service.spec.ts`
- [X] T037 [US5] إنشاء `not-found.page.ts` و `not-found.page.spec.ts` و `error.providers.ts` (`provideMozErrors()`)
- [X] T038 [P] [US5] إنشاء `public/robots.txt` لمنع أرشفة مسارات الأدوار و `/auth` و `/dashboard` و `/dev` مع تعليق رابط Sitemap المستقبلي

---

## المرحلة 8: التشطيب، ربط المسارات، قرارات ADR، التوثيق، وبوابات الجودة

- [X] T039 إنشاء هياكل المسارات الكسولة تحت `src/app/features/*/*.routes.ts` وربط `app.routes.ts` و `app.routes.server.ts` و `app.config.ts`
- [X] T040 [P] كتابة سجلات ADR (`0005`, `0006`, `0007`) تحت `docs/adr/`
- [X] T041 تحديث `AGENTS.md` بأدلة التمديد للمرحلة الثانية وضبط `sheriff.config.ts`
- [X] T042 تشغيل بوابات الجودة الأربع، التحقق من حالة HTTP `404` الفعلية على خادم SSR، تحديث `tasks.md`، وكتابة `summary.md`
