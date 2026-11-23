# Application Structure

This repository is a neutral Angular starter. It has one fixed application theme and no role-specific route, authorization, or palette model.

## Build size budget

The initial browser bundle uses a 700 kB warning and an 850 kB error budget. The shared PrimeNG shell currently builds to about 768 kB raw (about 173 kB estimated transfer size). Feature showcase routes stay lazy so their controls do not load with the application shell.

## Source layout

```text
src/app/
├── core/                  # app-wide infrastructure and singleton services
├── dev/                   # development-only UI and service showcase
├── features/
│   ├── public/            # public pages and not-found page
│   ├── auth/              # optional authentication screens
│   └── example/           # empty feature scaffold to copy when adding a feature
├── domain/                # explicitly shared capabilities (optional)
├── layout/                # application shell
└── shared/
    ├── models/            # generic, domain-free types only
    └── ui/                # reusable UI components and foundation utilities
```

Each real feature can use `pages/`, `ui/`, `data-access/`, and `models/`. Keep these folders near the feature that owns them; the example feature keeps the structure visible for contributors who are new to the repository.

## Dependency boundaries

| Source | May import | Must not import |
|---|---|---|
| `core` | `core` | `shared`, `features` |
| `shared` | `shared` | `core`, `features` |
| `features/<feature>` | itself, `core`, `shared`, `domain` | other features |
| `domain/<capability>` | `core`, `shared` | features and other domain modules |
| app root and development showcase | app modules as composition roots | — |

Sheriff enforces feature boundaries. Use `@core/<module>` and `@shared/ui` public APIs outside their owning modules. Do not use deep imports into those folders.

### Feature ownership

- Feature models belong in `features/<feature>/models/`.
- API DTOs, mapping, repositories, and feature state belong in that feature's `data-access/`.
- `core` owns transport and application infrastructure; it should not grow into a central store for product data.
- `shared/models` is reserved for truly generic types with no product meaning.
- If multiple features later share a genuine capability, define an explicit `domain/<capability>` boundary rather than coupling feature internals.

## UI components

`src/app/shared/ui/` is the shared component library boundary. The development showcase consumes the aggregate `@shared/ui` API. The app shell uses focused `@shared/ui/shell` and `@shared/ui/toast` APIs so unrelated controls stay out of the initial browser bundle. PrimeNG imports stay behind the wrappers and their foundation. Keep components generic, accessible, and free of API and product-domain behavior.

## Theme and direction

The application has one static palette defined in `src/styles/palette.css`. Locale is independent from styling: Arabic uses RTL and English uses LTR through `LocaleService`. Prefer logical CSS utilities (`ms-*`, `pe-*`, `start-*`) so both directions work.

## Routing and authentication

Routes are lazy-loaded by feature. The generic `authGuard` and `guestGuard` express signed-in versus anonymous access only. Authorization policies, if a future application needs them, should be designed for that product and must not be inferred from the current user's theme.

## Quality gates

CI runs `npm run typecheck`, `npm run lint`, `npm run test:ci`, and `npm run build` for pull requests and configured branches.
