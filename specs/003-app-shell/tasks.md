---
description: "Task list for Phase 3 (003-app-shell): Adaptive App Shell, APP_ASSETS, app-routes, and optional loadingInterceptor"
---

# Tasks: هيكل التطبيق التكيفي وثوابت الأصول والمسارات (`003-app-shell`)

**Input**: Design documents from `/specs/003-app-shell/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/shell-and-layout.md`, `quickstart.md`

**Tests**: اختبارات الوحدة مدرجة لكل خدمة ومكوّن أساسي وفق معايير الجودة في `quickstart.md`.  
**Organization**: المهام مرتبة حسب قصص المستخدمين لتسليم **MVP** مستقل وقابل للاختبار أولاً، ثم بقية الميزات بالتوازي.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: يمكن تشغيلها بالتوازي (ملفات مختلفة دون اعتماديات غير مكتملة)
- **[Story]**: رمز القصة (`[US1]`, `[US2]`, `[US3]`) — لمرحلة قصص المستخدمين فقط
- جميع المهام تحتوي على المسار الدقيق للملف

---

## Phase 1: Setup (Shared Infrastructure & i18n)

**Purpose**: تجهيز مفاتيح الترجمة الخاصة بالـ Shell والتأكد من جاهزية المجلدات المستهدفة

