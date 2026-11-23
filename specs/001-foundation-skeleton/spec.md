# Feature Specification: Phase 1 — Application Foundation Skeleton

**Feature Branch**: `001-foundation-skeleton`

**Created**: 2026-11-11

**Status**: Draft

**Input**: User description: "Phase 1 — Foundation for Mozakrety (مذاكرتي): a production-ready empty application skeleton that every later feature (Wallet, Study Groups, Passport, Mall, etc.) will be built on. No business features. Covers enforced code structure and boundaries, a reusable design-system layer, runtime role theming (Student blue #2E7DFF, Parent green #10B981, Teacher purple #8B5CF6, School red #EF4444, Partner amber #F59E0B), Arabic (RTL) / English (LTR) with runtime switching, and day-one quality gates (strict typing, linting, unit tests, performance budgets). Includes a removable dev-only verification page."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enforced structure and boundaries (Priority: P1)

A developer opens the project and finds a documented, predictable layout: shared application core,
shared reusable parts, and one area per audience (public, auth, student, parent, teacher, school,
partner, admin). Each area has the same inner layout for screens, presentational parts, data access
and models. If the developer writes code that crosses a forbidden boundary, the automated checks reject it.

**Why this priority**: Every later feature depends on it; architectural drift is the main risk to
long-term maintainability.

**Independent Test**: Introduce each forbidden dependency on purpose, confirm the lint check fails,
remove it, confirm the check passes.

**Acceptance Scenarios**:

1. **Given** the project, **When** a developer inspects it, **Then** all areas and inner folders exist and a short document explains what belongs where.
2. **Given** a deliberate dependency from one feature area to another, **When** lint runs, **Then** it fails and names the violated rule.
3. **Given** a deliberate dependency from shared code to a feature area or to core, **When** lint runs, **Then** it fails.
4. **Given** a deliberate dependency from core to a feature area, **When** lint runs, **Then** it fails.
5. **Given** a deliberate dependency from the public area to a role area, **When** lint runs, **Then** it fails.
6. **Given** each violation above has been removed, **When** lint runs, **Then** it passes.

---

### User Story 2 - Consistent design-system layer (Priority: P1)

A developer building a screen consumes our shared UI component library (`src/app/shared/ui`, synchronized with `github.com/3llwany/ng-ui-components` via `git ui-add`), which wraps the chosen third-party component library (`PrimeNG`). Existing library components (`button`, `input`, `select`, `datepicker`, `switch`, `back-btn`) are reused directly or extended in place with backward-compatible inputs, and missing generic primitives (`card`, `dialog`) are created inside `src/app/shared/ui/<kebab-name>/` following the library conventions. No feature imports `primeng/*` directly.

**Why this priority**: Visual consistency, cross-project reuse, and replaceability must exist before any feature screens.

**Independent Test**: View all library components on the verification page; attempt a direct `primeng/*` import from a feature and confirm lint fails.

**Acceptance Scenarios**:

1. **Given** the verification page, **When** opened, **Then** every Phase 1 library component (`app-button`, `app-input`, `app-select`, `app-card`, `app-dialog`, plus available `app-datepicker` and `app-switch`) is shown in its main states (default, hover, focus, disabled, invalid where applicable).
2. **Given** a feature file importing `primeng/*` directly, **When** lint runs, **Then** it fails.
3. **Given** the components in `src/app/shared/ui`, **When** inspected, **Then** each follows the `ng-ui-components` library conventions (`app-*` selector, `App*` class with alias export, Signal Forms `Field` support where applicable, zero Mozakrety-specific logic) and all library changes are recorded in `docs/ui-library-contributions.md`.

---

### User Story 3 - Runtime role theming (Priority: P1)

An end user sees the interface in their role's primary color: Student blue #2E7DFF, Parent green
#10B981, Teacher purple #8B5CF6, School red #EF4444, Partner amber #F59E0B. The theme can change at
runtime with no page reload, and the chosen theme is remembered across reloads with no flash of the
wrong theme.

**Why this priority**: Role identity is a core part of the product experience, and theming must be
built into the foundation, not retrofitted.

**Independent Test**: On the verification page, switch among the five roles and watch every
component and utility color change; reload and confirm the theme persists with no flash.

**Acceptance Scenarios**:

1. **Given** any role theme selected, **When** the user switches to another, **Then** all wrapped components and styling utilities change primary colors immediately without a reload.
2. **Given** a theme is selected, **When** the user hovers, focuses, presses or disables a component, **Then** the state colors derive from that role's palette and remain readable.
3. **Given** a theme was previously chosen, **When** the page is reloaded, **Then** the same theme is visible from the first painted frame (no flash of another theme).
4. **Given** any role palette, **When** text and controls are measured, **Then** contrast meets WCAG AA (4.5:1 body text, 3:1 large text and UI boundaries).

---

### User Story 4 - Arabic/English with correct mirroring (Priority: P1)

An end user can use the app in Arabic (right-to-left) or English (left-to-right) and switch at runtime.
Direction, text and layout all change correctly: spacing mirrors and directional icons flip.

