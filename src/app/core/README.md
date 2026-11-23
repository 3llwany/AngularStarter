# Core

Application-wide infrastructure belongs here. Keep domain entities and feature workflows out of `core`.

- `auth/`: optional session state, API abstraction, and mock/HTTP providers.
- `config/`: runtime configuration and framework configuration.
- `data-access/`: generic typed repository helpers.
- `errors/`: normalized application errors and global handlers.
- `guards/`: authentication-status route guards.
- `http/` and `interceptors/`: generic request transport and cross-cutting behavior.
- `i18n/`: locale state, translations, and SSR translation loading.
- `layout/` and `navigation/`: shared shell behavior and server-provided navigation.
- `platform/`: SSR-safe browser platform adapters.
- `providers/`: application provider composition.
- `routes/`: application-wide route constants and helpers.
- `seo/`: page metadata and SSR status support.
- `theme/`: the single PrimeNG theme preset (color tokens live in `src/styles/palette.css`).

Each module exports its supported public API from `index.ts`. Import another core module through `@core/<module>`.
