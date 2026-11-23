# Phase 0: Research & Technical Decisions — Design System Alignment

**Feature**: `004-design-system-alignment` (Phase 1.5)  
**Status**: Completed  
**Sources of Truth**: `docs/design/figma-components.json`, `docs/design/figma-deep.json`, Mozakrety Constitution (Principles I, II, VIII, IX, XV)

---

## Technical Context & Decisions

### 1. Student Palette & Derived Color Scales (OKLCH)

- **Decision**: Define Student `primary-500` as `#2a6eee` (taken directly from Figma JSON), `primary-50` as `#e6eeff`, and `primary-400` as `#6e9bf2` (extracted from the primary gradient). Compute all remaining shades (`100`, `200`, `300`, `600`, `700`, `800`, `900`, `950`) via OKLCH perceptual lightness steps preserving the exact Figma hue angle (`h ≈ 261.5°`) and chromatic saturation curve.
- **Rationale**: The Figma design strictly anchors all student UI surfaces to `#2a6eee`. Using OKLCH ensures hue stability and predictable perceived contrast across all derived interactive states (`hover = 600`, `pressed = 700`, `focus ring = 500`).
- **Student Palette Table**:
  - `primary-50`: `#e6eeff` (Figma tint base, L ≈ 0.95, C ≈ 0.025, h ≈ 265.6°)
  - `primary-100`: `#d4e3ff` (L ≈ 0.90, C ≈ 0.055)
  - `primary-200`: `#b3cefe` (L ≈ 0.83, C ≈ 0.095)
  - `primary-300`: `#8eb4fc` (L ≈ 0.76, C ≈ 0.125)
  - `primary-400`: `#6e9bf2` (Figma gradient start, L ≈ 0.695, C ≈ 0.138, h ≈ 262.6°)
  - `primary-500`: `#2a6eee` (Authoritative Figma base, L ≈ 0.571, C ≈ 0.205, h ≈ 261.5°)
  - `primary-600`: `#1f59cc` (Derived provisional hover, L ≈ 0.490, C ≈ 0.190)
  - `primary-700`: `#1745a3` (Derived provisional active/pressed, L ≈ 0.410, C ≈ 0.165)
  - `primary-800`: `#13367d` (L ≈ 0.330, C ≈ 0.135)
  - `primary-900`: `#0f2757` (L ≈ 0.250, C ≈ 0.100)
  - `primary-950`: `#08152e` (L ≈ 0.160, C ≈ 0.065)
- **Alternatives Considered**: Modifying other role palettes in this phase was rejected because Parent, Teacher, School, Partner, and Admin have not yet undergone formal design extraction; their existing provisional palettes remain untouched.

---

### 2. Tinted Surfaces & Ambient Glow Shadows via Dynamic `color-mix`

- **Decision**: Define tinted button and badge surface variables using CSS `color-mix(in srgb, var(--moz-primary-500) 10%, transparent)`. Define ambient glow shadows using `color-mix(in srgb, var(--moz-primary-500) 28%, transparent)`.
- **Rationale**: In Figma, tinted buttons have `fill: "#2a6eee @0.10"` and glow shadows have `color: "#2a6eee @0.28"`. By leveraging CSS `color-mix` with `var(--moz-primary-500)`, any role theme (parent green, teacher purple, school red, etc.) automatically gets a perfectly matching tinted surface and colored ambient glow without requiring duplicate CSS rules per role.
- **Tokens Established**:
  - `--moz-primary-tint`: `color-mix(in srgb, var(--moz-primary-500) 10%, transparent)`
  - `--moz-primary-tint-hover`: `color-mix(in srgb, var(--moz-primary-500) 16%, transparent)`
  - `--moz-primary-tint-active`: `color-mix(in srgb, var(--moz-primary-500) 22%, transparent)`
  - `--moz-primary-glow-lg`: `0 8px 20px -6px color-mix(in srgb, var(--moz-primary-500) 28%, transparent)`
  - `--moz-primary-glow-md`: `0 6px 14px -4px color-mix(in srgb, var(--moz-primary-500) 25%, transparent)`
  - `--moz-primary-glow-xl`: `0 12px 28px -10px color-mix(in srgb, var(--moz-primary-500) 30%, transparent)`

---

### 3. Glass Surface Specification & Progressive Degradation Fallback

- **Decision**: Glass surfaces are configured with:
  - Background fill: `rgba(255, 255, 255, 0.60)` (`#ffffff @0.60`)
  - Border: `1px solid rgba(255, 255, 255, 0.75)` (`#ffffff @0.75`)
  - Backdrop blur: `16px` (`--glass-blur`)
  - Backdrop saturation: `140%` (`--glass-saturate`)
  - Opaque fallback (under `@supports not (backdrop-filter: blur(16px))`): `rgba(255, 255, 255, 0.95)` with `box-shadow: 0 4px 16px -2px rgba(18, 35, 58, 0.08)`.
