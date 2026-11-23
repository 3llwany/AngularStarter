<!--
Sync Impact Report
Version change: 1.0.1 -> 1.1.0 (MINOR: Added Principle XV "Library-First UI Components (ng-ui-components)" and updated Principle VIII to reflect that src/app/shared/ui is a synchronized copy of github.com/3llwany/ng-ui-components using app-* selectors and library conventions rather than project-specific moz-* wrappers. Amendment requested by the user on 2026-11-11.)
Modified principles:
- VIII. UI System (updated from moz-* wrappers to shared library components in src/app/shared/ui)
Added principles:
- XV. Library-First UI Components (ng-ui-components)
Added sections: none
Removed sections: none
Deferred items: none
Notes:
- Principle II states "OnPush behavior via the framework default" to stay consistent with AGENTS.md
  (do not set ChangeDetectionStrategy.OnPush explicitly on Angular v22+).
- Principle I lists `find_examples` as "when available"; the configured angular-cli MCP currently exposes
  get_best_practices and search_documentation (plus ai_tutor).
-->

# Mozakrety (مذاكرتي) Constitution

Mozakrety is the Angular web frontend of a student-centered social learning platform with the roles
Student, Parent, Teacher, School, Partner and Admin. The backend is a separate single API. Students
are mostly minors. Extensibility and long-term maintainability are the top priorities. Every rule
below is non-negotiable and MUST be verifiable in code review.

## Core Principles

### I. Angular Best Practices First
Before writing ANY Angular code, the author MUST consult the Angular CLI MCP tools
(`get_best_practices`, `search_documentation`, and `find_examples` when available) and follow current
official guidance. APIs, decorators and config syntax MUST NOT be guessed. If a rule in this
constitution conflicts with current official guidance, work MUST stop and the conflict MUST be raised
to the maintainers before continuing.
Rationale: Angular evolves quickly; guessing produces deprecated or wrong code.

### II. Modern Angular Only
Use the latest stable Angular with: standalone components (never set `standalone: true` explicitly
when it is the default), zoneless change detection, Signals, OnPush behavior (via the framework
default; do not set it explicitly when it is the default), native control flow (`@if`, `@for` with
`track`, `@switch`), `inject()`, and `input()`/`output()`/`model()`. NgModules, `*ngIf`/`*ngFor`/
`*ngSwitch`, constructor injection, `@HostBinding`/`@HostListener`, `ngClass` and `ngStyle` are
forbidden.

### III. Single App, Fixed Structure
The project is a single Angular app; Nx and monorepo tooling MUST NOT be introduced.
Structure: `src/app/core`, `src/app/shared`,
`src/app/features/{public,auth,student,parent,teacher,school,partner,admin}`.
Each feature MUST contain `pages/` (smart components), `ui/` (presentational components),
`data-access/` (store, repository, mappers) and `models/`. New top-level folders require an ADR.

### IV. Enforced Boundaries
Boundaries MUST be enforced by Sheriff plus ESLint, and a violation MUST fail lint:
- features never import other features;
- `shared` never imports `features` or `core`;
- `core` never imports `features`;
- `features/public` never imports role features.
Shared needs go through `shared`, or through DI tokens provided by `core`. Disabling a boundary rule
requires an ADR.

### V. Role-Based Routing
Each role is a lazy-loaded area with its own shell. Role areas MUST use `canMatch` (never
`canActivate`) via one parametric `roleGuard(role)`. Guards are UX only; real authorization is
enforced by the backend, and the frontend MUST NOT be treated as a security boundary.

### VI. SOLID, Clean Code, Plug-in Extensibility
- Components MUST NOT call `HttpClient` directly; they talk to a facade or store.
- Data access goes through an abstract repository (DI token) plus DTO-to-domain mappers; DTOs never
  reach templates.
- Role-specific behavior (e.g. login per role) uses Strategy/Factory.
- Cross-cutting extension points (navigation, Passport widgets, etc.) use `multi: true` registry
  tokens so new features plug in WITHOUT editing existing code.
- Patterns MUST only be applied where they solve a real need (YAGNI); reviewers MAY reject
  speculative abstraction.

### VII. State Management
Signals for local state; NgRx SignalStore for feature state; `httpResource`/`resource` for server
data; RxJS only for real streams (events, websockets, debounce, etc.). Classic NgRx Store
(actions/reducers/effects) MUST NOT be used. State transformations are pure; `mutate` is forbidden.

### VIII. UI System
PrimeNG (styled mode, custom preset in `src/app/shared/ui/foundation/theme-preset.ts`) plus Tailwind.
PrimeNG MUST always be encapsulated inside `src/app/shared/ui` (the shared UI library); features MUST
NOT import PrimeNG components directly. Role palettes (five brand palettes plus neutral admin) switch
at runtime via CSS variables on `[data-role]`. PrimeNG is imported per component, never as a whole.

### IX. RTL and i18n From Day One
Arabic and English are supported from the first commit. Only Tailwind logical utilities
(`ms/me/ps/pe/start/end`, etc.) are allowed; `ml/mr/pl/pr/left/right` are forbidden. No hardcoded
user-facing strings; all text goes through ngx-translate keys (`@ngx-translate/core`) with both languages provided.

