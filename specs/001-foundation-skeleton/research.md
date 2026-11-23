# Research: Phase 1 — Foundation Skeleton

Sources: Angular CLI MCP (`get_best_practices`, `search_documentation`), web search for third-party
docs (secondary), constitution, current scaffold. **"Verify"** = confirm against primary docs
immediately before implementing (Principle I).

## Current state
- Angular ^22.2 + SSR + Vitest + jsdom + Prettier; TypeScript ~6.0.
- **Missing in checkout**: all libraries named in the plan input; ESLint config; `strict` flag; explicit zoneless provider (`app.config.ts` only has `provideBrowserGlobalErrorListeners`, router, hydration).
- `app.routes.server.ts` prerenders `**`; `angular.json` initial budget 500 kB/1 MB, component style 4/8 kB.

## D1 Tailwind (item 1)
- **Decision**: Tailwind v4 CSS-first: `.postcssrc.json` with `{"plugins":{"@tailwindcss/postcss":{}}}` and `@import "tailwindcss";` in `src/styles.css`; theme tokens in `@theme`.
- **Role variables**: `:root` / `[data-role='student'|…|'admin']` set `--moz-primary-50…950`; `@theme inline { --color-primary-50: var(--moz-primary-50); … }` so `bg-primary-500` follows the active role at runtime. Default (no attribute) = student. Verify: `@theme inline` semantics for variable references.
- **Logical utilities**: `ms-/me-/ps-/pe-/start-/end-/text-start/text-end`, `border-s/e`, `rounded-s/e`.
- **Shade scales**: generated once (e.g. via OKLCH lightness ramp from the base color as shade 500), committed as CSS, with a contrast unit test. Base colors vs white text (measured now): student 3.82, parent 2.54, teacher 4.23, school 3.76, partner 2.15 — **all fail AA (4.5) at shade 500 with white text**.
  - Rule: filled controls use a darker shade (600/700, chosen per role to reach ≥ 4.5 with white) or dark text on light shades; `--moz-on-primary` token per role. Dark text on partner 500 is 8.31 (ok), on parent 7.04 (ok), on student 4.67, school 4.74 (ok); teacher 4.22 (fails) → teacher uses a darker shade with white. The final table comes from the test and goes into the phase summary.

## D2 PrimeNG (item 2)
- **Decision**: `providePrimeNG({ theme: { preset, options: { cssLayer: { name: 'primeng', order: … } } } })` with `definePreset(Aura, { semantic: { primary: { 50: 'var(--moz-primary-50)', … } } })` referencing the role variables. Tailwind v4 layer order from the docs is `theme, base, primeng` (+ utilities after). Plugin `@plugin "tailwindcss-primeui"`.
- **Verify** (search results disagree on package name): package is `@primeuix/themes` (per plan input) vs older `@primeng/themes` in snippets; confirm preset import path (`@primeuix/themes/aura`), whether preset values accept `var(--…)` strings, whether animations provider is still needed in PrimeNG for Angular 22, and the exact `order` string including Tailwind `utilities`.
- **RTL**: per docs, PrimeNG supports RTL natively through logical CSS properties; setting `dir="rtl"` on `<html>` is enough. No extra config; verified visually on the dev page.
- **Imports**: per-component (`primeng/button`, etc.), only inside `shared/ui`.

## D3 `shared/ui` wrappers (item 3)
- **Decision**: `moz-button`, `moz-input`, `moz-card`, `moz-dialog`, `moz-select`; each standalone, default OnPush, `input()`/`output()`/`model()`, own prop names/types (e.g. `variant`, `size`, `disabled`, `label`), no PrimeNG types in public API. Text arrives via inputs/content (translated by consumers).
- **Forms**: `moz-input`/`moz-select` integrate with Signal Forms or `ControlValueAccessor` — Verify the current guidance for custom form controls in v22 (`@angular/forms/signals`).
- **Lint**: `no-restricted-imports` patterns `primeng`, `primeng/*`, `@primeuix/*` for all files except `src/app/shared/ui/**` (flat-config override). Tested with a throwaway violation.

