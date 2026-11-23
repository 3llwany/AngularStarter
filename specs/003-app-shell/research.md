# بحث وتقنيات المرحلة الثالثة: `003-app-shell`

## 1. ثوابت الأصول (`APP_ASSETS`)
- **القرار**: استخدام كائن ثابت `export const APP_ASSETS = { ... } as const;` في `src/app/core/assets/app-assets.ts` مع دوال مساعدة آمنة للأنواع (بدون `class` أو `any`).
- **السبب**: الكائن الثابت يدعم الـ Tree-shaking بالكامل ويعطي Literal Types دقيقة، كما يتوافق مباشرة مع `NgOptimizedImage` (`ngSrc`) لتفادي أخطاء المسارات النصية المكررة.
- **البدائل المرفوضة**: كلاس `Assets` بخصائص `static readonly` ودالة `getSvgPath` باستخدام `any` (تمنع الـ Tree-shaking وتخالف قواعد `no any`).

## 2. ثوابت المسارات الآمنة للأنواع (`app-routes.ts`)
- **القرار**: إنشاء `src/app/core/routes/app-routes.ts` للمسارات المشتركة وجذور الأدوار، مع دوال مساعدة لبناء مسارات معقدة (Nested Params + Query Params).
- **السبب**: يمنع الـ Magic Strings في `router.navigate` و `[routerLink]`، مع إبقاء المسارات الفرعية الخاصة بكل دور داخل ملف الميزة نفسه احتراماً لحدود Sheriff ومنع تضخم ملف `core`.
- **المثال المرجعي المعقد المطلوب**: تضمين مثال موثّق لمسار متعدد المستويات (`courses/:courseId/units/:unitId/lessons/:lessonId`) مع Query Params اختيارية (`tab`, `timestamp`) ودالة بناء مهيكلة (`buildRouteUrl`) تُرجع المسار والـ `queryParams` بشكل آمن للأنواع.

## 3. معترض التحميل الاختياري (`loadingInterceptor`)
- **القرار**: إنشاء `src/app/core/interceptors/loading.interceptor.ts` واختباراته مع رمز السياق `SKIP_LOADING`، **وعدم تفعيله تلقائياً** في `provideMozHttp()` داخل `src/app/core/providers/http.providers.ts`.
- **السبب**: كل قسم حالياً يدير حالة التحميل الخاصة به محلياً عبر `httpResource.isLoading()`؛ ومع ذلك يبقى `loadingInterceptor` جاهزاً ومختبراً لأي مشروع أو شاشة تحتاج شريط تحميل عام بمجرد إضافته لقائمة `withInterceptors([...])`.

## 4. خدمة تخطيط التنقل (`LayoutService`) واختيار مكونات PrimeNG
- **القرار**:
  1. إنشاء `LayoutService` (`@Service()`) في `src/app/core/layout/layout.service.ts` يدير وضع التنقل (`'navbar' | 'sidebar'`) تلقائياً حسب `AuthService.role()` عبر جدول `ROLE_LAYOUT_MODE`:
     - الأدوار التي تعرض `Navbar` مدمج مع الهيدر بدون `Sidebar` (مثلاً: `'student'`, `'parent'`).
     - الأدوار التي تعرض `Sidebar` + هيدر مضغوط (مثلاً: `'teacher'`, `'school'`, `'partner'`, `'admin'`).
     - إمكانية تغيير الوضع في أي وقت عبر `setMode()` / `toggleMode()` / `clearOverride()`، وإعادة ضبط التجاوز اليدوي عند `logout`.
  2. تغليف مكونات PrimeNG 22 الجاهزة في `src/app/shared/ui/` بشكل عام 100% (ممنوع استيراد `primeng/*` خارج `shared/ui/`):
     - `AppNavbar` (`src/app/shared/ui/navbar/`): يغلف `p-menubar` (`MenubarModule`) مع إسقاط المحتوى (`[brand]`, `[actions]`) وزر فتح القائمة الجانبية في الجوال عند تفعيل `Sidebar`.
     - `AppSidebar` (`src/app/shared/ui/sidebar/`): يغلف `p-panelmenu` / قائمة تنقل متجاوبة لسطح المكتب (قابلة للطي) مع `p-drawer` (`DrawerModule`) للشاشات الصغيرة، مع تحديد موضع الـ Drawer تلقائياً حسب اتجاه اللغة (`right` في RTL و `left` في LTR).
     - تسجيل المكوّنين في `src/app/shared/ui/index.ts` وتوثيقهما في `docs/ui-library-contributions.md`.
  3. وضع `AppShellComponent` في `src/app/layout/app-shell.component.ts` (ضمن نطاق `noTag` / `root` في Sheriff) لأنه المكوّن الوحيد الذي يربط بين `type:core` (`NavService`, `LayoutService`, `AuthService`, `ThemeService`, `LocaleService`) و `type:shared` (`AppNavbar`, `AppSidebar`, `AppToast`, `AppConfirmDialog`) دون أي مخالفة لحدود Sheriff (`core` لا يستورد `shared`).
- **ملاحظة الميزانية والحجم**: استخدام Lazy Loading للغلاف أو استيراد وحدات PrimeNG الخفيفة فقط (`Menubar`, `Drawer`, `PanelMenu`) ومراقبة حجم الحزمة الابتدائية أثناء `npm run build`.