- **Rationale**: Figma specifies fill `0.60` and stroke `0.75` for glass cards, buttons, and bottom nav bars, but Figma does not expose blur/saturation numbers in its JSON export. Approximating `16px` blur and `140%` saturation yields the frosted glass visual standard while maintaining legibility. The fallback ensures older Android webviews or systems without hardware GPU backdrop filtering maintain WCAG AA contrast.
- **Alternatives Considered**: Using solid white cards everywhere was rejected because glass surfaces are a core visual pillar of the mobile student experience. Relying on glass without a `@supports` fallback was rejected because it causes contrast failures on unsupported browsers.

---

### 4. Typography Scale, Line Heights & Font Licensing

- **Decision**:
  - **Arabic (`html[lang='ar']`)**: Alexandria typeface for all text (headings, body, numbers, Latin terms). Sizes: 11px, 12px, 13px, 14px, 15px, 16px, 18px, 22px; line-height ratio ≈ 1.22 (e.g. 16px font / 19.5px line-height, 18px font / 21.94px line-height). 22px heading has `letter-spacing: -0.22px`.
  - **English (`html[lang='en']`)**:
    - Headings & Buttons: `Stack Sans Headline` (sizes 13px, 16px, 18px, 22px, 28px; weights 600, 700; line-height ratio ≈ 1.30).
    - Body, Inputs & Labels: `Stack Sans Text` (sizes 11px, 12px, 13px, 14px, 15px; weights 400, 500, 600; line-height ratio ≈ 1.30 - 1.40).
- **Licensing & Self-Hosting Verification**:
  - Both **Alexandria** and **Stack Sans** (Headline and Text) are published under the **SIL Open Font License (OFL) Version 1.1**.
  - Commercial and personal self-hosting of `.woff2` files is 100% permitted without restrictions.
  - Font files will be placed in `public/fonts/` with `@font-face` definitions in `src/styles/fonts.css` using `font-display: swap` and system fallbacks.

---

### 5. Fluid Sizing & Tailwind v4 Container Queries

- **Decision**:
  - Shared UI components must **NEVER** set hardcoded widths from Figma frames (`354px` or `370px`).
  - All components expand to 100% of their container width or hug content where appropriate.
  - Buttons hug content by default and provide an `@Input() fullWidth = false` signal (or `[fullWidth]="true"`).
  - All shared UI internal responsiveness is driven by Tailwind CSS v4 container queries (`@container`, `@sm:`, `@md:`).
  - Breakpoints are established in `theme.css`: `@container (min-width: 320px)`, `@container (min-width: 390px)`, `@container (min-width: 768px)`, `@container (min-width: 1280px)`.
- **Rationale**: Figma artboards are drawn at mobile frame widths (354px / 370px). Hardcoding those numbers breaks tablet, desktop, drawer, and split-screen layouts. Container queries allow components to adapt to their immediate slot in the layout rather than the global browser window.

---

### 6. Backward-Compatible Button Extension Pattern

- **Decision**: Extend `AppButton` in place within `src/app/shared/ui/button/` with backward-compatible signals:
  - `variant = input<'primary' | 'glass' | 'tinted'>('primary')`
  - `size = input<'large' | 'medium' | 'small'>('large')`
  - `fullWidth = input<boolean>(false)`
  - Keep existing inputs working: `label`, `icon`, `severity`, `outlined`, `loading`, `disabled`.
  - Icon slots support content projection: `<ng-content select="[leadingIcon]" />` and `<ng-content select="[trailingIcon]" />` alongside the existing `icon` string input.
- **Rationale**: Prevents breaking existing usages in `MockStudentListPageComponent`, `AppConfirmDialog`, `AppShellComponent`, and `AppNavbar`.

---

### 7. Form Controls Standard (54px / Radius 18px / Padding 18px)

- **Decision**: Align existing and new field components (`input`, `select`, `phone`, `upload`) to the authoritative Figma specification:
  - Minimum height: `54px`
  - Corner radius: `18px` (`radius-sm`)
  - Internal padding: `18px` horizontal (`ps-[18px] pe-[18px]`)
  - Label: Floating/top label with clear focus indicator (`2px` primary ring, `outline-none`)
  - Error state: Semantic red border (`#ef5a4a`), light red background tint (`#fde4e1 @0.5`), and accessible `aria-invalid="true"`.
- **Rationale**: Guarantees visual unity across all input surfaces and exceeds WCAG touch target minimums.

---

### 8. Touch Targets & Hover Isolation

- **Decision**:
  - All interactive touch targets must measure at least `44px × 44px`. For smaller visual controls (e.g., Small Button 36px or Icon Button 32px), invisible padding/pseudo-elements expand the hit area to 44px.
  - All hover transitions are isolated inside `@media (hover: hover)` blocks to prevent sticky hover artifacts on iOS Safari and Android Chrome.

---

### 9. Automated Linter Check for Banned Frame Literals

- **Decision**: Add a project validation script (`tools/lint-design-tokens.mjs`) that inspects all `.ts` and `.html` files under `src/app/shared/ui/` and fails the build/lint if literal strings `354px` or `370px` are detected.
- **Rationale**: Fulfills AC4 and guarantees that no future developer or AI agent accidentally copies mobile frame widths from Figma.