## D4 ThemeService (item 4)
- **Decision**: `Role = 'student'|'parent'|'teacher'|'school'|'partner'|'admin'`; `currentRole` signal; `setRole()` writes `data-role` on `<html>` (via `DOCUMENT`, SSR-safe) and persists in a cookie `moz_role`.
- **No flash**: inline script in `index.html` copies cookie → `data-role` before first paint; on the server the same cookie is read from the request so SSR HTML already has the attribute (matters for later public pages). Hydration safety verified (attribute on `<html>` is outside the app root).
- **Admin palette (proposal)**: neutral **slate** scale with an indigo accent for focus rings (`#4F46E5` ≈ indigo-600); admin keeps AA for white text on 700. Documented in ADR-0003.

## D5 i18n and direction (item 5)
- **Library**: ngx-translate `@ngx-translate/core` and `@ngx-translate/http-loader` ^18.1.0 (installed). Setup shape to verify in the official docs (ngx-translate.org) before coding: `provideTranslateService({ lang: 'ar', fallbackLang: 'ar', loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }), missingTranslationHandler })` plus `provideHttpClient(withFetch())`. Web-search snippets conflicted on option names (`lang`/`fallbackLang` vs `defaultLang`, `setDefaultLang`) and on `prefix` paths, so nothing is assumed: the exact v18 option names, `TranslateService.stream()`/`currentLang` signal behavior and the `translate` pipe are confirmed first (Task T027).
- **Files**: one file per language only: `public/i18n/ar.json`, `public/i18n/en.json`. **No per-feature lazy scopes in Phase 1.** Later approach (documented in `src/app/core/i18n/README.md` and ADR-0004): each feature gets its own folder `features/<name>/i18n/{ar,en}.json` merged with a scope-aware loader or loaded with `translate.setTranslation(lang, json, true)` from the feature's route providers; keys stay prefixed by feature so merging cannot collide.
- **SSR-safe loading** (requirement: server HTML already translated, no raw keys, no hydration mismatch, no flash, no browser refetch):
  - *Option A (preferred, least code)*: `TranslateHttpLoader` over `HttpClient`; on the server the request is resolved against the app origin (verify Angular 22 SSR relative-URL behavior, including for prerender) and the response is replayed on the client by Angular's HTTP transfer cache enabled by `provideClientHydration()` (verify default and `withHttpTransferCacheOptions`). Language files must be fully loaded before first render: an app initializer awaits `translate.use(lang)` (`provideAppInitializer`).
  - *Option B (fallback if A leaks relative-URL or caching issues)*: a custom `TranslateLoader` that on the server reads `dist/.../browser/i18n/{lang}.json` from the filesystem (or fetches an absolute URL) and stores it in `TransferState` under key `i18n:{lang}`; in the browser it reads `TransferState` first and only falls back to HTTP.
  - Either way, **no `instant()`** and no `setTimeout`-based waiting; the app initializer guarantees translations exist when the first template renders.
  - **Proof (AC4)**: a dev-only SSR route `/dev/i18n-ssr` (`RenderMode.Server`, excluded from production like the dev page) renders translated headings; with `curl`/view-source in both languages (cookie `moz_lang=ar` and `en`) the HTML contains the translated text and no raw keys, the page hydrates without console mismatch errors, and the browser Network panel shows no request for `i18n/{lang}.json` after hydration for the initial language. Evidence goes to `specs/001-foundation-skeleton/evidence/i18n-ssr.md`.
  - **Prerender caveat**: a prerendered HTML file is fixed at build time and cannot honor a per-visitor cookie. Phase 1 therefore proves SSR (cookie-aware). Prerendered pages in later phases will need the language in the URL (`/ar/…`, `/en/…`, also needed for hreflang) or must be SSR; this is recorded in ADR-0004 and decided in the routing/SEO phase.
