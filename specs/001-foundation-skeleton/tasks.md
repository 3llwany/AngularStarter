# Tasks: Phase 1 — Application Foundation Skeleton

**Input**: Design documents from `/specs/001-foundation-skeleton/` (`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`)

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/ui-contracts.md`

**Tests**: Included as requested in `plan.md`: unit tests for `ThemeService`, `LocaleService`, `MozMissingTranslationHandler`, and WCAG AA palette contrast.

**Organization**: Tasks are grouped by user story (`US1`–`US5` at Priority P1, `US6` at Priority P2) to enable independent implementation and verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`–`[US6]`)
- **Consult rule (Constitution Principle I)**: Before each implementation task, consult the Angular CLI MCP tools and the official docs of the library involved to verify exact config/API syntax; record any deviation in `specs/001-foundation-skeleton/summary.md`.
- **Stop rule (Constitution Principle XIV)**: After the final task, summarize what changed in `specs/001-foundation-skeleton/summary.md` and STOP for review.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify installed packages, install missing Sheriff dependencies, enable strict TypeScript flags, and add npm scripts.

- [X] T001 Verify installed packages (`tailwindcss`, `@tailwindcss/postcss`, `postcss`, `primeng`, `@primeuix/themes`, `primeicons`, `tailwindcss-primeui`, `@ngx-translate/core`, `@ngx-translate/http-loader`, `@ngrx/signals`, `angular-eslint`, `eslint`, `typescript-eslint`) and confirm no `@jsverse/transloco` dependency exists in `package.json`
- [X] T002 Install Sheriff architectural linting devDependencies (`@softarc/sheriff-core` and `@softarc/eslint-plugin-sheriff`) in `package.json`
- [X] T003 Confirm Angular 22 zoneless setup per official docs (`provideZonelessChangeDetection()` if required, and verify no `zone.js` polyfill exists) in `angular.json` and `src/app/app.config.ts`
- [X] T004 [P] Enable `"strict": true` and `"noUncheckedIndexedAccess": true` (keeping `"noImplicitReturns": true` and `"noFallthroughCasesInSwitch": true`) in `tsconfig.json` and fix any resulting type issues in `src/app/app.ts` and `src/app/app.spec.ts`
- [X] T005 [P] Add `typecheck` script (`tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.spec.json`) alongside `lint`, `test`, and `build` in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core styling pipeline, SSR-safe platform helpers, base ESLint config, and modular app config structure that MUST be complete before user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Create PostCSS configuration with `@tailwindcss/postcss` plugin in `.postcssrc.json`
- [X] T007 Configure Tailwind CSS v4 (`@import "tailwindcss";`), `@plugin "tailwindcss-primeui";`, and CSS cascade `@layer` order (`theme, base, primeng, utilities`) in `src/styles.css`
- [X] T008 [P] Create SSR-safe cookie and document helper (using `DOCUMENT` and Angular SSR `REQUEST` token, never raw `window` or `localStorage`, writing cookie attributes `Path=/; Max-Age=31536000; SameSite=Lax`) in `src/app/core/platform/cookie.ts`
- [X] T009 Update base ESLint flat configuration (`typescript-eslint`, `angular-eslint` TS + template recommended, `templateAccessibility`, selector rules, ignores for `dist/`, `.angular/`, `node_modules/`) in `eslint.config.js`
- [X] T010 [P] Refactor application provider setup into modular config helpers under `src/app/core/config/` and wire them in `src/app/app.config.ts`

**Checkpoint**: Foundation ready — `npm run build`, `npm run lint`, and `npm run typecheck` pass on the base scaffold.

---

## Phase 3: User Story 1 — Enforced Structure and Boundaries (Priority: P1) 🎯 MVP

**Goal**: Deliver the documented folder structure (`core`, `shared`, and 8 `features/*` areas with `pages/`, `ui/`, `data-access/`, `models/`) and enforce architectural module boundaries via Sheriff + ESLint.

**Independent Test**: Introduce each of the 4 forbidden feature/layer dependency types plus a direct PrimeNG import in a feature, verify `npm run lint` fails on each, remove them, and verify `npm run lint` passes.

