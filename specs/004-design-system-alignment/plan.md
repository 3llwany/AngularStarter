# Implementation Plan: Design System Alignment (Phase 1.5)

**Branch**: `004-design-system-alignment` | **Date**: 2026-11-19 | **Spec**: [specs/004-design-system-alignment/spec.md](spec.md)

**Input**: Feature specification from `specs/004-design-system-alignment/spec.md`  
**Sources of Truth**: `docs/design/figma-components.json`, `docs/design/figma-deep.json`

---

## Summary

Phase 1.5 aligns the global design tokens (`src/styles/`) and the reusable UI library (`src/app/shared/ui/`) with the authoritative Figma design extracted into `figma-components.json` and `figma-deep.json`. The student palette is anchored to `#2a6eee` with OKLCH-derived shades, ambient glow shadows, and dynamic `color-mix` tinted surfaces that automatically adapt across all 6 roles. Glass styling is introduced with high-contrast fallbacks. Shared UI components are made fluid and container-query responsive (`@container`), with control min-heights fixed (Button 56/44/36px, Field 54px, Chip 44px). The button component is extended backward-compatibly, 15+ missing or unaligned primitives are implemented, and an interactive bilingual verification harness tests all components across 320, 390, 768, and 1280px containers.

---

## Technical Context

**Language/Version**: TypeScript 5.9+ / Angular 22.2+ (zoneless, standalone default, Signals, Signal Forms, OnPush default)  
**Primary Dependencies**: `@angular/core`, `@angular/forms/signals`, `@ngx-translate/core`, `primeng` 22, `@primeuix/themes` (Aura preset), `@primeicons/angular`, `tailwindcss` v4  
**Storage**: N/A (Client-side UI library and design tokens only)  
**Testing**: Vitest (`@angular/build:unit-test` via `npm test`) + Playwright E2E verification  
**Target Platform**: Evergreen mobile and desktop web browsers (Mobile-first student experience; unified styling across all roles)  
**Project Type**: Single Angular Application (`src/app/core`, `src/app/shared/ui`, `src/app/features/*`)  
**Performance Goals**: Zero hardcoded mobile frame dimensions (`354px`/`370px` banned); fluid container query adaptation; touch targets >= 44px; production bundle budgets respected  
**Constraints**: Pure logical CSS utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`); hover isolated to `@media (hover: hover)`; PrimeNG encapsulated 100% within `src/app/shared/ui/`; SSR-safe (no browser globals without platform checks)  
**Scale/Scope**: 20 foundational shared UI components, 5 elevation shadows, 7 radius tokens, bilingual typography scale, 6 role palettes

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan Alignment | Status |
| :--- | :--- | :--- | :--- |
| **I. Angular Best Practices First** | Consult Angular CLI MCP tools before writing code; no deprecated APIs | Uses Angular 22 signal inputs (`input()`, `model()`, `output()`), Signal Forms, and `@Service` | **PASS** |
| **II. Modern Angular Only** | Standalone default, zoneless, OnPush default, native control flow, no `ngClass`/`ngStyle` | All components standalone by default, no decorator flags, native `@if`/`@for`, signal-based state | **PASS** |
| **III. Single App, Fixed Structure** | No monorepo; shared code stays in `src/app/shared/ui/` | All components live in `src/app/shared/ui/<kebab-name>/` with exports in `index.ts` | **PASS** |
| **IV. Enforced Boundaries** | Sheriff + ESLint; features never import features; shared never imports core/features | `shared/ui` depends strictly on `foundation/` and external npm UI packages | **PASS** |
| **VIII. UI System** | PrimeNG encapsulated in `shared/ui`; custom preset; role CSS variables on `[data-role]` | PrimeNG never imported outside `shared/ui`; dynamic `--moz-primary-*` token architecture | **PASS** |
| **IX. RTL and i18n From Day One** | Logical utilities only; no physical directions; no hardcoded text | 100% logical utilities; all text passed via `ngx-translate` keys by consumers | **PASS** |
| **XI. Performance** | Responsive budgets, lazy loading, lightweight component footprint | No heavy third-party CSS or JS libraries; build budget verified | **PASS** |
| **XV. Library-First UI Components** | Reusable `app-*` selectors; 100% generic; documented contributions | Follows `ng-ui-components` conventions; logged in `docs/ui-library-contributions.md` | **PASS** |

*Post-Design Evaluation*: All gates remain **PASS**. No constitutional violations or complexity exemptions required.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-design-system-alignment/
├── plan.md              # This implementation plan
├── research.md          # Technical research & decisions (Phase 0)
├── data-model.md        # Tokens & component variant schemas (Phase 1)
├── quickstart.md        # Validation guide & verification steps (Phase 1)
├── contracts/           # API contracts & token definitions (Phase 1)
│   ├── component-api.md
│   ├── tokens.contract.css
│   └── verification-harness.contract.md
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Work breakdown tasks ($speckit-tasks output)
```

