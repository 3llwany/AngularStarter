# ADR-0003: Single application theme with CSS tokens

- **Status:** Accepted
- **Date:** 2026-11-23

## Context

The starter should offer one consistent theme without product-specific categories or runtime palette switching. Both Tailwind utilities and PrimeNG components need to use the same color values, including during SSR and the first browser paint.

## Decision

- Define one palette in `src/styles/palette.css` on `:root`.
- Map Tailwind color tokens and `AppAuraPreset` to the same `--app-*` variables.
- Use primary shades with accessible foreground tokens; verify key text and control pairs with `npm run theme:a11y`.
- Keep locale direction separate from the theme. Arabic and English layouts use logical utilities and `dir` attributes.

## Consequences

- Projects can replace the palette centrally without adding runtime theme state.
- A project that needs theme switching can add it explicitly without changing the starter's baseline.
