# Contract: Responsive Verification Harness (Phase 1.5)

**Location**: `src/app/dev/foundation.page.ts` (or `/dev/design-system`)  
**Standard**: Testing container adaptability, bidirectional text, role themes, and variant completeness.

---

## 1. Harness Widths

Every component variant must be rendered within isolated container-query wrappers (`@container`) configured at:
1. **Compact Mobile**: `320px` (stress test for narrow screens / split view)
2. **Standard Mobile**: `390px` (iPhone 14/15 reference frame)
3. **Tablet / Medium**: `768px` (iPad / drawer panel reference)
4. **Desktop / Wide**: `1280px` (fluid desktop layout slot)

---

## 2. Bilingual Verification Slots

Each width fixture must render side-by-side:
- **Arabic Column (`dir="rtl"`, `lang="ar"`)**: Alexandria font family, RTL alignment, logical margins/paddings.
- **English Column (`dir="ltr"`, `lang="en"`)**: Stack Sans Headline / Text font families, LTR alignment.

---

## 3. Role Theme Switcher

The harness must allow switching between all 6 system roles (`student`, `parent`, `teacher`, `school`, `partner`, `admin`) to verify that:
- Primary filled surfaces adapt to the role's `--moz-primary-500..600`.
- Tinted surfaces (`--moz-primary-tint`) automatically re-mix to 10% of the active role color.
- Ambient glow shadows automatically adopt the active role hue.
- Text contrast passes WCAG AA (`>= 4.5:1`) across all states.

---

## 4. Automated Literal Check Script

`tools/lint-design-tokens.mjs` runs during `npm run lint`:
- Scans `src/app/shared/ui/**/*.{ts,html,css}`.
- Asserts that no literal `354px` or `370px` string exists.
- Exits with code 1 if hardcoded mobile frame dimensions are found.