### Source Code Layout

```text
src/
├── styles/
│   ├── fonts.css                  # Font faces (Alexandria, Stack Sans Headline/Text)
│   ├── roles.css                  # Student #2a6eee (OKLCH scale) + dynamic tint & glow tokens
│   ├── theme.css                  # Tailwind v4 @theme inline, neutrals, radii, shadows, glass
│   └── ui-library.css             # Base utility layer, PrimeNG integration, glass fallbacks
├── app/
│   ├── shared/
│   │   └── ui/
│   │       ├── foundation/        # Base contracts, FieldError, ThemePreset
│   │       ├── button/            # Extended AppButton (primary, glass, tinted, sizes, slots)
│   │       ├── input/             # Aligned 54px text field with floating/fixed labels
│   │       ├── select/            # Aligned 54px dropdown select field
│   │       ├── field-phone/       # Phone input with dial code selector
│   │       ├── field-upload/      # Drag & drop upload target
│   │       ├── tag/               # 6 tones × 2 sizes
│   │       ├── banner/            # Info, warning, error alert banner
│   │       ├── choice-card/       # Single-select choice card
│   │       ├── checkbox-card/     # Multi-select checkbox card
│   │       ├── chip-select/       # Selection chip
│   │       ├── progress-steps/    # Multi-step progress indicator
│   │       ├── skeleton/          # Line, row, card, circle loading states
│   │       ├── link/              # Text link & prompt link
│   │       ├── helper-error/      # Field helper / error label
│   │       ├── icon-button/       # Back / circular icon button
│   │       ├── divider-or/        # "Or" divider separator
│   │       ├── social-button/     # Google & Facebook authentication buttons
│   │       ├── bottom-nav-tab/    # Bottom navigation tab item
│   │       └── index.ts           # Public barrel export for shared UI
│   └── dev/
│       └── foundation.page.ts     # Developer verification gallery (320, 390, 768, 1280px)
tools/
└── lint-design-tokens.mjs         # Automated guard rejecting 354px/370px frame literals
docs/
├── ui-library-contributions.md    # Library contributions log
└── adr/
    └── 0004-design-system-alignment-tokens.md # ADR on Figma JSON tokens & glass approximation
```

**Structure Decision**: The shared UI components remain strictly localized within `src/app/shared/ui/<kebab-name>/` to maintain 1:1 synchronization with `github.com/3llwany/ng-ui-components`. Feature code never imports PrimeNG directly; it consumes only these clean primitives.

---

## Detailed Implementation Breakdown

### Phase 1: Core Design Tokens & Font Architecture
1. **Student Palette & Dynamic Tints (`src/styles/roles.css`)**:
   - Update Student `primary-500` to `#2a6eee`, `primary-50` to `#e6eeff`, and `primary-400` to `#6e9bf2`.
   - Compute OKLCH scale for 100, 200, 300, 600, 700, 800, 900, 950.
   - Define `--moz-primary-tint` (`10%`), `--moz-primary-tint-hover` (`16%`), and `--moz-primary-tint-active` (`22%`) via `color-mix`.
   - Define `--moz-primary-glow-md/lg/xl` ambient shadow variables.
2. **Global Tokens & Glass Recipe (`src/styles/theme.css`)**:
   - Add neutrals: Ink (`#12233a`), Ink Subtle (`#3a4a66`), Subdued (`#647086`), Subdued Alt (`#6b758a`), Muted (`#9aa3b5`), Border Subtle (`#c9d4ea`), Surface Soft (`#eef0f4`).
   - Add semantic tones (Success, Warning, Orange, Error with border `#ef5a4a`, Info).
   - Add 5 distinct Figma drop shadows and 7 radii (`18px`, `20px`, `22px`, `24px`, `28px`, `32px`, `9999px`).
   - Define glass tokens (`--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-saturate`) and opaque fallback.
3. **Typography & Bilingual Fonts (`src/styles/fonts.css`)**:
   - Set up `@font-face` definitions for `Alexandria` (Arabic) and `Stack Sans Headline` / `Stack Sans Text` (English).
   - Configure `html[lang='ar']` and `html[lang='en']` typography rules in `theme.css`.