**Why this priority**: The audience is primarily Arabic-speaking; bilingual support cannot be added later cheaply.

**Independent Test**: Switch languages on the verification page; confirm direction attribute, text,
spacing and icon direction; scan the code for hardcoded strings and physical-direction styling.

**Acceptance Scenarios**:

1. **Given** the app in English, **When** the user switches to Arabic, **Then** the page direction becomes right-to-left, all visible text appears in Arabic, and spacing and directional icons mirror, without a reload.
2. **Given** the app in Arabic, **When** the user switches to English, **Then** the page direction becomes left-to-right and everything mirrors back.
3. **Given** a first visit with no stored preference, **When** the app loads, **Then** the language is chosen from the visitor's browser preferences, falling back to Arabic when neither language matches (see Assumptions).
4. **Given** a language was chosen, **When** the page is reloaded, **Then** the same language and direction are applied from the first paint.
5. **Given** the code base, **When** automated checks run, **Then** they fail on any hardcoded user-facing string or physical-direction styling (left/right margin, padding, position).
6. **Given** Arabic text, **When** rendered, **Then** the Arabic typeface displays correctly, and if it cannot load, a readable system fallback is used with no layout break.

---

### User Story 5 - Day-one quality gates (Priority: P1)

A developer gets strict typing, linting, a working unit-test runner with a sample test, a production
build, and performance budgets that fail the build when exceeded.

**Why this priority**: Gates introduced later are rarely applied retroactively.

**Independent Test**: Run lint, test and production build; temporarily exceed a budget and confirm
the build fails.

**Acceptance Scenarios**:

1. **Given** the project, **When** the lint, unit-test and production-build commands run, **Then** all succeed.
2. **Given** a type error is introduced, **When** the build runs, **Then** it fails (strict typing).
3. **Given** a budget is deliberately exceeded, **When** the production build runs, **Then** it fails.
4. **Given** the finished skeleton, **When** the production build completes, **Then** the initial bundle size is reported.

---

### User Story 6 - Removable dev-only verification page (Priority: P2)

A temporary page, clearly marked as removable, shows the wrapped components, a role-theme switcher
(five roles) and a language switcher (ar/en). It exists only in development and is absent from
production builds.

**Why this priority**: It is the means of demonstrating stories 2-4, but it is not a product feature.

**Independent Test**: Open it in development; inspect the production build output and confirm
it is not included and not reachable.

**Acceptance Scenarios**:

1. **Given** a development run, **When** the page is opened, **Then** it shows the components, theme switcher and language switcher, and a visible "temporary / removable" marker.
2. **Given** a production build, **When** inspected, **Then** the page's code and route are not included and requesting its address does not display it.
3. **Given** the page is deleted, **When** the app is built, **Then** nothing else breaks.

---

### Edge Cases

- First load with no stored language or theme: language detected from browser, theme falls back to the default (see Assumptions).
- Stored language or theme preference is invalid or from an older version: the app discards it and uses the defaults without errors.
- Browser storage is unavailable or blocked: the app still works for the session using defaults and the in-session choice.
- Arabic font fails to load or is slow: readable fallback is shown and text does not jump or overflow noticeably.
- Mixed-direction content (e.g. English brand names or numbers inside Arabic text) renders in the correct order.
- Rapid repeated switching of language or theme leaves a consistent final state.
- Dark mode is out of scope; the system's dark-mode preference MUST NOT alter the appearance.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST provide the agreed top-level areas (core, shared, and public/auth/student/parent/teacher/school/partner/admin features), each feature area with screens, presentational parts, data access and models sections.
- **FR-002**: A short document MUST describe the structure and where each kind of code belongs.
- **FR-003**: Automated checks MUST reject: feature→other feature, shared→features, shared→core, core→features, and public→role-feature dependencies; and MUST reject direct use of the third-party UI library from feature areas.
- **FR-004**: The rule violations MUST be demonstrated (fail with violation, pass without) as part of verification.
- **FR-005**: A shared design-system layer MUST provide our own reusable UI components wrapping the chosen component library, covering at least the elements shown on the verification page.
- **FR-006**: The system MUST support five role themes with authoritative base colors (`primary-500`), plus a provisional admin role:
  - `student`: `#2E7DFF` (authoritative)
  - `parent`: `#10B981` (authoritative)
  - `teacher`: `#8B5CF6` (authoritative)
  - `school`: `#EF4444` (authoritative)
  - `partner`: `#F59E0B` (authoritative)
  - `admin`: `#4F46E5` (provisional neutral proposal)
  - The full 50–950 scales MUST be defined in ONE place as CSS variables per `[data-role]`. Step 500 MUST match the sheet hex exactly. Other steps (50–400, 600–950) are generated around step 500 keeping hue stable (OKLCH) and are marked **provisional** (swappable in a single file).
  - Each role MUST define `--primary-contrast` (accessible text color on filled primary) and `--primary-gradient` (for gradient button surfaces).
  - Tailwind reads these via `@theme inline` (`--color-primary-*`), and PrimeNG's `UiThemePreset` (or `MozAuraPreset`) points its primary palette and contrast color to the same CSS variables without hardcoded palettes.
