# Tasks: Design System Alignment (Phase 1.5)

**Input**: Design documents from `specs/004-design-system-alignment/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Sources of Truth**: `docs/design/figma-components.json`, `docs/design/figma-deep.json`  
**Prerequisites**: `spec.md` (approved), `plan.md` (approved), `research.md` (approved)

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Maps task to User Story (`[US1]`, `[US2]`, `[US3]`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: External assets, font infrastructure, and linting guards

- [X] T001 Set up font files for `Alexandria`, `Stack Sans Headline`, and `Stack Sans Text` (SIL OFL 1.1) in `public/fonts/`
- [X] T002 Create automated banned frame literals guard in `tools/lint-design-tokens.mjs` to block `354px` and `370px` in `src/app/shared/ui/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core design tokens that MUST be complete before component alignment begins

- [X] T003 [P] Update Student palette with `#2a6eee` (OKLCH scale), `--primary-gradient` (400 → 500), `--moz-primary-tint` (10%), and ambient glow variables in `src/styles/roles.css`
- [X] T004 [P] Centralize design tokens (neutrals, 5 elevation drop shadows, 7 radii 18–99px, semantic colors, container query tokens) in `src/styles/theme.css`
- [X] T005 [P] Implement glass surface tokens (`--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-saturate`) and opaque `@supports not (backdrop-filter)` fallback in `src/styles/ui-library.css` and `src/styles/theme.css`
- [X] T006 [P] Configure bilingual typography `@font-face` rules in `src/styles/fonts.css` and language font stacks (`html[lang='ar']` Alexandria, `html[lang='en']` Stack Sans) in `src/styles/theme.css`

**Checkpoint**: Foundation ready — all tokens, fonts, and base variables active in build.

---

## Phase 3: User Story 1 - Authentic, Bilingual Visual Interface for Students (Priority: P1) 🎯 MVP

**Goal**: Deliver authentic pill buttons with glow shadows, glass surfaces, 54px touch fields, and bilingual typography for students in Arabic (RTL) and English (LTR).  
**Independent Test**: Mount buttons and input fields in `/dev/foundation` under the Student role; verify `#2a6eee` primary color, Alexandria Arabic typography, Stack Sans English typography, 54px min-height, and glass fallback.

### Tests for User Story 1
- [X] T007 [P] [US1] Unit tests for button variants (`primary`, `glass`, `tinted`), sizes (`large`, `medium`, `small`), pill radius, and icon projection in `src/app/shared/ui/button/button.spec.ts`
- [X] T008 [P] [US1] Unit tests for 54px field min-height, radius 18px, floating label, and validation states in `src/app/shared/ui/input/input.spec.ts`
- [X] T009 [P] [US1] Unit tests for 54px dropdown selector min-height and accessible states in `src/app/shared/ui/select/select.spec.ts`
- [X] T010 [P] [US1] Unit tests for bilingual font classes and glass fallback in `src/app/dev/foundation.page.spec.ts`

### Implementation for User Story 1
- [X] T011 [US1] Extend `AppButton` in `src/app/shared/ui/button/button.ts` and `button.html` with `variant` (`primary` | `glass` | `tinted`), `size` (`large` 56px | `medium` 44px | `small` 36px), `fullWidth`, glow shadow, `[leadingIcon]` and `[trailingIcon]` slots, and provisional hover/pressed/focus-visible states
- [X] T012 [US1] Align `AppInput` in `src/app/shared/ui/input/input.component.ts` and `input.component.html` to 54px min-height, radius 18px, padding 18px, error border `#ef5a4a`, and focus ring
- [X] T013 [US1] Align `AppSelect` in `src/app/shared/ui/select/select.ts` and `select.html` to 54px min-height, radius 18px, padding 18px, and accessible states

**Checkpoint**: User Story 1 functional and verifiable independently as the core visual MVP.

---

## Phase 4: User Story 2 - Centralized Token Architecture for Scalable Engineering (Priority: P2)

**Goal**: Provide a single, documented, and automated design token system that eliminates hardcoded values and prevents style regressions across all 6 roles.  
**Independent Test**: Run `npm run lint` and verify token linter detects and fails any prohibited frame dimensions; verify `role-palettes.spec.ts` confirms dynamic `color-mix` tint calculations across all roles.

### Tests for User Story 2
- [X] T014 [P] [US2] Unit tests verifying Student palette `#2a6eee`, OKLCH hue consistency, and role-independent neutrals in `src/app/core/theme/role-palettes.spec.ts`

### Implementation for User Story 2
- [X] T015 [US2] Implement token linting rule in `tools/lint-design-tokens.mjs` checking that no file in `src/app/shared/ui/` contains hardcoded literals `354px` or `370px`
- [X] T016 [US2] Update `package.json` to include `node tools/lint-design-tokens.mjs` in the `npm run lint` command pipeline
- [X] T017 [US2] Create Architectural Decision Record (ADR) in `docs/adr/0004-design-system-alignment-tokens.md` documenting Figma JSON tokens, glass approximation, and provisional role palettes

**Checkpoint**: Design tokens enforced by CI/lint gates; no hardcoded frame dimensions possible.

---

## Phase 5: User Story 3 - Complete Library Component Variants & Interactive States (Priority: P3)

**Goal**: Provide all 15+ missing and aligned shared UI primitives with full Figma variant support and provisional interactive states, verified across 320, 390, 768, and 1280px containers.  
**Independent Test**: Load `/dev/foundation` and verify all 20 components render every variant and state side-by-side without console errors, visual clipping, or horizontal overflow across all 4 container widths in Arabic and English.

