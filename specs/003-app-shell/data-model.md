# نموذج البيانات والعقود الداخلية: `003-app-shell`

## 1. ثوابت الأصول (`src/app/core/assets/app-assets.ts`)
- `APP_ASSETS`: كائن ثابت `as const` مقسّم حسب الفئة:
  - `logos`: `{ brand, brandLight, icon }`
  - `placeholders`: `{ avatar, courseCover }`
  - `emptyStates`: `{ general, courses }`
- `AppAssetPath`: نوع مشتق من قيم `APP_ASSETS` لضمان عدم تمرير مسارات غير معروفة.

## 2. ثوابت المسارات (`src/app/core/routes/app-routes.ts`)
- `ROLE_ROUTE_ROOTS`: خريطة جذور الأدوار الستة (`student`, `parent`, `teacher`, `school`, `partner`, `admin`).
- `APP_ROUTES`: كائن ثابت يحتوي:
  - المسارات الأساسية (`root`, `dashboard`, `notFound`, `auth.login`, `auth.register`...) بصيغتي `base` و `full`.
  - جذور مساحات الأدوار (`student.root`, `teacher.root`...).
  - أمثلة مرجعية لمسارات معقدة ومتداخلة بدوال `full(...)` تقبل معاملات المسار + `queryParams` اختيارية (`LessonRouteQuery`).

## 3. خدمة التخطيط (`src/app/core/layout/layout.service.ts`)
- `export type NavLayoutMode = 'navbar' | 'sidebar';`
- `export const ROLE_LAYOUT_MODE: Record<LoginRole, NavLayoutMode>`:
  - `'student': 'navbar'`
  - `'parent': 'navbar'`
  - `'teacher': 'sidebar'`
  - `'school': 'sidebar'`
  - `'partner': 'sidebar'`
  - `'admin': 'sidebar'`
- `LayoutService` (`@Service()`):
  - `mode: Signal<NavLayoutMode>` (محسوبة من التجاوز اليدوي أو دور `AuthService` أو `'navbar'` للزائر).
  - `hasSidebar: Signal<boolean>` (`mode() === 'sidebar'`).
  - `showLinksInNavbar: Signal<boolean>` (`mode() === 'navbar'`).
  - `sidebarCollapsed: Signal<boolean>` (حالة طي القائمة الجانبية على سطح المكتب).
  - `mobileDrawerOpen: Signal<boolean>` (حالة فتح `p-drawer` على الشاشات الصغيرة).
  - الدوال: `setMode(mode)`, `toggleMode()`, `clearOverride()`, `toggleSidebarCollapse()`, `openMobileDrawer()`, `closeMobileDrawer()`.

## 4. نماذج مكونات الواجهة العامة في `src/app/shared/ui/`
- `UiNavItem` (عام 100% بدون أي منطق أدوار أو مفاتيح مشروع ثابتة):
  - `id: string`
  - `label: string` (نص جاهز أو مترجم من المستهلك عبر `TranslateService` / pipe)
  - `route?: string`
  - `icon?: string`
  - `items?: readonly UiNavItem[]` (لدعم القوائم المتداخلة في `Menubar` و `PanelMenu`)
  - `badge?: string`
