You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- ALWAYS separate templates into a distinct `.html` file (`templateUrl: './<kebab-name>.html'`). NEVER write inline templates (`template: `) inside `.ts` files to keep TypeScript files clean, maintainable, and free of markup clutter.
- NEVER create or generate `.css` / `.scss` files for components (`"style": "none"` in `angular.json`). Rely 100% on Tailwind CSS utility classes and design system theme tokens.
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Mozakrety Architecture & Day-to-Day Conventions

### Folder Structure & Module Boundaries (Sheriff)
- Single Angular application (`src/app/core`, `src/app/shared`, `src/app/domain`, `src/app/features/{public,auth,student,parent,teacher,school,partner,admin}`).
- Every feature directory has four sub-layers: `pages/` (smart routed containers), `ui/` (presentational components), `data-access/` (`@ngrx/signals` stores, abstract repositories, DTO mappers), and `models/` (domain types).
- Module boundaries are enforced by `@softarc/eslint-plugin-sheriff` (`sheriff.config.ts`):
  - Features NEVER import from other features (`feature:x` cannot import `feature:y`).
  - `public` NEVER imports role features.
  - `shared` NEVER imports `core`, `domain`, or `features`.
  - `core` NEVER imports `shared`, `domain`, or `features`.
  - `domain` (`src/app/domain/<capability>/`) holds shared cross-role contracts, models, and repositories **only when 2+ roles genuinely share the same domain/endpoint** (see `src/app/domain/README.md`). `domain` can import `core` and `shared` only (never `features` or other `domain` modules).
- **Public import paths only**: every `src/app/core/<module>` and `src/app/domain/<capability>` folder has an `index.ts` public API. Import via `@core/<module>`, `@domain/<capability>`, and `@shared/ui` — never deep paths (`@core/http/api-client`, `@domain/courses/course.dto`, `../shared/ui/button/button`) and never relative paths into `core`/`shared`/`domain`. Sheriff encapsulation + ESLint `no-restricted-imports` enforce this. Export new public files from the module's `index.ts`.
- **Type ownership**: types live next to their owner — single-feature models in `features/<feature>/models/`, cross-role shared domain models in `domain/<capability>/`, DTOs + mappers next to their owning repository, infrastructure contracts in `core/<module>`, generic UI types in `shared/ui/foundation/`. `shared/models` is ONLY for truly generic, domain-free types.
- **API ownership**: `ApiClient`, `BaseRepository`, and interceptors stay generic (transport behaviour only). Never add domain-specific methods to them or create a central cross-role store in `core`; single-role endpoints live in `features/<feature>/data-access/`, and genuinely shared cross-role repositories/contracts live in `domain/<capability>/` (while each role keeps its own `@ngrx/signals` screen state in its feature).

### UI Library-First Rule (`src/app/shared/ui` — `github.com/3llwany/ng-ui-components`)
- `src/app/shared/ui` is a copy of the reusable UI library (`github.com/3llwany/ng-ui-components`), brought in via `git ui-add <name>`. Each component lives in `src/app/shared/ui/<kebab-name>/` alongside `src/app/shared/ui/foundation/`.
- PrimeNG (`primeng/*`) and `@primeuix/*` MUST NEVER be imported outside `src/app/shared/ui/**` (and `src/app/core/{theme,config}/**`).
- Whenever a task needs a UI component (`button`, `input`, `select`, `datepicker`, `switch`, `dialog`, `card`, `table`, etc.):
  1. **Check the library first**: Look in `src/app/shared/ui/<name>`. If not present locally, run `git ui-list` to check the library repo, and if it exists there, run `git ui-add <name>` (or ask the user to run it if git aliases are unavailable). Always use the existing library component—never create a parallel/duplicate wrapper.
  2. **Extend in place if needed**: If an existing library component lacks a needed feature, extend it in place with a backward-compatible change (optional `input()`/`output()`/slot, same defaults). Do not fork it into a Mozakrety-specific variant. Record the change in `docs/ui-library-contributions.md`.
  3. **Create in the library if missing**: If it does not exist locally or in `git ui-list`, create it in `src/app/shared/ui/<kebab-name>/` following the library conventions, export it in `src/app/shared/ui/index.ts`, and log it in `docs/ui-library-contributions.md`.
  4. **Contributions log & forbidden git aliases**: Always update `docs/ui-library-contributions.md` (name, what changed, files, new dependencies, date). NEVER run `git ui-push`, `git ui-pull`, `git ui-init`, or push/commit to the library repo. Never modify `src/app/shared/ui/foundation/` unless strictly required by a task (and highlight it explicitly in `docs/ui-library-contributions.md`).
  5. **Keep `shared/ui` 100% generic**: No Mozakrety role names, wallet/coins/passport/teacher/student logic, API calls, project routes, or project-specific translation keys in `src/app/shared/ui`. Domain-specific UI belongs in `src/app/features/<feature>/ui/` and composes library components.
