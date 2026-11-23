# Shared UI contributions

`src/app/shared/ui/` contains reusable components based on [`ng-ui-components`](https://github.com/3llwany/ng-ui-components). Keep future changes generic and record additions or extensions here so they can be reviewed for contribution upstream.

## Contribution rules

- Do not run `git ui-push`, `git ui-pull`, or `git ui-init` automatically, and do not commit or push to the source library repository.
- Keep the component library free from product routes, API calls, domain logic, and product-specific translation keys.
- Prefer extending an existing component over creating a duplicate wrapper.
- Record changes to `foundation/` explicitly because they may affect every consuming app.
- Do not add npm dependencies without approval.

## Changes made for this starter

| Date | Area | Change | New dependency |
|---|---|---|---|
| 2026-11-23 | Theme tokens and UI documentation | Replaced the inherited multi-palette contract with one generic `--app-*` palette contract. | None |
| 2026-11-23 | Public UI entry points | Added focused `shell`, `toast`, `confirm`, `navbar`, `sidebar`, and `foundation` barrels so the app shell does not eagerly import the full showcase library. | None |

Add future contributions below this row.
