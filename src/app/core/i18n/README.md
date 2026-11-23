# Localization

The starter supports Arabic (`ar`, RTL by default) and English (`en`, LTR) through `@ngx-translate/core` and `LocaleService`.

- Put translations in `public/i18n/ar.json` and `public/i18n/en.json` with matching key paths.
- Use feature-prefixed, lower-snake-case keys and the `translate` pipe in templates.
- In TypeScript, use `toSignal(translate.stream(...))` for reactive translated values.
- `LocaleService` updates the document `lang` and `dir` attributes and persists the chosen language in an SSR-compatible cookie.
- `npm run i18n:check` checks parity, missing keys, and unused keys.
