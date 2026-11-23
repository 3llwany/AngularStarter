# ملخص تسليم المرحلة الثانية — البنية التحتية الأساسية للتطبيق (`002-core-infrastructure`)

**التاريخ**: 2026-11-16 (مُحدّث بعد تبسيط هيكل `core/`) | **الحالة**: مكتمل ومُتحقَّق منه

---

## 1. الواجهة البرمجية العامة (Public API) لخدمات الكور والحراس والـ Interceptors

### المصادقة وإدارة الجلسة (`src/app/core/auth/`)
- **`AuthService`** ([auth.service.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/auth/auth.service.ts))
  - `readonly user: Signal<AuthUser | null>`
  - `readonly status: Signal<AuthStatus>` (`'unknown' | 'anonymous' | 'authenticated'`)
  - `readonly role: Signal<Role | null>`
  - `readonly isAuthenticated: Signal<boolean>`
  - `SESSION_HINT_COOKIE = 'moz_session_hint'`
  - `login(role: LoginRole, form: LoginForm): Promise<AuthUser>`
  - `logout(): Promise<void>`
  - `restoreSession(): Promise<AuthUser | null>`
  - `ensureSessionResolved(): Promise<AuthStatus>`
  - `markAnonymous(): void`
  - `handleUnauthorized(): void`
- **طرق الدخول والنماذج** ([auth.models.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/auth/auth.models.ts)، [login-methods.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/auth/login-methods.ts))
  - `roleHomePath(role: Role): string`
  - `LOGIN_METHODS: Readonly<Record<LoginRole, LoginMethod>>` (`student`, `parent`, `teacher`, `school`, `partner`)
  - `isValidIdentifier(role: LoginRole, value: string): boolean`
  - `buildLoginRequest(role: LoginRole, form: LoginForm): LoginRequest`
- **`AuthApi` و `HttpAuthApi` و `MockAuthApi`** ([auth-api.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/auth/auth-api.ts)، [mock-auth-api.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/auth/mock-auth-api.ts))
  - `abstract login(request: LoginRequest): Promise<AuthUser>`
  - `abstract logout(): Promise<void>`
  - `abstract me(): Promise<AuthUser | null>`
  - `MockAuthApi`: `DEMO_PASSWORD`, `delayMs`, `failWith`, `currentUser`, `provideMockAuthApi(): Provider[]`
- **المزوّدات وحراس المسارات** ([auth.providers.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/providers/auth.providers.ts)، [auth.guards.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/guards/auth.guards.ts))
  - `provideMozAuth(options?: AuthOptions): (Provider | EnvironmentProviders)[]`
  - `roleGuard(role: Role): CanMatchFn`
  - `roleRedirectGuard: CanActivateFn`
  - `guestGuard: CanMatchFn`

### البنية التحتية للـ HTTP وكاش SSR
- **رموز السياق والدوال المساعدة** ([http.context.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/http/http.context.ts))
  - `SKIP_BASE_URL`, `SKIP_COMMON_PARAMS`, `SKIP_CREDENTIALS`, `SKIP_ERROR_TOAST`
  - `isStaticAssetUrl(url: string): boolean`
  - `createApiContext(options?: { skipBaseUrl?: boolean; skipCommonParams?: boolean; skipCredentials?: boolean; skipErrorToast?: boolean }): HttpContext`
- **الـ Interceptors والتسجيل** ([credentials.interceptor.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/interceptors/credentials.interceptor.ts)، [locale-header.interceptor.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/interceptors/locale-header.interceptor.ts)، [error-mapping.interceptor.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/interceptors/error-mapping.interceptor.ts)، [http.providers.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/providers/http.providers.ts))
  - `credentialsInterceptor: HttpInterceptorFn`
  - `localeHeaderInterceptor: HttpInterceptorFn`
  - `errorMappingInterceptor: HttpInterceptorFn`
  - `provideMozHttp(): (Provider | EnvironmentProviders)[]` (الترتيب: `apiBaseUrlInterceptor` ← `commonParamsInterceptor` ← `credentialsInterceptor` ← `localeHeaderInterceptor` ← *مكان محجوز لـ `loadingInterceptor` في المرحلة 3* ← `errorMappingInterceptor`)
- **نقطة الدخول الموحدة وكاش النقل في SSR** ([core.providers.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/providers/core.providers.ts))
  - `provideCore(appRoutes, toastHandler?, auth?)`
  - `shouldCacheHttpRequestInTransferState(req: HttpRequest<unknown>): boolean`

### الأخطاء والتنبيهات وصفحة `404` (`src/app/core/errors/` و `src/app/features/public/pages/`)
- **نموذج الخطأ والمحوّل** ([app-error.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/errors/app-error.ts))
  - `createAppError(input: CreateAppErrorInput): AppError`
  - `isAppError(value: unknown): value is AppError`
  - `mapHttpErrorToAppError(error: unknown, notified?: boolean): AppError`
