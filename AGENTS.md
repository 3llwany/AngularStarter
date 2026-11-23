# Repository Instructions

This repository is a reusable Angular starter with one fixed theme and no role-specific behavior. Keep product-specific features out until a consuming project adds them.

## Angular and TypeScript

- Use strict TypeScript, standalone Angular APIs, Signals for local state, native control flow, and lazy feature routes.
- Keep components small. Store component templates in separate `.html` files; do not add component CSS/SCSS files. Use Tailwind utilities and design tokens.
- Prefer `input()`, `output()`, `model()`, `computed()`, and `linkedSignal()` over decorators or duplicated derived state.
- Use `inject()` for dependencies. Use `NgOptimizedImage` for static images.
- Use Signal Forms for new forms when a real form feature is implemented; otherwise use Reactive Forms.
- Keep server-side rendering safe. Avoid direct browser globals and Web Storage in application services.

## Architecture

- Keep application infrastructure in `src/app/core`, reusable UI in `src/app/shared`, and product capabilities in `src/app/features/<feature>`.
- Features may import their own code, `core`, `shared`, and explicit `domain/<capability>` modules. Features must not import other features.
- `core` must not import `shared`, `domain`, or features. `shared` must not import `core`, `domain`, or features.
- Keep DTOs and feature state with their owning feature. Use `domain/` only after multiple features genuinely share a contract or capability.
- Import cross-module code through public APIs (`@core/<module>`, `@shared/ui`, `@domain/<capability>`). Avoid deep imports.
- PrimeNG and PrimeUIX imports belong behind `shared/ui` wrappers, except for the theme preset and app configuration.

## UI, theme, and localization

- `src/app/shared/ui` is the reusable UI component boundary. Extend existing components instead of making duplicate wrappers; record library contributions in `docs/ui-library-contributions.md`.
- Keep the shared UI independent of product routes, API calls, and domain terms. Do not add npm dependencies without approval.
- The app has one palette in `src/styles/palette.css`. Use `--app-primary-600` with `text-on-primary` for filled primary actions.
- Use logical directional utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`) to support RTL and LTR.
- Arabic is the default locale and English is also supported. Keep translation keys in both `public/i18n/ar.json` and `public/i18n/en.json`.
- Use the translate pipe in templates and reactive translation streams in TypeScript. Do not use `translate.instant()` or hardcoded user-facing template text.

## Quality gates

Before completing implementation work, run:

```bash
npm run typecheck
npm run lint
npm run test:ci
npm run build
```
