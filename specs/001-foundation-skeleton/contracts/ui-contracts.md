# UI Contracts: Phase 1

Contracts the foundation exposes to feature developers. Types are illustrative; final signatures are
set at implementation after checking current docs.

## Theme service (core)
- `role`: readonly signal of the active role theme id.
- `setRole(id)`: switches theme at runtime; persists best effort.
- Guarantee: `data-role` on the root element always equals `role()`.

## Language service (core)
- `lang`: readonly signal (`'ar' | 'en'`); `dir`: computed (`'rtl' | 'ltr'`).
- `setLanguage(lang)`: switches language and direction at runtime; persists best effort.
- Guarantee: `lang` and `dir` on the root element always match the signals.

## Shared UI Library (`src/app/shared/ui` — `ng-ui-components`)
- Synchronized with `github.com/3llwany/ng-ui-components` via `git ui-list` and `git ui-add <name>`.
- Selector prefix `app-` (`app-button`, `app-input`, `app-select`, `app-datepicker`, `app-switch`, `app-card`, `app-dialog`); class naming `App<Name>` with alias export `<Name>` (`AppButton as Button`, `AppInput as Input`, etc.).
- Forms-capable components accept a Signal Forms `Field` (`[field]="myForm.prop"`) and resolve errors through `ValidationMessageService` (`foundation/validation-message.service.ts`), with unique IDs via `createUniqueId()` and float-label variant via `APP_VARIANT`.
- All user-facing labels/placeholders are `ngx-translate` keys supplied by the consumer; zero project-specific keys or domain logic inside `src/app/shared/ui`.
- Directional icons expose a flag (`directionalIcon`) so they mirror in RTL (`rtl:scale-x-[-1]`).
- Every new or modified library component is logged in `docs/ui-library-contributions.md`.

## Tooling contracts
- `npm run lint` fails on: forbidden imports (Sheriff), direct PrimeNG use outside `shared/ui`, physical-direction utilities, hardcoded user-facing strings.
- `npm run build` (production) fails on exceeded budgets and excludes `src/app/dev`.
- `npm test` runs Vitest. Playwright E2E is deferred until the first critical flow exists.
- Language and theme preferences are cookies `moz_lang` and `moz_role`.

## Structure contract
Each feature folder has `pages/` (smart), `ui/` (presentational), `data-access/` (store, repository, mappers), `models/`.
