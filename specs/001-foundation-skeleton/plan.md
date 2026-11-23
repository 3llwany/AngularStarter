# Implementation Plan: Phase 1 — Application Foundation Skeleton

**Branch**: `001-foundation-skeleton` | **Date**: 2026-11-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-foundation-skeleton/spec.md` plus the technical plan supplied by the user with `/speckit-plan` (9 work items).

## Summary

Turn the `ng new` app (Angular 22, SSR, zoneless) into the foundation skeleton:
- **Role Theming & Tokens**: 5 authoritative role hexes at step `500` (`student #2E7DFF`, `parent #10B981`, `teacher #8B5CF6`, `school #EF4444`, `partner #F59E0B`) plus provisional `admin #4F46E5`. Full 50–950 scales defined in ONE single location as CSS variables per `[data-role]` (generated in OKLCH maintaining hue stability around immutable step 500; steps other than 500 marked provisional). Each role defines `--primary-contrast` and `--primary-gradient`.
- **Styling & Preset Sync**: Tailwind reads these via `@theme inline` (`--color-primary-*`). PrimeNG `UiThemePreset` / `MozAuraPreset` is kept thin (no hardcoded palettes), pointing `semantic.primary` and contrast color directly to the CSS variables.
- **Typography**: User will provide the production font. Until provided, a neutral placeholder `--font-sans` with an Arabic-capable fallback stack is defined in `@theme` and on `body` with `font-display: swap`. PrimeNG inherits typography from `body` (no font set in the preset).
- **Reusable UI Library**: Located in `src/app/shared/ui` (`github.com/3llwany/ng-ui-components`), reusing existing components (`button`, `input`, `select`, `datepicker`, `switch`), extending where needed, and adding generic `card` and `dialog` with logs in `docs/ui-library-contributions.md`.
- **Services & i18n**: `ThemeService` and `LocaleService` in `core` (SSR-safe, cookie-based, no flash); ngx-translate (`ar` default, `en`; one JSON per language; SSR-safe loading with TransferState; missing/unused key checks).
- **Architecture & Quality**: Sheriff + ESLint boundaries proven with deliberate violations; strict TypeScript, ESLint, Vitest samples and budgets; client-rendered dev page at `/dev/foundation` plus a dev-only SSR probe route for i18n view-source proof, both excluded from production; short docs and ADRs 0001–0004. Details and verified facts: [research.md](research.md).

> **Principle I — consultation log (this planning pass)**: Angular CLI MCP `get_best_practices`
> (workspace-aware) and `search_documentation` (zoneless, size budgets) were used. Third-party syntax was
> checked through web search only (PrimeNG layers/RTL, Tailwind PostCSS, Sheriff, budgets) because the
> PrimeNG MCP `get_setup` returned no content. Therefore **every item below is re-verified against the
> primary docs (Angular MCP, PrimeNG MCP/docs, tailwindcss.com, ngx-translate, Sheriff) immediately before it
> is implemented**; mismatches are recorded as deviations.

> **Important discrepancy found**: the plan input says the libraries are already installed, but in this
> checkout `package.json` and `node_modules` contain **none** of them (tailwindcss, @tailwindcss/postcss,
> postcss, primeng, @primeuix/themes, primeicons, tailwindcss-primeui, @ngrx/signals, angular-eslint,
> @softarc/sheriff-core/eslint plugin, the i18n library is now ngx-translate, see research D5), and there is no ESLint config. Task 0 of
> implementation installs and pins them (or you push the dependency changes first). Also no zoneless
> provider is visible in `app.config.ts`; this is verified against the Angular 22 docs (item 7/Task 0).

## Technical Context

**Language/Version**: TypeScript ~6.0 (`strict` to be enabled), Angular ^22.2 (SSR scaffolded)

**Primary Dependencies**: tailwindcss + @tailwindcss/postcss + postcss, primeng + @primeuix/themes + primeicons + tailwindcss-primeui, @ngx-translate/core ^18.1.0 + @ngx-translate/http-loader ^18.1.0 (installed), @ngrx/signals (installed, unused in Phase 1), angular-eslint + typescript-eslint, @softarc/sheriff-core + @softarc/eslint-plugin-sheriff, Prettier

**Storage**: Cookies for language (and theme) so the server and a pre-paint script can read them; no personal data

**Testing**: Vitest through `ng test` (jsdom); sample tests for ThemeService and LocaleService; a contrast test; boundary-violation proof run manually and recorded

**Target Platform**: Evergreen browsers + Node SSR server (already scaffolded)

