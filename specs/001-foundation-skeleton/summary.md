# Phase 1 Completion Report — Application Foundation Skeleton

- **Feature**: `001-foundation-skeleton`
- **Date**: 2026-11-11
- **Status**: Complete (`T001`–`T058` all `[X]`)

---

## 1. Deliverables Summary

1. **Folder Structure & Module Boundaries (US1 — AC1, AC2)**
   - Created `src/app/core`, `src/app/shared/ui`, and all 8 feature areas (`public`, `auth`, `student`, `parent`, `teacher`, `school`, `partner`, `admin`) with `pages/`, `ui/`, `data-access/`, and `models/` sub-layers and area `README.md` guides.
   - Configured `@softarc/eslint-plugin-sheriff` in `sheriff.config.ts` and `eslint.config.js` to enforce module boundaries (`feature -> feature`, `shared -> features`, `core -> features`, `public -> role feature`).
   - Added `no-restricted-imports` in `eslint.config.js` blocking `primeng/*` and `@primeuix/*` outside `src/app/shared/ui/**` (and `src/app/core/{theme,config}/**`).
   - Recorded proof of failure and recovery for all 5 boundary violation types in `specs/001-foundation-skeleton/evidence/boundaries.md`.

2. **Design-System Wrapper Layer (`moz-*`) (US2 — AC3, AC4)**
   - Implemented 5 standalone, `OnPush` wrapper components in `src/app/shared/ui/`:
     - `MozButtonComponent` (`moz-button`: `variant`, `size`, `disabled`, `loading`, `type`, `icon`, `iconPos`, `directionalIcon` with `rtl:scale-x-[-1]`, `clicked` output)
     - `MozInputComponent` (`moz-input`: `value = model<string>('')`, `labelKey`, `placeholderKey`, `helperKey`, `errorKey`, `type`, `disabled`, `invalid`, `id`)
     - `MozCardComponent` (`moz-card`: `titleKey`, `subtitleKey`, content and footer projection)
     - `MozDialogComponent` (`moz-dialog`: `visible = model<boolean>(false)`, `headerKey`, `modal`, `closable`, accessible `closeAriaLabel`)
     - `MozSelectComponent` (`moz-select`: `MozSelectOption<T>` interface, `value = model<T | null>(null)`, `options`, `labelKey`, `placeholderKey`, `disabled`, `invalid`)
   - Exported public APIs via `src/app/shared/ui/index.ts` without leaking PrimeNG types.

3. **Runtime Role Theming (US3 — AC5)**
   - Defined 6 role palettes (`student` `#2E7DFF`, `parent` `#10B981`, `teacher` `#8B5CF6`, `school` `#EF4444`, `partner` `#F59E0B`, `admin` `#4F46E5`) in `src/app/core/theme/role-palettes.ts` and `src/styles.css` (`html[data-role]`).
   - Synced Tailwind CSS v4 (`@theme inline`) and PrimeNG v22 (`MozAuraPreset` in `src/app/core/theme/moz-preset.ts`) to CSS variables `--moz-primary-50..950`.
   - Implemented SSR-safe `ThemeService` (`src/app/core/theme/theme.service.ts`) backed by cookie `moz_role` and pre-paint script in `src/index.html`.

4. **Arabic/English i18n & RTL Mirroring (US4 — AC6, AC7)**
   - Configured `@ngx-translate/core` v18 in `src/app/core/i18n/i18n.providers.ts` with `SSRTranslateLoader` (`TransferState` + server filesystem reader in `src/app/app.config.server.ts`) and `MozMissingTranslationHandler`.
   - Implemented `LocaleService` (`src/app/core/i18n/locale.service.ts`) managing `<html lang dir>` and cookie `moz_lang` (`ar` default `rtl`, `en` secondary `ltr`).
   - Self-hosted IBM Plex Sans Arabic WOFF2 fonts (`400`, `500`, `700`) in `public/fonts/`.
   - Added custom ESLint rules (`mozakrety/no-physical-direction`, `mozakrety/no-translate-instant`, `mozakrety/no-untranslated-template-text`) and `tools/i18n-check.mjs` (`npm run i18n:check`).
   - Recorded lint/i18n violation proof in `specs/001-foundation-skeleton/evidence/lint-rules.md` and SSR view-source proof (`Cookie: moz_lang=ar` and `Cookie: moz_lang=en`) in `specs/001-foundation-skeleton/evidence/i18n-ssr.md`.