- **LocaleService**: `currentLang` signal; `setLang()` calls `TranslateService.use(lang)`, then sets `<html lang dir>` and persists cookie `moz_lang`; reads the cookie on the server through the request (Angular SSR request token, verify for 22) and in the browser via `document.cookie`; default `ar`; first-visit detection from `Accept-Language` (server) / `navigator.languages` (browser), fallback `ar`.
- **Key conventions** (chosen and documented in `src/app/core/i18n/README.md`): nested JSON objects, **lower snake_case segments, dot-separated, prefixed by feature or area**: `common.actions.save`, `dev.foundation.title`, `public.teachers.list_title`. UPPER_CASE keys are not used. Keys are string literals (so the extractor can see them); no dynamic key concatenation.
- **Usage**: templates use the `translate` pipe; in TS use `toSignal(translate.stream('key'), { initialValue: '' })` (or the v18 signal API if the docs provide one); `instant()` is forbidden by lint (`no-restricted-syntax` on `.instant(`) except in tests.
- **Missing/unused keys**: (1) *missing-key handler* `MozMissingTranslationHandler`: in dev it logs `console.error` with the key and returns a visible marker (`⚠ key`); in unit tests and the SSR proof it throws, so it fails loudly; in production it logs once and returns the fallback-language text. (2) *Extraction check*: candidates are `@colsen1991/ngx-translate-extract` (maintained fork of `biesbjerg/ngx-translate-extract`) and other recent forks; the original is unmaintained. Select by checking npm (last publish date, Angular 22/ngx-translate 18 compatibility, template pipe support) in Task T034a; if none works with v18 and signals, fall back to a small in-repo Node script (`tools/i18n-check.mjs`) that scans `src/**/*.{ts,html}` for `'…' | translate`, `translate.stream('…')` literals and compares against `ar.json` and `en.json` (missing in either language, unused keys, and keys present in only one language). Wired as `npm run i18n:check` (fails on missing keys and on ar/en mismatch; unused keys reported as errors too) and run inside `npm run lint`.
- **Arabic plurals**: Arabic needs six CLDR categories (zero, one, two, few, many, other); ngx-translate has no ICU support by default. A candidate is `ngx-translate-messageformat-compiler` (MessageFormat); web results showed only old-style setup (`TranslateModule`/factory) and give no evidence of v18/Angular 22 compatibility, so it is **not trivial** → **deferred, recorded as a decision in ADR-0004**: until a feature needs plurals, avoid count-dependent sentences; when needed, evaluate the MessageFormat compiler for v18 (or an `Intl.PluralRules` helper that selects `key.zero|one|two|few|many|other`, which has no extra dependency and already supports Arabic).
- **Cookie attrs**: `Path=/; Max-Age=1y; SameSite=Lax` (+ `Secure` in production); no personal data.
- **Font**: **IBM Plex Sans Arabic** (self-hosted WOFF2, weights 400/500/700, `font-display: swap`, `unicode-range` split), Latin glyphs from the same family for English consistency; fallback stack `system-ui, 'Segoe UI', Tahoma, sans-serif` (Tahoma/Segoe render Arabic well on Windows). Alternative: Cairo (rounder, friendlier) — rejected for lower body-text legibility at small sizes. Verify license (OFL) and package source (e.g. fontsource).
- **Physical-direction check**: ESLint rule (`no-restricted-syntax` / template-literal regex, or small script wired to `npm run lint`) rejecting `\b(ml|mr|pl|pr|left|right|text-left|text-right|border-l|border-r|rounded-l|rounded-r|float-left|float-right)-` classes in templates and TS strings, with a documented allow-list (e.g. `left-1/2` centering combined with `-translate-x`, third-party markup) marked by an `// moz-allow-physical: reason` comment. Verify ESLint flat-config selector approach for inline and external Angular templates.
- **Hardcoded strings**: angular-eslint template rule(s) for literal text (verify which rule exists/what is needed; otherwise a custom template check).