### X. Hybrid Rendering and SEO
Rendering is chosen per route: prerender static pages; SSR for public dynamic SEO pages (teachers,
courses, lectures, schools, mall partners); client rendering for `auth` and all role areas.
Everything under `features/public` MUST be SSR-safe (no direct `window`/`document`/`localStorage`),
render anonymous content on the server, and handle SEO: title, meta, canonical, Open Graph, hreflang,
JSON-LD, a real 404 status, and `{id}-{slug}` URLs with a 301 to the canonical URL.

### XI. Performance
Lazy-loaded routes; `@defer` for below-the-fold content; `NgOptimizedImage` for static images;
per-component PrimeNG imports; bundle budgets configured so that exceeding them fails the build; no
request waterfalls on the server (independent requests run in parallel).

### XII. Security and Privacy
- The frontend NEVER computes wallet, Moz Coins or discounts; it only displays server values.
- Tokens live in HttpOnly cookies, never in `localStorage`/`sessionStorage`.
- Role areas and personal pages are `noindex`.
- Minors' personal data (names, photos) MUST NOT be exposed on public pages without explicit consent.

### XIII. Quality Gates
TypeScript strict; ESLint clean; build passes; Vitest unit tests for stores, mappers, strategies and
guards; Playwright E2E for critical flows. Accessibility MUST meet WCAG AA and pass AXE checks.
A change is not done until build, lint and tests pass.

### XIV. Process
Work in small phases; after each phase, summarize what changed and stop for review. Features that were
not requested MUST NOT be implemented. Significant architectural decisions are recorded as short ADRs
in `docs/adr/`.

### XV. Library-First UI Components (`ng-ui-components`)
`src/app/shared/ui` is a synchronized copy of the maintainer's reusable UI library
(`github.com/3llwany/ng-ui-components`), managed via `git ui-list` and `git ui-add <name>`. Each
component lives in its own kebab-case folder alongside `src/app/shared/ui/foundation/`. Whenever a
task requires a UI component (button, input, select, datepicker, switch, dialog, card, table, etc.):

1. **Check the library first**:
   - Inspect `src/app/shared/ui` for an existing component folder.
   - If absent locally, check `git ui-list`. If present in the library repo, bring it in with
     `git ui-add <name>` (or ask the maintainer to run the alias if blocked by environment).
   - If it exists (locally or in the library), **USE IT**. Never create a parallel or duplicate
     component, and never import PrimeNG directly outside `src/app/shared/ui`.
2. **Extend in place when needed**:
   - If an existing library component lacks a needed capability, extend it in place with a
     backward-compatible change (new optional `input()`/`output()`/content slot, preserving existing
     defaults). Never fork it into a Mozakrety-specific variant. Record the change in
     `docs/ui-library-contributions.md`.
3. **Create new generic components in the library**:
   - If the component does not exist in `src/app/shared/ui` or `git ui-list`, create it inside
     `src/app/shared/ui/<kebab-name>/` following the exact conventions of `foundation` and existing
     components (`app-<name>` selector, `App<Name>` class with `<Name>` alias export, Signal Forms
     `field` + `ValidationMessageService` + `createUniqueId` + `APP_VARIANT` where applicable,
     Vitest `.spec.ts`, and folder `README.md`/`<name>.doc.md`), export it from
     `src/app/shared/ui/index.ts`, and log it in `docs/ui-library-contributions.md`.
4. **Contributions log & Git alias safety**:
   - Maintain `docs/ui-library-contributions.md` for every created or modified library component
     (component name, what changed, files touched, any new dependencies, date).
   - Agents MUST NEVER run `git ui-push`, `git ui-pull`, `git ui-init`, or push/commit to the library
     repository.
   - Never modify `src/app/shared/ui/foundation` unless a task strictly requires it; if required,
     call it out explicitly in `docs/ui-library-contributions.md` because it affects all projects.
5. **Keep the library 100% domain-agnostic**:
   - No Mozakrety-specific role names, wallet/coins/passport/teacher/student logic, API calls,
     routes, or project-specific translation keys inside `src/app/shared/ui`. Domain-specific UI
     belongs in the owning feature's `ui/` folder and composes library components.

## Technology & Architecture Constraints

- Stack: Angular (latest stable), TypeScript strict, NgRx SignalStore, PrimeNG, Tailwind CSS,
  ngx-translate, Sheriff, ESLint, Vitest, Playwright.
- The backend is a single separate API; the frontend only consumes it through repositories.
- Because students are mostly minors, privacy and accessibility take precedence over convenience.
- Deviating from the stack requires an ADR.

## Development Workflow & Quality Gates

- Every PR MUST state which principles it touches and pass build, lint and tests before review.
- Reviewers verify compliance with each principle above; any violation blocks merge.
- Complexity beyond these rules MUST be justified in the PR or an ADR.
- `AGENTS.md` provides runtime coding guidance and MUST remain consistent with this constitution.

## Governance

This constitution overrides all other instructions and practices. Amendments require an explicit
request, documentation of the change and rationale, and a version bump under semantic versioning:
MAJOR for removing or redefining a principle, MINOR for adding or materially expanding one, PATCH for
clarifications. All PRs and reviews MUST verify compliance. If a rule conflicts with current official
Angular guidance, work stops and the conflict is raised (Principle I).

**Version**: 1.1.0 | **Ratified**: 2026-11-11 | **Last Amended**: 2026-11-11