### Implementation for User Story 3
- [X] T018 [P] [US3] Implement `AppTag` (6 semantic tones × 2 sizes, radius 9999px) in `src/app/shared/ui/tag/tag.ts`, `tag.html`, and `tag.spec.ts`
- [X] T019 [P] [US3] Implement `AppBanner` (Info, Warning, Error tones with leading icon and dismiss action) in `src/app/shared/ui/banner/banner.ts`, `banner.html`, and `banner.spec.ts`
- [X] T020 [P] [US3] Align `AppToast` in `src/app/shared/ui/toast/toast.ts`, `toast.html`, and `toast.spec.ts` to Figma toast styling and elevation
- [X] T021 [P] [US3] Implement `AppChoiceCard` (single-select interactive radio card with content-hugging height) in `src/app/shared/ui/choice-card/choice-card.ts`, `choice-card.html`, and `choice-card.spec.ts`
- [X] T022 [P] [US3] Implement `AppCheckboxCard` (multi-select card with title, icon, and embedded checkbox) in `src/app/shared/ui/checkbox-card/checkbox-card.ts`, `checkbox-card.html`, and `checkbox-card.spec.ts`
- [X] T023 [P] [US3] Implement `AppChipSelect` (selection chip with 44px min-height) in `src/app/shared/ui/chip-select/chip-select.ts`, `chip-select.html`, and `chip-select.spec.ts`
- [X] T024 [P] [US3] Implement `AppProgressSteps` (completed, active, upcoming steps) in `src/app/shared/ui/progress-steps/progress-steps.ts`, `progress-steps.html`, and `progress-steps.spec.ts`
- [X] T025 [P] [US3] Implement `AppSkeleton` (line, row, card, circle shapes) in `src/app/shared/ui/skeleton/skeleton.ts`, `skeleton.html`, and `skeleton.spec.ts`
- [X] T026 [P] [US3] Implement `AppLink` (text link, prompt link, destructive link) in `src/app/shared/ui/link/link.ts`, `link.html`, and `link.spec.ts`
- [X] T027 [P] [US3] Implement `AppHelperError` (sub-field helper text, error text, character counter) in `src/app/shared/ui/helper-error/helper-error.ts`, `helper-error.html`, and `helper-error.spec.ts`
- [X] T028 [P] [US3] Implement `AppIconButton` (circular and square icon buttons with >= 44px touch area) in `src/app/shared/ui/icon-button/icon-button.ts`, `icon-button.html`, and `icon-button.spec.ts`
- [X] T029 [P] [US3] Implement `AppDividerOr` (centered "أو" / "OR" divider line) in `src/app/shared/ui/divider-or/divider-or.ts`, `divider-or.html`, and `divider-or.spec.ts`
- [X] T030 [P] [US3] Implement `AppSocialButton` (Google and Facebook authentication buttons) in `src/app/shared/ui/social-button/social-button.ts`, `social-button.html`, and `social-button.spec.ts`
- [X] T031 [P] [US3] Implement `AppBottomNavTab` (navigation item with active pill indicator) in `src/app/shared/ui/bottom-nav-tab/bottom-nav-tab.ts`, `bottom-nav-tab.html`, and `bottom-nav-tab.spec.ts`
- [X] T032 [P] [US3] Implement `FieldPhone` (dial code selector + phone number input, 54px min-height) in `src/app/shared/ui/field-phone/field-phone.ts`, `field-phone.html`, and `field-phone.spec.ts`
- [X] T033 [P] [US3] Implement `FieldUpload` (file dropzone with progress indicator and action, 54px min-height) in `src/app/shared/ui/field-upload/field-upload.ts`, `field-upload.html`, and `field-upload.spec.ts`
- [X] T034 [US3] Export all newly created components in `src/app/shared/ui/index.ts`
- [X] T035 [US3] Extend developer verification showcase in `src/app/dev/foundation.page.ts` and `foundation.page.html` to mount every component inside 320, 390, 768, and 1280px container query harnesses in Arabic and English with role switching

**Checkpoint**: All 20 components complete, tested, exported, and visually verified across viewports.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, i18n parity, and quality gates validation

- [X] T036 [P] Add generic translation keys for new components and verification fixtures to `public/i18n/ar.json` and `public/i18n/en.json`
- [X] T037 [P] Update UI library contributions log in `docs/ui-library-contributions.md` with all new and extended components and token prerequisites
- [X] T038 Execute and verify all 4 quality gates pass: `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — BLOCKS all user stories.
- **Phase 3 (User Story 1 - MVP)**: Depends on Phase 2 completion.
- **Phase 4 (User Story 2)**: Depends on Phase 2 completion (can run in parallel with US1).
- **Phase 5 (User Story 3)**: Depends on Phase 2 completion (components build upon tokens and button primitives).
- **Phase 6 (Polish)**: Depends on all user stories being complete.

### Parallel Opportunities
- **Foundational**: T003 (`roles.css`), T004 (`theme.css`), T005 (`ui-library.css`), and T006 (`fonts.css`) operate on separate files and can execute in parallel.
- **User Story 1**: T007, T008, T009, T010 unit test tasks can run in parallel before implementations.
- **User Story 3**: T018 through T033 are completely independent component directories in `src/app/shared/ui/<kebab-name>/` and can be authored in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Fonts & Token Linter)
2. Complete Phase 2 (Foundational Tokens in `roles.css`, `theme.css`, `fonts.css`)
3. Complete Phase 3 (Extended Button, Aligned 54px Input, Aligned 54px Select)
4. **Validate MVP**: Inspect in browser and verify `#2a6eee` student primary, Alexandria Arabic, Stack Sans English, pill buttons, and 54px fields.

### Incremental Delivery
1. Foundation + US1 → Core visual styling ready (MVP).
2. Add US2 → Token linter active, blocking hardcoded frame dimensions.
3. Add US3 → Full library of 20 components available for assembling screens.
4. Final Polish → Quality gates green, contributions log updated.