## D6 Structure and boundaries (item 6)
- **Decision**: `sheriff.config.ts` (verify current format: `version`, `entryFile`, `tagging`, `depRules`, `enableBarrelLess`/barrel policy): tags `core`, `shared`, `feature:public`, `feature:auth`, `role:<name>`; rules — `core` → none of features; `shared` → no `core`, no features; `feature:*` → `shared`, `core` only, never another feature; `feature:public` → never role features. ESLint flat config applies `@softarc/eslint-plugin-sheriff`.
- **Open question for implementation**: Sheriff by default expects barrel `index.ts` encapsulation; decide barrel-less mode vs barrels (the project forbids "barrel imports" only for PrimeNG). Default proposal: barrel-less mode to avoid friction; record in ADR-0001.
- **Proof**: add the 4 violation types (feature→feature, shared→features, core→features, public→role feature), run lint, capture failing output, remove, run lint passing; record in the phase summary. (A 5th check, `primeng` outside `shared/ui`, proven separately.)

## D7 Quality gates (item 7)
- **tsconfig**: `strict: true`, `noImplicitReturns` (present), `noFallthroughCasesInSwitch` (present), `noImplicitOverride` (present), `noPropertyAccessFromIndexSignature` (present), add `noUncheckedIndexedAccess` — recommended **on**: friction is mostly array indexing in a small codebase now; cheaper to adopt now than later. If it causes real friction in Phase 1, turn it off and record the reason.
- **ESLint**: angular-eslint recommended TS + template + `templateAccessibility` rules; typescript-eslint; Sheriff; Prettier config kept.
- **Budgets** (verified: Angular budgets measure **raw/uncompressed** file size, not gzip): initial warning **300 kB** / error **500 kB** raw to start, tightened after measuring the real build; `anyComponentStyle` warning 4 kB / error 8 kB (existing). Report initial raw and (separately) estimated transfer size.
- **Scripts**: `lint` (`ng lint`), `test`, `build`, `typecheck` (`tsc --noEmit -p tsconfig.app.json` and spec project); no CI file.
- **Samples**: `ThemeService` spec (default, set role, DOM attribute, cookie, invalid cookie), `LocaleService` spec (default `ar`, set `en` → `dir=ltr`, invalid cookie, detection), plus the contrast test.

## D8 Dev page (item 8)
- **Decision**: `src/app/dev/dev.routes.ts` lazy-loaded; `app.routes.ts` imports routes via a path that production replaces with an empty file (`fileReplacements`) so the page code is absent from `dist`. Route `/dev/foundation`; `app.routes.server.ts` entry `{ path: 'dev/**', renderMode: RenderMode.Client }`. Verify: `fileReplacements` support in `@angular/build:application` v22, and RenderMode names.
- **Proof**: production build, grep `dist` for the page marker string → none; `/dev/foundation` falls to not-found.
- **Also**: `app.routes.server.ts` currently prerenders `**`; set the default for the rest to Client for Phase 1? Decision: keep Prerender for `''`, Client for `dev/**`; revisit when routes exist.

## D9 Docs (item 9)
- Update `AGENTS.md` (the existing agent file; `CLAUDE.md` and `.gemini` copies are checked for duplicates) with a short "Conventions" section: structure, boundaries, no direct PrimeNG, logical utilities, i18n keys, how to add a feature; do not duplicate the constitution.
- ADR-0001 single app no Nx; ADR-0002 PrimeNG behind `moz-*`; ADR-0003 role theming via CSS variables (includes admin palette, contrast rule, cookie strategy).

## D10 Deviations from the supplied plan (recorded now)
1. Dependencies are not actually installed → install step added.
2. Budget numbers are raw, not "gzipped-equivalent" (Angular measures raw); spec SC-007's 150 kB transfer target is checked separately as transfer size.
3. Spec said preferences in "browser storage"; plan input requires cookies → spec and data model updated.
4. Spec lists 5 themes + neutral default; plan input adds `admin` as a sixth role palette → spec updated.
5. i18n library is ngx-translate (amendment), no per-feature scopes this phase, plurals deferred (ADR-0004)
6. Playwright deferred (Constitution XIII gap, justified in plan).
7. Dev route path is `/dev/foundation` (spec said `/dev`).