### Implementation for User Story 1

- [X] T011 [P] [US1] Create `core`, `shared/ui`, and all 8 feature directory trees (`public`, `auth`, `student`, `parent`, `teacher`, `school`, `partner`, `admin` each with `pages/`, `ui/`, `data-access/`, `models/`) with `.gitkeep` files under `src/app/features/`
- [X] T012 [P] [US1] Write area architecture documentation explaining responsibilities and allowed imports in `src/app/core/README.md`, `src/app/shared/README.md`, and `src/app/features/{public,auth,student,parent,teacher,school,partner,admin}/README.md`
- [X] T013 [US1] Create Sheriff configuration tagging `src/app/core` (`type:core`), `src/app/shared` (`type:shared`), `src/app/features/public` (`type:feature`, `feature:public`), `src/app/features/auth` (`type:feature`, `feature:auth`), and `src/app/features/<role>` (`type:feature`, `feature:role`, `role:<role>`) with dependency rules in `sheriff.config.ts`
- [X] T014 [US1] Integrate `@softarc/eslint-plugin-sheriff` into the ESLint flat config in `eslint.config.js`
- [X] T015 [US1] Add `no-restricted-imports` rule blocking `primeng`, `primeng/*`, and `@primeuix/*` everywhere in `src/**/*.ts` with an override exempting `src/app/shared/ui/**` and `src/app/core/theme/**` in `eslint.config.js`
- [X] T016 [US1] Prove boundary enforcement by temporarily creating and linting each violation (`feature→feature`, `shared→features`, `core→features`, `public→role feature`, and `primeng` import in a feature), removing the temporary files, and recording the failing/passing lint output in `specs/001-foundation-skeleton/evidence/boundaries.md`
- [X] T017 [P] [US1] Write ADR-0001 documenting the single-app non-Nx structure and Sheriff boundary rules in `docs/adr/0001-single-app-no-nx.md`

**Checkpoint**: User Story 1 complete and verified via `specs/001-foundation-skeleton/evidence/boundaries.md`.

---

## Phase 4: User Story 3 — Runtime Role Theming (Priority: P1)

**Goal**: Provide 6 role palettes (`student`, `parent`, `teacher`, `school`, `partner`, `admin`) mapped to CSS variables `--moz-primary-50..950` and synced across Tailwind utilities and PrimeNG preset at runtime without page reload or theme flash.

**Independent Test**: Run `ThemeService` and palette contrast unit tests (`npm test`); verify switching `data-role` updates `--moz-primary-*` variables and persists cookie `moz_role`.

### Tests for User Story 3

- [X] T018 [P] [US3] Write WCAG AA palette contrast unit test in `src/app/core/theme/role-palettes.spec.ts` verifying:
  - `--primary-contrast` on `primary-500` (`≥ 4.5:1` for text)
  - `primary-600` and `primary-700` as text on white (`≥ 4.5:1`)
  - Non-text UI boundaries and focus states (`≥ 3:1`)
  - Adjust `--primary-contrast` (dark/light) or text-use steps without altering authoritative `500` hexes
- [X] T019 [P] [US3] Write unit tests for `ThemeService` (default `student`, `setRole` updates signal + `<html data-role>` + `moz_role` cookie, invalid/missing cookie falls back to `student`) in `src/app/core/theme/theme.service.spec.ts`

### Implementation for User Story 3

- [X] T020 [US3] Define `Role` type and role palette scale definitions in `src/app/core/theme/role.ts` and `src/app/core/theme/role-palettes.ts`:
  - 5 authoritative sheet hex values for `500`: student `#2E7DFF`, parent `#10B981`, teacher `#8B5CF6`, school `#EF4444`, partner `#F59E0B`.
  - Admin neutral proposal (`#4F46E5`) marked provisional.
  - Full 50–950 scales generated in OKLCH maintaining hue stability around immutable step 500, marked provisional and swappable in a single file.
  - Per-role `--primary-contrast` and `--primary-gradient` tokens.