**Project Type**: Single Angular web application

**Performance Goals**: Initial bundle warning ~300 kB / error ~500 kB **raw (uncompressed)** per Angular budget semantics (see research D10); theme/language switch < 200 ms; no wrong-theme/language frame

**Constraints**: Zoneless; default OnPush (never set explicitly); no dark mode; logical utilities only; no hardcoded strings; no direct `primeng/*` imports outside `shared/ui`

**Scale/Scope**: 8 feature areas (empty), 5 `moz-*` wrappers, 1 dev page, 2 languages, 6 role palettes (5 brand + neutral admin)

## Constitution Check

*GATE: passed before Phase 0; re-checked after Phase 1 design — passes.*

| Principle | Status | How |
|-----------|--------|-----|
| I. Angular first | PASS | Consultation log above; verify-before-implement rule per item |
| II. Modern Angular | PASS | Zoneless, signals, default OnPush, `inject()`, `input()/output()`, control flow; ESLint enforces |
| III. Single app/structure | PASS | Item 6; README + `.gitkeep` per area |
| IV. Boundaries | PASS | Sheriff tags/rules + ESLint; violation proof in phase summary |
| V. Routing by role | N/A | Out of scope; dev route only |
| VI. SOLID/plug-ins | PASS (YAGNI) | Services behind `inject()`; no registries yet |
| VII. State | PASS | Signals; SignalStore installed, first use in a feature |
| VIII. UI system | PASS | Item 3; `no-restricted-imports` for `primeng/*` outside `shared/ui` |
| IX. RTL + i18n | PASS | Items 1, 2, 5; lint for physical utilities and strings |
| X. Rendering/SEO | PARTIAL | Dev page = client render; code SSR-safe; SEO later |
| XI. Performance | PASS | Lazy dev route, budgets error, per-component imports |
| XII. Security/privacy | PASS | Cookies hold only language/theme; no tokens |
| XIII. Quality gates | PARTIAL (justified) | strict/lint/unit/build; **Playwright deferred** — no critical user flows exist yet (ADR-free note in summary); axe/contrast covered by unit contrast test and ESLint a11y template rules |
| XIV. Process | PASS | Stop for review after the summary |
| XV. Library-First UI | PASS | Reuses `button`, `input`, `select` (and `datepicker`, `switch`) from `ng-ui-components`; adds generic `card` and `dialog` following library conventions; logs all changes in `docs/ui-library-contributions.md` |

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation-skeleton/
├── plan.md  research.md  data-model.md  quickstart.md
├── contracts/ui-contracts.md
└── tasks.md            # next: /speckit-tasks
```

### Source Code (repository root)

```text
.postcssrc.json  eslint.config.js  sheriff.config.ts  .prettierrc
src/
├── index.html                       # pre-paint inline script (lang/dir/data-role from cookies)
├── styles.css                       # @import "tailwindcss"; @plugin "tailwindcss-primeui"; layer order; role vars; @font-face
├── main.ts / main.server.ts / server.ts
└── app/
    ├── app.config.ts  app.config.server.ts  app.routes.ts  app.routes.server.ts
    ├── core/
    │   ├── README.md
    │   ├── theme/    # Role type, role palettes, ThemeService (+ spec), PrimeNG preset
    │   ├── i18n/     # ngx-translate config, SSR loader, missing-key handler, LocaleService (+ spec)
    │   └── platform/ # SSR-safe cookie/document access
    ├── shared/
    │   ├── README.md
    │   └── ui/       # moz-button, moz-input, moz-card, moz-dialog, moz-select
    ├── features/
    │   └── {public,auth,student,parent,teacher,school,partner,admin}/
    │       └── README.md + {pages,ui,data-access,models}/.gitkeep
    └── dev/          # TEMPORARY: foundation.page.ts, dev.routes.ts (excluded from prod)
public/fonts/  public/i18n/{ar,en}.json  tools/i18n-check.mjs (only if no maintained extractor fits)
docs/adr/0001-single-app-no-nx.md 0002-primeng-behind-moz-ui.md 0003-role-theming-css-variables.md 0004-ngx-translate-for-i18n.md
```

**Structure Decision**: single app; `src/app/dev/` is deleted as one folder; production excludes it via
build-time file replacement of the dev routes file (verified by `grep` of `dist`; see research D9).

## Complexity Tracking

| Deviation | Why | Simpler alternative rejected because |
|-----------|-----|--------------------------------------|
| Playwright E2E not added this phase | No critical flows yet; unit tests cover services | Adds browser infra for no flow; to be added with first flow (auth) |
