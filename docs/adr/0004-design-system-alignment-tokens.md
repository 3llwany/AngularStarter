# ADR 0004: Design System Alignment Tokens & Glass Surface Fallback

## Status
Accepted

## Context
During Phase 1.5, we extracted authoritative design system values from the mobile Figma design files (`docs/design/figma-components.json` and `docs/design/figma-deep.json`). The student role primary color is `#2a6eee` with an ambient glow shadow and tinted pill buttons. Glass surfaces are used on cards and bottom navigation. The mobile artboard frames measure 354px and 370px, which must not be hardcoded into fluid web components.

## Decisions

1. **Authoritative Student Palette & OKLCH Scale**:
   - `primary-500` is locked to `#2a6eee` (Figma value).
   - `primary-50` is `#e6eeff` and `primary-400` is `#6e9bf2` (from the Figma gradient).
   - Other shades (100–300, 600–950) are computed via OKLCH preserving hue `261.5°`.
   - Other role palettes (parent, teacher, school, partner, admin) remain provisional until their respective Figma sheets are extracted.

2. **Dynamic Tinted Surfaces & Ambient Glow Shadows**:
   - Tinted surfaces use `color-mix(in srgb, var(--moz-primary-500) 10%, transparent)`.
   - Ambient glow shadows use `color-mix(in srgb, var(--moz-primary-500) 28%, transparent)`.
   - This ensures all roles automatically inherit brand-matched tinted surfaces and glow shadows without duplicating CSS per role.

3. **Glass Surface Formulation & Fallback**:
   - Standard glass: `background: rgba(255, 255, 255, 0.60)`, `border: 1px solid rgba(255, 255, 255, 0.75)`, `backdrop-filter: blur(16px) saturate(140%)`.
   - Opaque progressive fallback under `@supports not (backdrop-filter: blur(16px))`: `background: rgba(255, 255, 255, 0.95)`, `box-shadow: 0 4px 16px -2px rgba(18, 35, 58, 0.08)`.

4. **Banned Frame Literals & Fluid Responsive Architecture**:
   - Hardcoded literals `354px` and `370px` are strictly banned in `src/app/shared/ui/` and enforced by `tools/lint-design-tokens.mjs` during `npm run lint`.
   - Components adapt to their parent layout slots using container queries (`@container`).
   - Touch targets maintain `>= 44px` on pointer devices, and hover states are isolated inside `@media (hover: hover)`.

5. **Bilingual Typography**:
   - Arabic (`html[lang='ar']`): Alexandria typeface across all text weights (400, 500, 600, 700).
   - English (`html[lang='en']`): Stack Sans Headline for headings and buttons; Stack Sans Text for body and form labels.
   - Both fonts are licensed under SIL Open Font License 1.1 and self-hosted in `public/fonts/`.

## Consequences
- Single source of truth for all design tokens in `roles.css`, `theme.css`, and `fonts.css`.
- Complete immunity against hardcoded mobile frame regressions across tablet, desktop, and split-screen layouts.
- Guaranteed WCAG AA contrast compliance across light and glass surfaces.