- [X] T021 [US3] Define full 50–950 scales in ONE place as CSS variables per `[data-role]` (`--moz-primary-50..950`, `--primary-contrast`, `--primary-gradient`) and map to `@theme inline` (`--color-primary-*`) in `src/styles.css`
- [X] T022 [US3] Implement `ThemeService` (`currentRole` signal, `setRole(role)` validation with invalid/missing fallback to `student`, `<html data-role>` sync via `DOCUMENT`, SSR-safe cookie `moz_role` persistence) in `src/app/core/theme/theme.service.ts`
- [X] T023 [US3] Add pre-paint inline script in `src/index.html` reading `moz_role` and `moz_lang` cookies to set `data-role`, `lang`, and `dir` on `<html>` before first paint
- [X] T024 [US3] Create custom thin PrimeNG preset (`UiThemePreset` / `MozAuraPreset`) via `definePreset` mapping `semantic.primary.50..950` and `contrastColor` to CSS variables in `src/app/core/theme/moz-preset.ts`, inheriting typography from `body` (no font set in preset), and provide it with `providePrimeNG` (`cssLayer: { name: 'primeng', order: 'theme, base, primeng' }`) in `src/app/core/config/primeng.config.ts`
- [X] T025 [P] [US3] Write ADR-0003 documenting CSS-variable role theming, authoritative vs provisional scales, WCAG AA shade selection, and cookie-based flash prevention in `docs/adr/0003-role-theming-css-variables.md`

**Checkpoint**: User Story 3 complete — `ThemeService` and contrast unit tests pass, PrimeNG and Tailwind share role CSS variables.

---

## Phase 5: User Story 4 — Arabic/English with Correct Mirroring (Priority: P1)

**Goal**: Support Arabic (`ar`, `rtl`, default) and English (`en`, `ltr`) via `@ngx-translate/core` v18 with SSR-safe translation loading (`TransferState`), runtime switching via `LocaleService`, self-hosted Arabic font, missing/unused key checks, and lint enforcement against physical-direction utilities and hardcoded strings.

**Independent Test**: Run `LocaleService`, `MozMissingTranslationHandler`, `npm run i18n:check`, and the SSR view-source check in both `ar` and `en`.

### Tests for User Story 4

- [X] T026 [P] [US4] Write unit tests for `LocaleService` (default `ar` / `dir="rtl"`, `setLang('en')` updates `<html lang="en" dir="ltr">` + calls `TranslateService.use('en')` + writes `moz_lang` cookie, invalid/missing cookie detects from `Accept-Language`/`navigator.languages` with fallback `ar`) in `src/app/core/i18n/locale.service.spec.ts`
- [X] T027 [P] [US4] Write unit tests for `MozMissingTranslationHandler` in `src/app/core/i18n/missing-translation.handler.spec.ts`

### Implementation for User Story 4