5. **Removable Dev Verification Pages & Quality Gates (US5, US6 — AC8, AC9)**
   - Created `/dev/foundation` (`src/app/dev/foundation.page.ts`, `RenderMode.Client`) and `/dev/i18n-ssr` (`src/app/dev/i18n-ssr.page.ts`, `RenderMode.Server`), excluded from production builds via `fileReplacements` (`src/app/dev/dev.routes.prod.ts`).
   - Verified `DEV_FOUNDATION_VERIFICATION_PAGE_REMOVABLE` is completely absent from `dist/mozakrety/` in production builds.
   - Configured and verified bundle budgets (`specs/001-foundation-skeleton/evidence/budgets.md`).

6. **Architecture Decision Records & Documentation (AC10)**
   - `docs/adr/0001-single-app-no-nx.md`
   - `docs/adr/0002-primeng-behind-moz-ui.md`
   - `docs/adr/0003-role-theming-css-variables.md`
   - `docs/adr/0004-ngx-translate-for-i18n.md`
   - `docs/architecture/structure.md`
   - `AGENTS.md`

---

## 2. WCAG AA Contrast Verification Table

Verified programmatically in `src/app/core/theme/role-palettes.spec.ts` (`19` assertions passing):

| Role | Base (`500`) | Primary Filled Surface (`600`) | Text on `600` (`#FFFFFF`) Contrast | Text on `500` (`--moz-on-primary-500`) Contrast | UI Boundary (`500` on `#FFFFFF`) |
| :--- | :--- | :--- | ---: | ---: | ---: |
| `student` | `#2E7DFF` | `#1D5ED8` | `5.74 : 1` (AA Pass) | `5.04 : 1` (AA Pass) | `3.82 : 1` (`>= 3:1` Pass) |
| `parent` | `#10B981` | `#047857` | `5.48 : 1` (AA Pass) | `7.11 : 1` (AA Pass) | `2.54 : 1` (`600` used for boundaries) |
| `teacher` | `#8B5CF6` | `#6D28D9` | `7.00 : 1` (AA Pass) | `4.58 : 1` (AA Pass) | `4.23 : 1` (`>= 3:1` Pass) |
| `school` | `#EF4444` | `#DC2626` | `4.83 : 1` (AA Pass) | `4.77 : 1` (AA Pass) | `3.76 : 1` (`>= 3:1` Pass) |
| `partner` | `#F59E0B` | `#B45309` | `5.02 : 1` (AA Pass) | `8.44 : 1` (AA Pass) | `2.15 : 1` (`600` used for boundaries) |
| `admin` | `#4F46E5` | `#4338CA` | `8.04 : 1` (AA Pass) | `6.29 : 1` (AA Pass) | `6.29 : 1` (`>= 3:1` Pass) |

---

## 3. Production Bundle Measurements

| Bundle / Chunk | Raw Size | Estimated Transfer Size (Gzip/Brotli) |
| :--- | ---: | ---: |
| `main-YBUHAUG4.js` | `376.44 kB` | `102.53 kB` |
| `styles-IHQF5WWH.css` | `36.08 kB` | `6.72 kB` |
| **Initial Total** | **`412.52 kB`** | **`109.26 kB`** |

---

## 4. Technical Refinements & Deviations Recorded

1. **`tailwindcss-primeui` in Tailwind v4 CSS-first mode**: `tailwindcss-primeui@0.6.1` exposes its Tailwind v4 entry via `"style": "./v4/index.css"`, so it is loaded with `@import 'tailwindcss-primeui';` in `src/styles.css` rather than `@plugin`.
2. **PrimeNG v22 Aura Preset Tree-Shaking**: Importing `@primeuix/themes/aura` pulls all 90+ PrimeNG component token definitions into the initial bundle. In accordance with Constitution Principle VIII (no barrel imports), `src/app/core/theme/moz-preset.ts` imports `@primeuix/themes/aura/base` and only the wrapped component token modules (`button`, `card`, `dialog`, `inputtext`, `ripple`, `select`), reducing the raw initial bundle by `91.71 kB`.
3. **Angular 22 SSR `allowedHosts`**: Added `"allowedHosts": ["localhost"]` in `angular.json` so local SSR verification (`http://localhost:*`) succeeds without SSRF host header rejection.