- **Library Conventions (derive from `foundation/` and `input/` before creating/extending)**:
  - Self-contained folder `src/app/shared/ui/<kebab-name>/` depending only on `../foundation` and packages from `git ui-deps` (`primeng`, `@primeuix/themes`, `primeicons`, `@primeicons/angular`, `@ngx-translate/core`, `@angular/forms/signals`, `tailwindcss`). Stop and ask before adding any new npm package.
  - Selector `app-<kebab-name>`, class `App<PascalName>` with alias export `export { App<PascalName> as <PascalName> }`, standalone, `OnPush`, signal `input()`/`output()`/`model()`, `computed()` state, no constructor injection, no `any`.
  - Forms-capable components bind Signal Forms `Field` (`[formField]`), use `ValidationMessageService`, `createUniqueId('<prefix>')`, `APP_VARIANT` injection token, and `aria-invalid` / `aria-describedby`.
  - All user-facing labels/messages are `ngx-translate` keys passed by the consumer; styling uses Tailwind logical utilities only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`) and theme CSS variables; SSR-safe (no raw `window`/`document`/`localStorage`); includes a Vitest `.spec.ts` and a `README.md` (or `.doc.md`) usage example.

### Role Theming & Logical CSS Only
- Active role theming is driven by `ThemeService` (`html[data-role]`, cookie `moz_role`) and CSS variables `--moz-primary-50..950`.
- Use `--moz-primary-600` (`bg-primary-600 text-on-primary`) for filled primary interactive surfaces to guarantee WCAG AA contrast (`>= 4.5:1`) across all 6 roles (`student`, `parent`, `teacher`, `school`, `partner`, `admin`).
- Physical directional Tailwind utilities (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`, `rounded-l-*`, `rounded-r-*`, `border-l-*`, `border-r-*`) are banned by ESLint (`mozakrety/no-physical-direction`). Always use logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`).

### Internationalization (`ngx-translate` & RTL-First)
- Default language is Arabic (`ar`, `dir="rtl"`), secondary is English (`en`, `dir="ltr"`), managed by `LocaleService` (cookie `moz_lang`).
- Translation keys live in `public/i18n/ar.json` and `public/i18n/en.json` using nested, feature-prefixed `lower_snake_case` keys.
- In templates, use the `translate` pipe (`{{ 'feature.section.key' | translate }}`).
- In TypeScript, use reactive signals via `toSignal(this.translate.stream('feature.section.key'))`. Calling `translate.instant()` is banned by ESLint (`mozakrety/no-translate-instant`).
- Hardcoded user-facing text in templates is banned (`mozakrety/no-untranslated-template-text`). Run `npm run i18n:check` (included in `npm run lint`) to verify parity, missing keys, and unused keys.

### Core Infrastructure Extension Guides (Phase 2)
- **Add a new Login Role (`core/auth`)**:
  1. Add the role's field i18n keys (`auth.fields.<field>.*`) to both `public/i18n/ar.json` and `public/i18n/en.json`.
  2. Add a single entry to `LOGIN_METHODS` in `src/app/core/auth/login-methods.ts` (`field`, `inputType`, `autocomplete`, `labelKey`, `placeholderKey`, `errorKey`, `pattern`, `normalize`).
- **User Navigation Menu (`core/navigation`)**:
  - Navigation items are fetched per authenticated user from `USER_MENU_ENDPOINT` (`'auth/menu'`) via `ApiClient.resource()` (`httpResource`) inside `NavService` (`src/app/core/navigation/nav.service.ts`). Consumers read `nav.items()`, `nav.isLoading()`, and call `nav.reload()` when a manual refresh is needed.
- **Add an HTTP Interceptor (`core/http`)**:
  - Create a functional `HttpInterceptorFn` under `src/app/core/interceptors/` (reusing `isStaticAssetUrl` and context tokens in `src/app/core/http/http.context.ts` for opt-outs).
  - Register it in `provideMozHttp()` (`src/app/core/providers/http.providers.ts`) respecting the chain order (`apiBaseUrl` -> `commonParams` -> `credentials` -> `localeHeader` -> `loadingInterceptor` slot -> `errorMapping`).
- **Configure SEO on a Page (`core/seo`)**:
  - Inject `SeoService` (`src/app/core/seo/seo.service.ts`) and call `this.seo.setPage({ title, description, canonical, image, type, noindex, alternates, status })` and optional `this.seo.setJsonLd(schema)` (avoid direct `Title`/`Meta` manipulation or setting `status` outside `SeoService`).

### Quality Gates
- Before completing any task, verify all four gates pass:
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`
  - `npm run build`
- `npm run lint` also runs `npm run theme:a11y` (`tools/check-theme-a11y.mjs`): WCAG AA contrast for all 6 role palettes + drift check between `src/styles/roles.css` and `core/theme/role-palettes.ts`. Any change to role colors must keep it green. Role × RTL/LTR behaviour is covered by `core/theme/theme-locale-matrix.spec.ts`.
- CI (`.github/workflows/ci.yml`) runs all four gates on every PR (`npm run test:ci` for non-watch tests).