- [X] T028 [US4] Implement `MozMissingTranslationHandler` (fails loudly / logs error with visible marker in dev and throws in test/SSR-verify mode; returns fallback in prod) in `src/app/core/i18n/missing-translation.handler.ts`
- [X] T029 [US4] Implement SSR-safe translation loader using `TransferState` (reads `public/i18n/{lang}.json` on the server and caches in `TransferState` so the browser does not refetch on hydration; fetches via `HttpClient` on client language switch) in `src/app/core/i18n/ssr-translate.loader.ts`
- [X] T030 [US4] Configure `provideTranslateService` (`lang: 'ar'`, `fallbackLang: 'ar'`, `SSRTranslateLoader`, `MozMissingTranslationHandler`) and app initializer awaiting initial language load in `src/app/core/i18n/i18n.providers.ts` and register in `src/app/app.config.ts`
- [X] T031 [P] [US4] Create translation files `public/i18n/ar.json` and `public/i18n/en.json` using nested `lower_snake_case` feature-prefixed keys (`common.*`, `dev.foundation.*`, `dev.i18n_ssr.*`)
- [X] T032 [US4] Implement `LocaleService` (`'ar' | 'en'` validation, `dir` derived as `'ar' → 'rtl'` and `'en' → 'ltr'`, invalid/missing cookie detected from `Accept-Language`/`navigator.languages` with fallback `'ar'`, sets `<html lang dir>`, calls `TranslateService.use()`, persists cookie `moz_lang` with `Path=/; Max-Age=31536000; SameSite=Lax`) in `src/app/core/i18n/locale.service.ts`
- [X] T033 [P] [US4] Document i18n conventions (nested `lower_snake_case` feature-prefixed keys, `translate` pipe in templates, `toSignal(translate.stream(...))` in TS, no `instant()`, future per-feature lazy scope pattern, and Arabic pluralization strategy) in `src/app/core/i18n/README.md`
- [X] T034 [US4] Configure typography: Declare placeholder variable `--font-sans` with an Arabic-capable fallback stack in `@theme` and on `body` in `src/styles.css` with `font-display: swap`. Ensure PrimeNG inherits font from body (no font set in preset). Mark as temporary pending final font delivery by the user.
- [X] T035 [US4] Add ESLint rules in `eslint.config.js` banning `.instant(` calls outside `*.spec.ts`, banning physical-direction Tailwind utilities (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`, `border-l*`, `border-r*`, `rounded-l*`, `rounded-r*`, `float-left`, `float-right` unless annotated with `moz-allow-physical: <reason>`), and checking templates against hardcoded strings
- [X] T036 [US4] Create missing/unused/mismatched translation key checker script (scanning `src/**/*.{ts,html}` for `translate` pipe and `translate.stream` keys and comparing `public/i18n/ar.json` and `public/i18n/en.json`) in `tools/i18n-check.mjs` and wire `i18n:check` into `package.json` (`npm run lint`)
- [X] T037 [US4] Prove i18n and RTL lint/key gates with temporary violations (physical utility class, hardcoded template string, `.instant()` call, missing key, unused key — verify failure then clean pass) and record output in `specs/001-foundation-skeleton/evidence/lint-rules.md`
- [X] T038 [P] [US4] Verify and finalize ADR-0004 ("ngx-translate for i18n": trade-offs vs Transloco, TransferState SSR loading, key conventions, extractor script, Arabic pluralization deferral) in `docs/adr/0004-ngx-translate-for-i18n.md`

**Checkpoint**: User Story 4 complete — `LocaleService` tests and `npm run i18n:check` pass; physical utilities and missing keys fail lint.

---

## Phase 6: User Story 2 — Consistent Design-System Layer (Priority: P1)

**Goal**: Provide standalone `moz-*` UI wrappers in `src/app/shared/ui/` (`moz-button`, `moz-input`, `moz-card`, `moz-dialog`, `moz-select`) hiding PrimeNG types from feature consumers.

**Independent Test**: Import wrappers from `src/app/shared/ui`, render all states, and verify feature code cannot import `primeng/*` directly.

### Implementation for User Story 2

- [X] T039 [P] [US2] Create `MozButtonComponent` (`moz-button`: `variant`, `size`, `disabled`, `loading`, `type`, directional icon flip support, `clicked` output) wrapping `primeng/button` in `src/app/shared/ui/button/moz-button.component.ts`
- [X] T040 [P] [US2] Create `MozInputComponent` (`moz-input`: `value` `model()`, `labelKey`, `placeholderKey`, `type`, `disabled`, `invalid`, `errorKey`, `id`) wrapping `primeng/inputtext` in `src/app/shared/ui/input/moz-input.component.ts`
- [X] T041 [P] [US2] Create `MozCardComponent` (`moz-card`: `titleKey`, `subtitleKey`, content projection slots) wrapping `primeng/card` in `src/app/shared/ui/card/moz-card.component.ts`
- [X] T042 [P] [US2] Create `MozDialogComponent` (`moz-dialog`: `visible` `model()`, `headerKey`, `modal`, `closable`, accessible labelling) wrapping `primeng/dialog` in `src/app/shared/ui/dialog/moz-dialog.component.ts`
- [X] T043 [P] [US2] Create `MozSelectComponent` (`moz-select`: own `MozSelectOption<T>` interface, `value` `model()`, `options`, `labelKey`, `placeholderKey`, `disabled`, `invalid`) wrapping `primeng/select` in `src/app/shared/ui/select/moz-select.component.ts`
- [X] T044 [US2] Export all 5 wrapper components and their public types (without re-exporting PrimeNG types) in `src/app/shared/ui/index.ts`
- [X] T045 [P] [US2] Write ADR-0002 documenting why PrimeNG is wrapped behind `moz-*` components in `docs/adr/0002-primeng-behind-moz-ui.md`

**Checkpoint**: User Story 2 complete — all 5 `moz-*` wrappers compile with strict types and zero leaked PrimeNG imports.

---

## Phase 7: User Story 6 — Removable Dev-Only Verification Page (Priority: P2)

**Goal**: Provide `/dev/foundation` (client-rendered) showcasing all 5 `moz-*` wrappers, the 6-role theme switcher, and the `ar`/`en` language switcher, plus `/dev/i18n-ssr` (SSR-rendered) to prove SSR translation rendering; exclude both from production builds via `fileReplacements`.

**Independent Test**: Verify `/dev/foundation` and `/dev/i18n-ssr` in development/SSR builds; run production `npm run build` and verify the dev marker string is absent from `dist/`.

### Implementation for User Story 6

- [X] T046 [US6] Create dev verification page component showcasing `moz-button`, `moz-input`, `moz-card`, `moz-dialog`, `moz-select` in their states, 6-role switcher (`ThemeService`), `ar`/`en` switcher (`LocaleService`), and removable marker (`DEV_FOUNDATION_VERIFICATION_PAGE_REMOVABLE`) in `src/app/dev/foundation.page.ts`
- [X] T047 [US6] Create dev SSR probe page component rendering translated headings via `translate` pipe and `toSignal(translate.stream(...))` in `src/app/dev/i18n-ssr.page.ts`
- [X] T048 [US6] Create dev routes in `src/app/dev/dev.routes.ts` and empty production replacement in `src/app/dev/dev.routes.prod.ts`, wire in `src/app/app.routes.ts`, and configure `fileReplacements` in `angular.json` production build configuration
- [X] T049 [US6] Configure `RenderMode.Client` for `dev/foundation` and `RenderMode.Server` for `dev/i18n-ssr` in `src/app/app.routes.server.ts`
- [X] T050 [US6] Prove SSR translation rendering (using a development-configuration SSR build so `/dev/i18n-ssr` is active) with `Cookie: moz_lang=ar` and `Cookie: moz_lang=en` view-source requests confirming translated HTML, no raw keys, and `TransferState` payload, recording evidence in `specs/001-foundation-skeleton/evidence/i18n-ssr.md`
- [X] T051 [US6] Run production `npm run build` and verify `DEV_FOUNDATION_VERIFICATION_PAGE_REMOVABLE` and `dev.routes` are absent from `dist/mozakrety/`

**Checkpoint**: User Story 6 complete — dev verification pages work in dev/SSR and are completely tree-shaken from production builds.

---

## Phase 8: User Story 5 — Day-One Quality Gates (Priority: P1)

**Goal**: Enforce bundle budgets in `angular.json` (initial warning 300kB / error 500kB raw, `anyComponentStyle` 4kB / 8kB) and verify all quality gates (`typecheck`, `lint`, `test`, `build`) pass.

**Independent Test**: Temporarily lower budget threshold to force build failure, restore threshold, and run all 4 gate scripts cleanly.

### Implementation for User Story 5

- [X] T052 [US5] Configure `initial` budget (`maximumWarning: "300kB"`, `maximumError: "500kB"`) and `anyComponentStyle` budget (`maximumWarning: "4kB"`, `maximumError: "8kB"`) in `angular.json`
- [X] T053 [US5] Prove budget gate by temporarily setting `initial` `maximumError` to `"10kB"` in `angular.json`, running `npm run build` to capture the budget failure, reverting `angular.json`, and recording output in `specs/001-foundation-skeleton/evidence/budgets.md`
- [X] T054 [US5] Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` and resolve any warnings or errors across the repository
- [X] T055 [US5] Record measured production initial bundle sizes (raw and estimated transfer sizes) in `specs/001-foundation-skeleton/evidence/budgets.md`

**Checkpoint**: User Story 5 complete — all quality gates and bundle budgets verified.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Finalize developer conventions documentation, validate quickstart scenarios, and write the Phase 1 completion summary.

- [X] T056 [P] Update `AGENTS.md` (and sync `CLAUDE.md` if needed) with concise day-to-day conventions (folder layout, Sheriff boundaries, `moz-*` wrapper rule, logical Tailwind utilities, `ngx-translate` key conventions, how to add a feature)
- [X] T057 Validate all scenarios in `specs/001-foundation-skeleton/quickstart.md`
- [X] T058 Write Phase 1 completion report in `specs/001-foundation-skeleton/summary.md` (Sheriff violation evidence, SSR i18n proof, initial bundle size, WCAG AA contrast table, and any deviations) and STOP for review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup (T001–T005)**: No dependencies — starts immediately.
- **Phase 2: Foundational (T006–T010)**: Depends on Phase 1 — blocks all user stories.
- **Phase 3: US1 Structure & Boundaries (T011–T017)**: Depends on Phase 2.
- **Phase 4: US3 Role Theming (T018–T025)**: Depends on Phase 2.
- **Phase 5: US4 Arabic/English & RTL (T026–T038)**: Depends on Phase 2.
- **Phase 6: US2 Design-System Layer (T039–T045)**: Depends on Phase 4 (`T024` PrimeNG preset).
- **Phase 7: US6 Dev Verification Page (T046–T051)**: Depends on US2, US3, and US4.
- **Phase 8: US5 Quality Gates (T052–T055)**: Depends on US1–US4 and US6.
- **Phase 9: Polish (T056–T058)**: Depends on all user stories completing.

### Parallel Opportunities

- **Phase 1**: `T004` (`tsconfig.json`) and `T005` (`package.json` scripts) can run in parallel.
- **Phase 2**: `T008` (`cookie.ts`) and `T010` (`core/config/`) can run in parallel.
- **Phase 3 (US1)**: `T011` (folders), `T012` (READMEs), and `T017` (`ADR-0001`) can run in parallel.
- **Phase 4 (US3)**: `T018` (contrast spec), `T019` (`ThemeService` spec), and `T025` (`ADR-0003`) can run in parallel.
- **Phase 5 (US4)**: `T026` (`LocaleService` spec), `T027` (`MozMissingTranslationHandler` spec), `T031` (`ar.json`/`en.json`), `T033` (`i18n/README.md`), and `T038` (`ADR-0004`) can run in parallel.
- **Phase 6 (US2)**: All 5 wrapper components (`T039`–`T043`) and `T045` (`ADR-0002`) can run in parallel.

---

## Parallel Example: User Story 2 (`moz-*` Wrappers)

```text
Task T039: Create MozButtonComponent in src/app/shared/ui/button/moz-button.component.ts
Task T040: Create MozInputComponent in src/app/shared/ui/input/moz-input.component.ts
Task T041: Create MozCardComponent in src/app/shared/ui/card/moz-card.component.ts
Task T042: Create MozDialogComponent in src/app/shared/ui/dialog/moz-dialog.component.ts
Task T043: Create MozSelectComponent in src/app/shared/ui/select/moz-select.component.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`T001`–`T005`)
2. Complete Phase 2: Foundational (`T006`–`T010`)
3. Complete Phase 3: User Story 1 (`T011`–`T017`)
4. **Validate**: Confirm Sheriff + ESLint boundary checks fail on forbidden imports and pass when clean.

### Incremental Delivery

1. Setup + Foundational → base build & lint green
2. US1 (Structure & Boundaries) → architectural guardrails active
3. US3 (Role Theming) + US4 (ngx-translate & RTL) → core runtime services and SSR i18n active
4. US2 (`moz-*` Design System) → reusable UI wrappers ready
5. US6 (Dev Verification Pages) → visual and SSR verification complete
6. US5 (Quality Gates) + Polish → all gates, budgets, and evidence recorded; stop for review.