- [X] T001 [P] Add Arabic shell, navbar, sidebar, and layout toggle translation keys (`shell.*`) in `public/i18n/ar.json`
- [X] T002 [P] Add matching English shell, navbar, sidebar, and layout toggle translation keys (`shell.*`) in `public/i18n/en.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: النماذج المشتركة ورموز السياق اللازمة قبل بدء قصص المستخدمين

**⚠️ CRITICAL**: لا تبدأ قصص المستخدمين قبل إكمال هذه الأساسيات

- [X] T003 [P] Create generic UI navigation item model (`UiNavItem` with `id`, `label`, `route?`, `icon?`, `items?`, `badge?`) in `src/app/shared/ui/foundation/ui-nav-item.ts` and export it in `src/app/shared/ui/index.ts`
- [X] T004 [P] Add `SKIP_LOADING = new HttpContextToken<boolean>(() => false)` context token in `src/app/core/http/http.context.ts`

**Checkpoint**: الأساسيات جاهزة — يمكن البدء في تنفيذ قصص المستخدمين بالتوازي

---

## Phase 3: User Story 1 — Role-Aware Adaptive Shell (`Navbar` / `Sidebar` via PrimeNG) (Priority: P1) 🎯 MVP

**Goal**: توفير `LayoutService` يحدد تلقائياً عرض الروابط في `Navbar` (مدمج مع الهيدر بدون `Sidebar`) أو في `Sidebar` + هيدر مضغوط حسب دور المستخدم بعد تسجيل الدخول، مع إمكانية التبديل اليدوي في أي وقت عبر مكونات PrimeNG (`Menubar`, `PanelMenu`, `Drawer`).

**Independent Test**: التحقق من اختبارات `layout.service.spec.ts` و `navbar.spec.ts` و `sidebar.spec.ts` و `app-shell.component.spec.ts`، وملاحظة تبديل موضع الروابط واتجاه `Drawer` بين `rtl`/`ltr`.

### Tests for User Story 1

- [X] T005 [P] [US1] Write unit tests for `LayoutService` (role-to-mode defaults, automatic switch on auth change, manual `setMode`/`toggleMode`/`clearOverride`, logout reset) in `src/app/core/layout/layout.service.spec.ts`
- [X] T006 [P] [US1] Write unit tests for `AppNavbar` (links visibility toggle via `showLinks`, `sidebarToggle` output, `itemSelect` output, slots projection) in `src/app/shared/ui/navbar/navbar.spec.ts`
- [X] T007 [P] [US1] Write unit tests for `AppSidebar` (desktop `PanelMenu` items, `collapsed` state, RTL/LTR `Drawer` position, `mobileOpen` model) in `src/app/shared/ui/sidebar/sidebar.spec.ts`
- [X] T008 [P] [US1] Write unit tests for `AppShellComponent` (translating `NavService.items()`, toggling sidebar vs navbar per `LayoutService`, language/mode switch, toast/confirm host rendering) in `src/app/layout/app-shell.component.spec.ts`

### Implementation for User Story 1

- [X] T009 [US1] Implement `NavLayoutMode`, `ROLE_LAYOUT_MODE`, and `@Service() LayoutService` (`mode`, `hasSidebar`, `showLinksInNavbar`, `sidebarCollapsed`, `mobileDrawerOpen`, `setMode`, `toggleMode`, `clearOverride`, `toggleSidebarCollapse`, `openMobileDrawer`, `closeMobileDrawer`) in `src/app/core/layout/layout.service.ts`
- [X] T010 [P] [US1] Implement generic `AppNavbar` wrapping PrimeNG `Menubar` (`showLinks`, `showSidebarToggle`, `menuAriaLabel`, `[brand]` & `[actions]` slots, RTL-safe logical Tailwind classes) in `src/app/shared/ui/navbar/navbar.ts`, `src/app/shared/ui/navbar/navbar.html`, and `src/app/shared/ui/navbar/README.md`
- [X] T011 [P] [US1] Implement generic `AppSidebar` wrapping PrimeNG `PanelMenu` and `Drawer` (`collapsed`, `mobileOpen` `model()`, `dir`-aware drawer position, `[sidebarHeader]` & `[sidebarFooter]` slots, WCAG AA accessible labels) in `src/app/shared/ui/sidebar/sidebar.ts`, `src/app/shared/ui/sidebar/sidebar.html`, and `src/app/shared/ui/sidebar/README.md`
- [X] T012 [US1] Export `AppNavbar`, `Navbar`, `AppSidebar`, and `Sidebar` in `src/app/shared/ui/index.ts` (depends on T010, T011)
- [X] T013 [US1] Implement `AppShellComponent` connecting `NavService`, `LayoutService`, `AuthService`, `LocaleService`, `ThemeService`, `<app-navbar>`, `<app-sidebar>`, `<app-toast>`, `<app-confirm-dialog>`, and `<router-outlet />` in `src/app/layout/app-shell.component.ts` (depends on T009, T012)
- [X] T014 [US1] Wire `AppShellComponent` as the layout shell for feature routes in `src/app/app.routes.ts` and keep `src/app/app.html` clean with `<router-outlet />` (depends on T013)

**Checkpoint**: القصة الأولى (`US1`) مكتملة ومختبرة بشكل مستقل (MVP جاهز)

---

## Phase 4: User Story 2 — `APP_ASSETS` & Type-Safe `app-routes.ts` (Priority: P2)

**Goal**: توفير سجل أصول ثابت (`APP_ASSETS` بصيغة `const ... as const` لـ `NgOptimizedImage`) وسجل مسارات آمن للأنواع (`APP_ROUTES` في `core/routes/app-routes.ts`) متضمناً مثالاً متقدماً لمسار متداخل معقد + Query Params.

**Independent Test**: التحقق من `app-routes.spec.ts` ومن استخدام `APP_ASSETS` في `AppShellComponent` بدون `any` أو Magic Strings.

### Tests for User Story 2

- [X] T015 [P] [US2] Write unit tests for `APP_ROUTES` and `buildAppRoute()` (root paths, role roots, nested multi-param `courseLesson` route + optional `queryParams`) in `src/app/core/routes/app-routes.spec.ts`

### Implementation for User Story 2

- [X] T016 [P] [US2] Create `APP_ASSETS` (`logos`, `placeholders`, `emptyStates` as `const`) and `AppAssetPath` type in `src/app/core/assets/app-assets.ts`
- [X] T017 [P] [US2] Create `ROLE_ROUTE_ROOTS`, `APP_ROUTES`, `buildAppRoute()`, and the documented complex nested route example (`courses/:courseId/units/:unitId/lessons/:lessonId` with `LessonRouteQuery`) in `src/app/core/routes/app-routes.ts`
- [X] T018 [US2] Adopt `APP_ROUTES` in `src/app/app.routes.ts` and `src/app/core/guards/auth.guards.ts`, and `APP_ASSETS` (with `NgOptimizedImage`) in `src/app/layout/app-shell.component.ts` (depends on T014, T016, T017)

**Checkpoint**: الأصول والمسارات المركزية جاهزة ومربوطة دون تكرار نصوص

---

## Phase 5: User Story 3 — Optional Opt-In `loadingInterceptor` (Priority: P3)

**Goal**: توفير `loadingInterceptor` جاهزاً ومختبراً بربطه مع `LoadingService` و `SKIP_LOADING` دون تفعيله تلقائياً في `provideMozHttp()`، بحيث يُستورد في `providers` عند الحاجة فقط.

**Independent Test**: نجاح `loading.interceptor.spec.ts` وتأكيد بقاء `provideMozHttp()` بدون تفعيل تلقائي للـ interceptor.

### Tests for User Story 3

- [X] T019 [P] [US3] Write unit tests for `loadingInterceptor` (`LoadingService.show`/`hide` on success & error, skipping `isStaticAssetUrl`, skipping `SKIP_LOADING: true`) in `src/app/core/interceptors/loading.interceptor.spec.ts`

### Implementation for User Story 3

- [X] T020 [US3] Implement `loadingInterceptor: HttpInterceptorFn` using `LoadingService`, `isStaticAssetUrl`, `SKIP_LOADING`, and `finalize()` in `src/app/core/interceptors/loading.interceptor.ts`
- [X] T021 [US3] Document opt-in import/usage comment for `loadingInterceptor` in the Phase 3 slot inside `src/app/core/providers/http.providers.ts` (do NOT enable by default)

**Checkpoint**: `loadingInterceptor` جاهز ومختبر ومعزول للاستخدام الاختياري

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: التوثيق النهائي، التحقق من بوابات الجودة الأربع، ومطابقة ميزانية الحزمة

- [X] T022 [P] Log `AppNavbar` and `AppSidebar` additions (`files`, `dependencies`, `date`) in `docs/ui-library-contributions.md`
- [X] T023 [P] Document `core/assets/`, `core/routes/`, `core/layout/`, `layout/`, and optional `loadingInterceptor` in `src/app/core/README.md` and `docs/architecture/structure.md`
- [X] T024 Run all quality gates (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`) and verify `specs/003-app-shell/quickstart.md` scenarios pass within initial bundle budget (`< 500 kB`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** & **Foundational (Phase 2)**: تبدأ فوراً ويمكن تنفيذ مهامها `[P]` بالتوازي.
- **User Story 1 (Phase 3 - P1 MVP)**: تعتمد على اكتمال Phase 1 و Phase 2 (`T001`–`T004`).
- **User Story 2 (Phase 4 - P2)**: المهام `T015`–`T017` مستقلة وتبدأ بعد Phase 2؛ فقط مهمة الربط `T018` تعتمد على `T014`.
- **User Story 3 (Phase 5 - P3)**: تعتمد على `T004` (`SKIP_LOADING`) فقط ويمكن تنفيذها بالتوازي تماماً مع US1 و US2.
- **Polish (Phase 6)**: بعد اكتمال القصص الثلاث.

### Parallel Opportunities

- `T001`, `T002`, `T003`, `T004` يمكن تنفيذها جميعاً بالتوازي.
- داخل `US1`: اختبارات `T005`–`T008` ومكونات `T009`, `T010`, `T011` يمكن تنفيذها بالتوازي قبل الدمج في `T012`–`T014`.
- `US2` (`T015`–`T017`) و `US3` (`T019`–`T021`) يمكن تنفيذهما بالتوازي مع `US1`.

---

## Parallel Example: User Story 1 (MVP)

```bash
# تنفيذ الخدمة ومكونات PrimeNG في نفس الوقت:
Task: "T009 [US1] Implement LayoutService in src/app/core/layout/layout.service.ts"
Task: "T010 [P] [US1] Implement AppNavbar in src/app/shared/ui/navbar/"
Task: "T011 [P] [US1] Implement AppSidebar in src/app/shared/ui/sidebar/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. إكمال Phase 1 + Phase 2 (`T001`–`T004`).
2. تنفيذ Phase 3 (`US1`: `LayoutService` + `AppNavbar` + `AppSidebar` + `AppShellComponent`).
3. **التحقق عند نقطة التوقف**: نجاح اختبارات الـ Shell وتجربة التبديل بين `Navbar` و `Sidebar`.
4. إضافة `US2` (`APP_ASSETS` + `APP_ROUTES`) ثم `US3` (optional `loadingInterceptor`)، ثم Phase 6 والتحقق الشامل.