- **معالج الأخطاء العام وجسر التوست** ([global-error-handler.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/errors/global-error-handler.ts))
  - `ToastHandler` و `TOAST_HANDLER: InjectionToken<ToastHandler>`
  - `GlobalErrorHandler.handleError(error: unknown): void`
  - `provideMozErrors(): Provider[]`
- **صفحة `404`** ([not-found.page.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/features/public/pages/not-found.page.ts))
  - `NotFoundPageComponent` (`<moz-not-found-page>`)

### تحسين محركات البحث (`src/app/core/seo/` و [robots.txt](file:///w:/Mashura/Front-End/mozakrety/public/robots.txt))
- **`SeoService`** ([seo.service.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/seo/seo.service.ts))
  - `setPage(config: PageSeoConfig): void`, `setTitle(title: string, rawTitle?: boolean): void`, `setStatus(status: number): void`, `setNotFound(title: string, description?: string): void`, `setJsonLd(schema: JsonLdSchema | readonly JsonLdSchema[]): void`, `clearJsonLd(): void`

### خدمة التنقل
- **`NavService` و `USER_MENU_ENDPOINT`** ([nav.service.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/navigation/nav.service.ts))
  - `USER_MENU_ENDPOINT = 'auth/menu'` عبر `ApiClient.resource()` (`httpResource`)
  - `items`, `isLoading`, `reload()`

---

## 2. القرارات التصميمية المتخذة

1. **استعادة الجلسة المشروطة في المتصفح فقط ([ADR-0005](file:///w:/Mashura/Front-End/mozakrety/docs/adr/0005-auth-session-and-restore-strategy.md))**: في SSR تتحوّل الحالة إلى `'anonymous'` فوراً دون طلبات شبكة لمنع تسرب الجلسات بين المستخدمين؛ وفي المتصفح تُستعاد الجلسة فقط مع `moz_session_hint=1` أو عند دخول `/auth/**` أو مسار دور، بينما يستدعي الحراس `ensureSessionResolved()` عند الحاجة.
2. **جدول `LOGIN_METHODS` بدلاً من طبقات الـ Strategy ([ADR-0006](file:///w:/Mashura/Front-End/mozakrety/docs/adr/0006-auth-strategy-and-registry-pattern.md))**: دمج تعريفات الدخول للأدوار الخمسة في جدول واحد بسيط داخل `login-methods.ts` بدون مصانع أو رموز حقن زائدة.
3. **جسر التنبيهات عبر `TOAST_HANDLER`**: التزاماً بقاعدة Sheriff (`'type:core': ['type:core']`)، يعتمد `GlobalErrorHandler` و `errorMappingInterceptor` على `TOAST_HANDLER` ويتم ربطه بـ `ToastService` داخل [app.config.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/app.config.ts).
4. **كود `404` الحقيقي في SSR عبر `RESPONSE_INIT` و `RenderMode.Server` ([ADR-0007](file:///w:/Mashura/Front-End/mozakrety/docs/adr/0007-seo-service-and-ssr-status-api.md))**: تم ضبط `not-found` و `**` كـ `RenderMode.Server` ونقل المكوّن إلى `features/public/pages/not-found.page.ts`، بينما مسارات الأدوار و `auth/**` و `dashboard` تعمل بنمط `RenderMode.Client`.
5. **سياسة كاش النقل HTTP في SSR**: تخزين طلبات `GET`/`HEAD` العامة المجهولة فقط، واستبعاد كل طلب يحمل `withCredentials` أو `/auth/*` أو ترويسات مصادقة أو `POST`.

---

## 3. ما يعتمد على عقد الباك إند النهائي

- [auth-api.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/auth/auth-api.ts): تعليقات `TODO(backend-contract)` لتأكيد مسارات `auth/login` و `auth/logout` و `auth/me` وشكل الـ DTO ورؤوس CSRF.
- [login-methods.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/auth/login-methods.ts): تعابير التحقق للأدوار الخمسة مميّزة كـ **PROVISIONAL** في ملف واحد.
- [auth.service.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/auth/auth.service.ts) و [credentials.interceptor.ts](file:///w:/Mashura/Front-End/mozakrety/src/app/core/interceptors/credentials.interceptor.ts): مبنية لآلية `HttpOnly` كوكيز؛ الانتقال لآلية التوكنات محصور فيها وفي `auth-api.ts`.
- [robots.txt](file:///w:/Mashura/Front-End/mozakrety/public/robots.txt): يحتوي على تعليق `TODO(seo-phase-3)` لرابط `sitemap.xml` المستقبلي.

---

## 4. ملخص التحقق وبوابات الجودة (بعد تبسيط `core/`)

- `npm run typecheck`: ناجح (`0` أخطاء عبر `tsconfig.app.json` و `tsconfig.spec.json`)
- `npm run lint`: ناجح (`ng lint` + `i18n:check`: `126` مفتاحاً مطابقاً ومستخدماً)
- `npm test`: ناجح (`32` ملف اختبار، `125` اختباراً ناجحاً)
- `npm run build`: ناجح (`Initial total 462.11 kB` خام، `119.71 kB` نقل)
