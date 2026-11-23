# عقود المرحلة الثالثة: `003-app-shell`

## 1. عقد `AppNavbar` (`src/app/shared/ui/navbar/`)
- **Selector**: `app-navbar`
- **Inputs**:
  - `items = input<readonly UiNavItem[]>([])`
  - `showLinks = input<boolean>(true)` — عند `false` (في وضع `Sidebar`) يعرض الهيدر فقط الشعار/العنوان وأزرار الأدوات (`[actions]`) وزر فتح القائمة الجانبية دون تكرار الروابط.
  - `showSidebarToggle = input<boolean>(false)`
  - `menuAriaLabel = input<string>('Toggle menu')`
- **Outputs**:
  - `sidebarToggle = output<void>()`
  - `itemSelect = output<UiNavItem>()`
- **Slots (`ng-content`)**: `[brand]`, `[actions]`.
- **PrimeNG**: يغلف `Menubar` (`primeng/menubar`) مع تحويل `UiNavItem[]` إلى `MenuItem[]`.

## 2. عقد `AppSidebar` (`src/app/shared/ui/sidebar/`)
- **Selector**: `app-sidebar`
- **Inputs**:
  - `items = input<readonly UiNavItem[]>([])`
  - `collapsed = input<boolean>(false)`
  - `mobileOpen = model<boolean>(false)`
  - `dir = input<'rtl' | 'ltr'>('rtl')` — يحدد موضع الـ `p-drawer` (`'right'` في RTL، `'left'` في LTR).
  - `ariaLabel = input<string>('Sidebar navigation')`
- **Outputs**:
  - `itemSelect = output<UiNavItem>()`
- **Slots (`ng-content`)**: `[sidebarHeader]`, `[sidebarFooter]`.
- **PrimeNG**: يغلف `PanelMenu` (`primeng/panelmenu`) لسطح المكتب و `Drawer` (`primeng/drawer`) للجوال.

## 3. عقد `AppShellComponent` (`src/app/layout/app-shell.component.ts`)
- يربط `NavService.items()` + `LayoutService.mode()` + `AuthService` + `LocaleService` + `ThemeService`.
- يترجم `NavItem.labelKey` إلى `UiNavItem` تفاعلياً مع تبديل اللغة.
- يضم `<app-navbar>`, `<app-sidebar>` (شرطياً بـ `@if (layout.hasSidebar())`), `<main><router-outlet /></main>`, `<app-toast />`, `<app-confirm-dialog />`.
- يتيح مبدّل اللغة (`ar`/`en`)، ومبدّل وضع التخطيط (`navbar`/`sidebar`) للتجربة أو التفضيل الشخصي، وزر تسجيل الخروج عند المصادقة.

## 4. عقد `loadingInterceptor` (`src/app/core/interceptors/loading.interceptor.ts`)
- `SKIP_LOADING = new HttpContextToken<boolean>(() => false)` في `http.context.ts`.
- يستبعد الأصول الثابتة (`isStaticAssetUrl`) والطلبات التي تحمل `SKIP_LOADING: true`.
- يستدعي `LoadingService.show()` عند بدء الطلب و `LoadingService.hide()` في `finalize()`.
- **لا يُضاف افتراضياً** في `provideMozHttp()`؛ يبقى متاحاً للاستيراد الاختياري في `providers`.

## 5. عقد المثال المعقد في `app-routes.ts`
- دالة مساعدة `buildAppRoute(path, query?)` ومثال صريح لمسار درس متداخل:
  - `base`: `'courses/:courseId/units/:unitId/lessons/:lessonId'`
  - `full(params, query?)`: يرجع `{ commands: [...], queryParams?: ... }` أو مساراً نصياً كاملاً مع معاملات الاستعلام، ليكون مرجعاً عملياً موثقاً للتيم.