### Phase 2: Button Component Alignment (`src/app/shared/ui/button/`)
1. Extend `AppButton` with `variant` (`'primary' | 'glass' | 'tinted'`), `size` (`'large' | 'medium' | 'small'`), and `fullWidth` inputs.
2. Implement exact size dimensions (Large 56px/pad 24px/font 16px, Medium 44px/pad 18px/font 16px, Small 36px/pad 14px/font 13px).
3. Add ambient glow shadow for Primary Large.
4. Support content projection slots for `[leadingIcon]` and `[trailingIcon]` alongside existing `icon` string input.
5. Implement provisional interactive states (Hover = 600, Pressed = 700, Focus-Visible = 2px ring with offset) wrapped in `@media (hover: hover)`.
6. Maintain full backward compatibility for `severity`, `outlined`, `loading`, `disabled`, `onClick`.

### Phase 3: Form Controls Alignment (54px Standard)
1. **`AppInput` (`src/app/shared/ui/input/`)**:
   - Align min-height to `54px`, radius to `18px`, padding to `18px`.
   - Support floating/fixed label, clear button, error state (`#ef5a4a` border), and focus ring.
2. **`AppSelect` (`src/app/shared/ui/select/`)**:
   - Align min-height to `54px`, radius to `18px`, padding to `18px`.
3. **`FieldPhone` (`src/app/shared/ui/field-phone/`)**:
   - Implement dial code selector + phone number input with 54px min-height.
4. **`FieldUpload` (`src/app/shared/ui/field-upload/`)**:
   - Implement dropzone with progress indicator and action button.

### Phase 4: Presentational Primitives Implementation
1. **`AppTag` (`src/app/shared/ui/tag/`)**: 6 tones × 2 sizes (28px / 24px) with optional dot.
2. **`AppBanner` (`src/app/shared/ui/banner/`)**: Info, Warning, Error alert banners with leading icon and dismiss action.
3. **`AppChoiceCard` (`src/app/shared/ui/choice-card/`)**: Single-select interactive card.
4. **`AppCheckboxCard` (`src/app/shared/ui/checkbox-card/`)**: Multi-select card with embedded checkbox.
5. **`AppChipSelect` (`src/app/shared/ui/chip-select/`)**: Filter chip (44px min-height).
6. **`AppProgressSteps` (`src/app/shared/ui/progress-steps/`)**: Completed, active, and upcoming steps.
7. **`AppSkeleton` (`src/app/shared/ui/skeleton/`)**: Line, row, card, and circle shapes.
8. **`AppLink` (`src/app/shared/ui/link/`)**: Text link and prompt link.
9. **`AppHelperError` (`src/app/shared/ui/helper-error/`)**: Accessible sub-field error/helper text.
10. **`AppIconButton` (`src/app/shared/ui/icon-button/`)**: Circular/square icon buttons with >= 44px touch target.
11. **`AppDividerOr` (`src/app/shared/ui/divider-or/`)**: Centered "أو" / "OR" divider.
12. **`AppSocialButton` (`src/app/shared/ui/social-button/`)**: Google and Facebook authentication buttons.
13. **`AppBottomNavTab` (`src/app/shared/ui/bottom-nav-tab/`)**: Navigation tab item.

### Phase 5: Verification Harness & Banned Literals Guard
1. **Token Linter Script (`tools/lint-design-tokens.mjs`)**:
   - Fails the build/lint if literal strings `354px` or `370px` exist under `src/app/shared/ui/`.
   - Register in `package.json` under `npm run lint`.
2. **Developer Showcase (`src/app/dev/foundation.page.ts`)**:
   - Add responsive container query harnesses at `320px`, `390px`, `768px`, and `1280px`.
   - Render all component variants and states side-by-side in Arabic (`RTL`) and English (`LTR`).
   - Include dynamic role switcher to verify color adaptability.
3. **Unit Tests**:
   - Write `.spec.ts` files for each component verifying inputs, outputs, states, and accessibility attributes.

### Phase 6: Documentation & ADR
1. Update `docs/ui-library-contributions.md` logging all added/extended components and token dependencies.
2. Create ADR `docs/adr/0004-design-system-alignment-tokens.md` recording that tokens originate from Figma JSON, glass is approximated with fallback, and other roles remain provisional.
3. Verify all 4 quality gates pass (`typecheck`, `lint`, `test`, `build`).

---

## Complexity Tracking

No constitutional violations or unjustified abstractions exist. All components are self-contained, generic, and use standard Angular signals and logical CSS.
