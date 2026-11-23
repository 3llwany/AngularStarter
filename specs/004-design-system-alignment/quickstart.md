# Quickstart Validation Guide: Design System Alignment (Phase 1.5)

**Feature**: `004-design-system-alignment`  
**Purpose**: Step-by-step developer guide for validating tokens, component variants, and fluid responsiveness end-to-end.

---

## 1. Prerequisites

- Node.js v22+ installed
- Dependencies installed (`npm install`)
- Project builds cleanly (`npm run build`)

---

## 2. Automated Quality Gates

Run the standard validation suite to verify syntax, boundaries, translations, and token linting:

```bash
# 1. Typecheck: Verify strict TypeScript compilation
npm run typecheck

# 2. Lint & Token Guard: Verify Sheriff boundaries, i18n parity, and banned 354/370px literals
npm run lint

# 3. Unit Tests: Verify all component states and reactive signals
npm test

# 4. Production Build: Verify budgets, SSR, and prerendering
npm run build
```

---

## 3. Interactive Developer Verification Page

1. Start the local development server:
   ```bash
   npm start
   ```

2. Open the verification gallery in your browser:
   ```text
   http://localhost:4200/dev/foundation
   ```

3. **Verify Tokens & Fonts**:
   - Inspect the Student role primary button: Verify computed background is `#2a6eee` with ambient glow shadow.
   - Switch language to Arabic (`AR`): Verify all text renders in `Alexandria`.
   - Switch language to English (`EN`): Verify headings/buttons render in `Stack Sans Headline` and body/inputs in `Stack Sans Text`.

4. **Verify Component Variants & States**:
   - **Button**: Test Primary, Glass, and Tinted across Large (56px), Medium (44px), and Small (36px). Test Loading (spinner visible, disabled clicks) and Disabled states.
   - **Form Fields**: Test Text, Select, Phone, and Upload fields. Verify min-height is `54px`, radius is `18px`, and focus outlines appear cleanly.
   - **Tags & Banners**: Verify all 6 tones for tags and 3 tones for banners match Figma color tokens.
   - **Cards & Chips**: Verify Choice Card and Checkbox Card toggle states and hug content height.
   - **Glass Surfaces**: Inspect glass cards and buttons. Test with and without backdrop-filter to verify fallback opacity.

5. **Verify Fluid Responsiveness**:
   - Inspect components inside the `320px`, `390px`, `768px`, and `1280px` container harnesses.
   - Verify zero horizontal overflow and seamless container query adaptation.
