# خطة تنفيذ المرحلة الثالثة: هيكل التطبيق التكيفي وثوابت الأصول والمسارات (`003-app-shell`)

**Branch**: `003-app-shell` | **Date**: 2026-11-18 | **Spec**: [spec.md](file:///w:/Mashura/Front-End/mozakrety/specs/003-app-shell/spec.md)

**Input**: Feature specification from `specs/003-app-shell/spec.md`

## Summary

تأسيس الركائز العملية الأولى للواجهة في المرحلة الثالثة:
1. سجل أصول ثابتة حديث وآمن للـ Tree-shaking (`APP_ASSETS` بصيغة `const ... as const` متوافقة مع `NgOptimizedImage`).
2. سجل مسارات آمن للأنواع (`app-routes.ts`) مع مثال عملي لمسار متداخل معقد + Query Params.
3. معترض تحميل اختياري (`loadingInterceptor`) جاهز ومختبر دون تفعيله افتراضياً في `provideMozHttp()`.
4. خدمة تخطيط ذكية (`LayoutService`) تحدد عرض الروابط في `Navbar` (مدمج مع الهيدر) أو `Sidebar` تلقائياً حسب دور المستخدم مع قابلية التبديل اليدوي في أي وقت، ومكونات `AppNavbar` و `AppSidebar` في `src/app/shared/ui/` باستخدام PrimeNG (`Menubar`, `Drawer`, `PanelMenu`)، ومكوّن `AppShellComponent` لربط التطبيق مع الحفاظ الكامل على حدود Sheriff و Angular 22+.

## Technical Context

**Language/Version**: TypeScript 6.x (strict) + Angular 22.2 (Zoneless, Signals, `OnPush` default, SSR)
**Primary Dependencies**: PrimeNG `^22.1.4`, `@primeuix/themes`, `@primeicons/angular`, `@ngx-translate/core`, Tailwind CSS v4
**Storage**: HttpOnly Cookies للجلسة + `CookieService` للغة والسمة (بدون `localStorage`)
**Testing**: Vitest 5 (`npm test`), `tsc --noEmit`, ESLint + Sheriff + `i18n:check` (`npm run lint`)
**Target Platform**: Web (Browser + Angular SSR Express Server), RTL-first (`ar`) + LTR (`en`)
**Project Type**: Single Angular Application (بدون Nx)
**Performance Goals**: الحفاظ على ميزانية الحزمة الابتدائية أقل من حد الفشل (`500 kB`) وتجنب استيراد مكونات PrimeNG غير المستخدمة في جذر التطبيق بلا داعٍ
**Constraints**: قواعد Sheriff الصارمة، منع `primeng/*` خارج `src/app/shared/ui/**` و `src/app/core/{theme,config}/**`، CSS منطقي فقط (`ms-*`, `me-*`, `ps-*`, `pe-*`), عدم استخدام `translate.instant()`، عدم إضافة `standalone: true` أو `OnPush` يدوياً
**Scale/Scope**: 6 أدوار مستخدم (`student`, `parent`, `teacher`, `school`, `partner`, `admin`) + المساحة العامة (`public`) و المصادقة (`auth`)

## Constitution Check

*GATE: تم الفحص المسبق واللاحق للتصميم.*

- **I & II (Angular 22+ & Best Practices)**: استخدام `@Service()`, `inject()`, `input()`, `output()`, `model()`, `computed()`, `@if`/`@for`, `NgOptimizedImage`, وبدون `standalone: true` أو `OnPush` صريح أو `@HostBinding` أو `ngClass`/`ngStyle`. -> **PASS**
- **III & IV (Fixed Structure & Sheriff Boundaries)**:
  - `APP_ASSETS`, `app-routes.ts`, `loadingInterceptor`, و `LayoutService` داخل `src/app/core/`.
  - `AppNavbar` و `AppSidebar` داخل `src/app/shared/ui/` (عامة 100% ومُصدّرة في `index.ts` وموثّقة في `docs/ui-library-contributions.md`).
  - `AppShellComponent` في `src/app/layout/` (يتبع `noTag`/`root` في Sheriff؛ وبالتالي مسموح له استيراد `type:core` و `type:shared` معاً بدون أي كسر لحدود `core`). -> **PASS**
- **VIII & XV (PrimeNG + UI Library-First)**: تغليف `Menubar`, `Drawer`, `PanelMenu` داخل `src/app/shared/ui/` فقط وتوثيق الإضافات في `docs/ui-library-contributions.md`. -> **PASS**
- **RTL & Accessibility**: استخدام خصائص CSS المنطقية فقط، وضبط موضع `p-drawer` ديناميكياً حسب `dir` (`right` في RTL، `left` في LTR)، ومطابقة معايير WCAG AA. -> **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/003-app-shell/
├── spec.md
├── plan.md              # هذا الملف
├── research.md          # نتائج البحث والقرارات المعمارية
├── data-model.md        # الأنواع والإشارات وهياكل البيانات
├── quickstart.md        # خطة الاختبار والتحقق
└── contracts/
    └── shell-and-layout.md
```

### Source Code (repository root)

```text
src/app/
├── core/
│   ├── assets/
│   │   └── app-assets.ts                    # APP_ASSETS (as const) + أنواع الأصول
│   ├── routes/
│   │   ├── app-routes.ts                    # APP_ROUTES + دوال المسارات المعقدة
│   │   └── app-routes.spec.ts
│   ├── http/
│   │   └── http.context.ts                  # إضافة SKIP_LOADING
│   ├── interceptors/
│   │   ├── loading.interceptor.ts           # جاهز ومختبر (اختياري، غير مفعّل افتراضياً)
│   │   └── loading.interceptor.spec.ts
│   ├── providers/
│   │   └── http.providers.ts                # تعليق توضيحي لكيفية تفعيل loadingInterceptor عند الحاجة
│   └── layout/
│       ├── layout.service.ts                # NavLayoutMode + ROLE_LAYOUT_MODE + Signals
│       └── layout.service.spec.ts
├── shared/ui/
│   ├── navbar/                              # AppNavbar (PrimeNG Menubar) + spec + README
│   ├── sidebar/                             # AppSidebar (PrimeNG PanelMenu + Drawer) + spec + README
│   └── index.ts                             # تصدير AppNavbar و AppSidebar
├── layout/
│   ├── app-shell.component.ts               # ربط Shell العام بالتطبيق (Navbar / Sidebar / Toast / Confirm / RouterOutlet)
│   └── app-shell.component.spec.ts
└── app.routes.ts                            # ربط مسارات الميزات داخل AppShellComponent (أو المسارات المحمية/العامة)
```

## مراحل التنفيذ المقترحة (للتحويل إلى مهام عبر `/speckit-tasks`)

1. **المرحلة A — الأساسيات في `core`**:
   - إضافة `APP_ASSETS` (`src/app/core/assets/app-assets.ts`).
   - إضافة `app-routes.ts` مع المثال المعقد واختباراته (`app-routes.spec.ts`).
   - إضافة `SKIP_LOADING` و `loadingInterceptor` + اختباراته (دون تفعيله افتراضياً في `provideMozHttp()`).
   - إضافة `LayoutService` مع خريطة الأدوار `ROLE_LAYOUT_MODE` واختباراته (`layout.service.spec.ts`).
2. **المرحلة B — مكونات الواجهة العامة في `shared/ui` (PrimeNG)**:
   - بناء `AppNavbar` (`src/app/shared/ui/navbar/`) مغلفاً PrimeNG `Menubar` + اختبارات + `README.md`.
   - بناء `AppSidebar` (`src/app/shared/ui/sidebar/`) مغلفاً PrimeNG `PanelMenu` و `Drawer` + دعم RTL + اختبارات + `README.md`.
   - تحديث `src/app/shared/ui/index.ts` وتوثيق الإضافتين في `docs/ui-library-contributions.md`.
3. **المرحلة C — تجميع `AppShellComponent` وربطه بالتطبيق**:
   - بناء `AppShellComponent` في `src/app/layout/` مع ترجمة مفاتيح `NavService.items()`، وتبديل اللغة/الوضع، وعرض شاشات عصرية متجاوبة.
   - ربطه في `app.routes.ts` وتحديث مفاتيح الترجمة في `public/i18n/{ar,en}.json`.
   - التحقق الشامل بجميع بوابات الجودة الأربع (`typecheck`, `lint`, `test`, `build`).