- **FR-007**: Theme MUST be switchable at runtime without reload and persisted across reloads with no visible flash of the wrong theme.
- **FR-008**: The system MUST support Arabic (RTL) and English (LTR), switchable at runtime, persisted across reloads, applied from the first paint.
- **FR-009**: Language MUST be detected on first visit from the browser's preferences, with a defined fallback.
- **FR-010**: All user-facing text MUST come from translation resources in both languages; automated checks MUST flag hardcoded user-facing strings.
- **FR-011**: Styling MUST use only direction-aware (logical) spacing and alignment; automated checks MUST flag physical-direction styling.
- **FR-012**: Directional icons MUST mirror in RTL; non-directional icons MUST NOT.
- **FR-013**: Typography: The final font will be provided by the user. Until provided, the system MUST use a placeholder variable `--font-sans` with an Arabic-capable fallback stack (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Arabic', 'Helvetica Neue', Arial, sans-serif`) defined in `@theme` and on `body`, self-hosted with `font-display: swap`. PrimeNG MUST inherit the font from `body` (no font set in the preset). No brand font shall be chosen beyond this neutral placeholder.
- **FR-014**: A dev-only verification page MUST show wrapped components, a theme switcher and a language switcher, be visibly marked removable, and be excluded from production builds.
- **FR-015**: The project MUST enforce strict typing, linting, a working unit-test runner with at least one sample test, and a production build that succeeds.
- **FR-016**: Performance budgets MUST be configured and MUST fail the build when exceeded; the initial bundle size MUST be reported.
- **FR-017**: The app MUST use the modern conventions required by the project constitution (zoneless, signals, default OnPush behavior).
- **FR-018**: The skeleton MUST NOT include authentication, role-area routing, SEO services, real API calls or any business feature.
- **FR-019**: The system MUST NOT provide dark mode and MUST ignore the system dark-mode preference.
- **FR-020**: All themes and both languages MUST meet WCAG AA contrast and accessibility checks on the verification page:
  - Text on filled primary (`--primary-contrast` on `primary-500` or on `primary-600` interactive controls) MUST achieve `≥ 4.5:1`.
  - Primary text on white surfaces (`primary-600` / `primary-700`) MUST achieve `≥ 4.5:1`.
  - Non-text UI boundaries and focus rings on white MUST achieve `≥ 3:1`.
  - Where a role's base `500` fails WCAG AA against white text (e.g. parent green, partner amber, student blue, school red), `--primary-contrast` is adjusted (e.g. dark text) or `600`/`700` is used for text/filled interactive surfaces, never modifying the authoritative `500` hex.

### Key Entities

- **Role Theme**: A named palette tied to a role (student, parent, teacher, school, partner, admin) with authoritative `500` base hex, provisional 50–950 OKLCH-stable scale, `--primary-contrast`, and `--primary-gradient`.
- **Language Preference**: The selected language (ar or en) and its direction; stored per browser.
- **Theme Preference**: The selected role theme; stored per browser.
- **Design-System Component**: A reusable UI element offered to features, with its supported states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the five forbidden dependency types fail lint when introduced and pass when removed (demonstrated in verification).
- **SC-002**: Switching theme or language updates the whole visible screen in under 200 ms with no reload and no layout breakage.
- **SC-003**: After a reload, 0 frames show the wrong theme, language or direction.
- **SC-004**: 100% of verification-page elements in all six themes pass WCAG AA contrast (`≥ 4.5:1` for text, `≥ 3:1` for UI components) and automated accessibility checks.
- **SC-005**: 0 hardcoded user-facing strings and 0 physical-direction style usages in the code base, enforced by automated checks.
- **SC-006**: Lint, unit tests and production build all pass from a clean checkout in a single run, and a deliberately exceeded budget fails the build.
- **SC-007**: The initial download size is reported and kept within the configured budget (target: under 150 kB transferred, compressed, for the empty skeleton).
- **SC-008**: A new developer can find the right place for a new feature file from the structure document in under 5 minutes.

## Assumptions

- Admin has no brand color in the design sheet; it gets a neutral slate proposal with indigo accent (`#4F46E5`) marked as provisional. The default theme before any role is chosen is Student blue (`#2E7DFF`).
- Role scales 50–400 and 600–950 are provisional and live in a single file for easy replacement by designers.
- Font is pending delivery by the user; neutral fallback stack is used in the interim and inherited by PrimeNG.
- Default language when the browser matches neither Arabic nor English is Arabic.
- Language and theme preferences are stored in cookies (not the backend) so the server can render the right language and direction; they contain no personal data.
- The verification page lives at `/dev/foundation`, is available only in development builds and is removed before later phases.
- Component set for the design-system layer is a starter set (buttons, text input, select, checkbox, dialog, card, tag, tooltip-level basics); more are added as features need them.
- The target stack and conventions are defined by the project constitution and are decided in the planning phase, not here.
- Out of scope: authentication, role-area routing, SEO service, real API calls, business features, dark mode.
