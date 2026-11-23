# ADR-0004: ngx-translate for localization and direction support

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

The starter supports Arabic by default with RTL and English with LTR, including during SSR. Translation keys must remain consistent as consuming applications add features.

## Decision

- Use `@ngx-translate/core` with `public/i18n/ar.json` and `public/i18n/en.json`.
- Load translations during application initialization and use the SSR loader with `TransferState`.
- Organize keys as nested, feature-prefixed `lower_snake_case` paths.
- Use the translate pipe in templates and `toSignal(translate.stream(...))` in TypeScript.
- Keep `LocaleService` responsible for language, `lang`/`dir` attributes, and an SSR-compatible language cookie.
- Check key parity and usage with `npm run i18n:check`.

## Consequences

- Public pages can render in the selected language on the server.
- When the translation set grows, feature files can be introduced while retaining the same key ownership rules.
