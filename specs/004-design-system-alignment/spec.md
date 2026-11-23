# Feature Specification: Design System Alignment (Phase 1.5)

**Feature Branch**: `004-design-system-alignment`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Phase 1.5 — Design-system alignment. Source of truth: docs/design/figma-components.json and docs/design/figma-deep.json (extracted from the Figma file). Read them; do not estimate values by eye. Dark mode and per-role component variants are out of scope. Goal: make the global tokens and the shared UI library match the design exactly, so later screens are assembled only from library components. User stories: 1. As a student I see components that match the design (pill buttons, glass surfaces, 54px fields), in Arabic (RTL, Alexandria) and English (LTR, Stack Sans Headline/Text). 2. As a developer I get all design tokens (colors, radii, shadows, typography, glass) in one place and can build screens without hardcoding values. 3. As a developer I can use each library component in all its designed variants and states. Acceptance criteria: AC1: The student role primary-500 is exactly #2a6eee (Figma value); other roles keep their provisional scales. Neutral/ink/semantic colors are role-independent tokens taken from the JSON. AC2: Tokens exist for typography (sizes 11–28, weights, line-heights), radii, shadows, glass, spacing used by the components; Arabic uses Alexandria for all text (including Latin), English uses Stack Sans Headline for headings/buttons and Stack Sans Text for body/labels. AC3: Button supports Primary / Glass / Tinted × Large / Medium / Small × Default / Disabled / Loading, with leading/trailing icon slots; the existing API keeps working. AC4: Library components exist and match the JSON for all designed states: Field text/select/phone/upload, Tag (6 tones × 2 sizes), Banner (info/warning/error), Toast, Choice card, Checkbox card, Chip select, Progress steps, Skeleton (line/row/card/circle), Link, Helper error, Icon button, Divider "or", Social button, Bottom-nav tab. AC5: Hover, pressed and focus-visible states (not in the design) are derived and marked provisional. AC6: Each component renders correctly in RTL and LTR using logical properties only; the dev verification page shows every variant/state side by side, per role theme. AC7: Glass is applied sparingly with a no-backdrop-filter fallback; build size and quality gates stay green. Addendum: mobile-first fluid sizing, container queries, touch targets >= 44px, no fixed frame widths (354/370px literals banned), dev page container verification (320, 390, 768, 1280px)."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authentic, Bilingual Visual Interface for Students (Priority: P1)

As a student interacting with the educational platform on mobile or larger viewports, I see polished, authentic visual components (pill-shaped buttons with soft ambient shadows, frosted glass panels, 54px comfortable touch-friendly input fields, and semantic badges) that match the official design specifications exactly. In Arabic (RTL), all text renders in the modern, legible Alexandria typeface. In English (LTR), headings and buttons render in Stack Sans Headline while body text and field labels render in Stack Sans Text.

**Why this priority**: Delivers the visual identity, student trust, and tactile delight of the platform. Guarantees WCAG AA legibility and cultural authenticity across both primary languages from day one.

**Independent Test**: Can be verified by rendering the core controls (Buttons, Fields, Badges, Cards) in Arabic (RTL) and English (LTR) at mobile (320px, 390px) and desktop (768px, 1280px) widths, confirming typography, 54px touch heights, pill radii, and glass effects.

**Acceptance Scenarios**:

1. **Given** the active role is "Student", **When** any primary interactive control is viewed, **Then** its primary background hue is precisely `#2a6eee` with an ambient glow shadow matching `#2a6eee @ 0.28`.
2. **Given** the interface language is set to Arabic (`ar`, `dir="rtl"`), **When** viewing buttons, headings, field text, and labels, **Then** all text (including numeric digits and Latin terms) renders in the `Alexandria` font family with designed line heights.
3. **Given** the interface language is set to English (`en`, `dir="ltr"`), **When** viewing headings and action buttons, **Then** text renders in `Stack Sans Headline`, and when viewing body paragraphs, inputs, or helper text, text renders in `Stack Sans Text`.
4. **Given** a user navigates on a device without hardware backdrop-filter support, **When** glass surfaces are displayed, **Then** an opaque or semi-opaque high-contrast surface fallback is rendered without visual clipping or illegible contrast.

---

### User Story 2 - Centralized Token Architecture for Scalable Engineering (Priority: P2)

As a frontend developer building feature screens, I have access to a single, unified design token system defining every exact color, typography scale (sizes 11 through 28, weights, line-height ratios), corner radii (18, 20, 22, 24, 28, 32, 99), elevation shadows (5 calibrated levels), glass layers, and fluid control dimensions, so that I can compose complete screens without hardcoding hex codes, arbitrary pixels, or physical directional offsets.

**Why this priority**: Eliminates style drift, visual regressions, and duplicated CSS across features. Ensures that changes to global brand assets or tokens instantly cascade across all 6 roles and shared components.

**Independent Test**: Can be verified by inspecting generated theme style sheets and token catalogs, asserting that all colors, radii, shadows, and fonts originate from documented tokens, and verifying that automated linter rules reject hardcoded physical directions and fixed frame widths.

**Acceptance Scenarios**:

1. **Given** a developer references color variables, **When** examining neutrals (`#12233a`, `#647086`, `#9aa3b5`, `#c9d4ea`, `#eef0f4`), **Then** they exist as role-independent surface and text tokens matching Figma definitions.
2. **Given** a developer composes an input or button, **When** inspecting its dimensional rules, **Then** width is fluid (100% of container or hugging content), control height respects standard min-height constraints (56px Large, 44px Medium, 36px Small, 54px Field), and hardcoded frame dimensions (354px or 370px) are rejected.
3. **Given** automated checks run on the codebase, **When** any physical directional CSS utility (`ml-*`, `mr-*`, `left-*`, `right-*`) or fixed frame literal (`354px`, `370px`) is introduced in the shared UI library, **Then** the build/lint check immediately fails.

---

### User Story 3 - Complete Library Component Variants & Interactive States (Priority: P3)

As a frontend developer, I can consume every foundational library component across all its Figma-designed visual variants (Buttons, Text/Select/Phone/Upload Fields, Tags, Banners, Toasts, Choice Cards, Checkbox Cards, Chip Selects, Progress Steps, Skeletons, Links, Helper Text, Icon Buttons, Dividers, Social Buttons, Bottom Tabs) along with derived, accessible interactive states (default, hover, active/pressed, focus-visible, disabled, loading).

**Why this priority**: Enables the immediate, assembly-only construction of downstream feature workflows (Auth, Student Dashboard, Parent Portal) without ever reinventing basic primitives.

**Independent Test**: Can be verified via an interactive verification gallery page displaying all components in every variant, state, tone, and size side-by-side inside responsive test containers (320px, 390px, 768px, 1280px) in both Arabic and English.

**Acceptance Scenarios**:

1. **Given** a Button component, **When** configured with any combination of Type (`Primary`, `Glass`, `Tinted`), Size (`Large` 56px, `Medium` 44px, `Small` 36px), and State (`Default`, `Hover`, `Pressed`, `Focused`, `Disabled`, `Loading`), **Then** it renders with the exact padding, radius, icon gap, typography, and derived provisional interaction feedback.
2. **Given** input fields (Text, Select, Phone, Upload), **When** rendered across valid, filled, focused, disabled, and error states, **Then** they maintain a minimum height of 54px, display clear helper/error text, and provide accessible focus rings.
3. **Given** a Tag or Banner component, **When** rendered across its semantic tones (Neutral, Info, Success, Warning, Error, Primary), **Then** its background fill, text color, and border match the exact color definitions in `figma-components.json`.
4. **Given** Choice Cards and Checkbox Cards, **When** toggled between unselected and selected states, **Then** they transition smoothly, display correct checkmarks/radios, and adapt their height fluidly to their child content.

---

### Edge Cases

- **Missing System Fonts / Font Loading Delays**: When custom web fonts (`Alexandria`, `Stack Sans Headline`, `Stack Sans Text`) are downloading or fail to load, the system must seamlessly fall back to system sans-serif metrics without layout shifts or unreadable overlaps.
- **Backdrop-Filter Unsupported**: In older mobile webviews or browsers with GPU glass acceleration disabled, glass panels must fall back to a solid or semi-opaque high-opacity background (`rgba(255, 255, 255, 0.95)` with border) to prevent low-contrast text readability failures.
- **Narrow Container Contraction (< 320px)**: When components render in ultra-compact viewports or multi-column panels, action buttons and card layouts must wrap gracefully without clipping text, using container queries (`@container`) rather than viewport media queries.
- **Very Long Text / Localization Expansion**: When translated Arabic or English text expands beyond expected lengths, pill buttons and field labels must wrap or truncate gracefully with tooltips, maintaining minimum touch targets of >= 44px on touch devices.
- **Simultaneous Mouse and Touch Inputs**: On hybrid touch/pointer laptops, hover styles must not get stuck in a persistent "hovered" state after a touch tap; hover styles must be encapsulated within `@media (hover: hover)` queries.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Design Tokens & Theme Alignment
- **FR-001**: The system MUST define the Student role `primary-500` color token as precisely `#2a6eee` (taken directly from `docs/design/figma-components.json`), while retaining provisional scale values for other roles until their respective design phases.
- **FR-002**: The system MUST establish centralized design tokens for role-independent neutral, ink, and semantic surfaces:
  - Deep Ink / Primary Text: `#12233a`
  - Subdued / Secondary Text: `#647086` and `#6b758a`
  - Muted / Placeholder Text: `#9aa3b5`
  - Subtle Borders & Dividers: `#c9d4ea` and `#eef0f4`
  - Semantic Green (Success): Fill `#ddf6ec`, Text `#13795b`
  - Semantic Orange (Warning): Fill `#ffe8da`, Text `#a4480f`
  - Semantic Red (Error / Destructive): Fill `#fde4e1`, Text `#b42318`
  - Semantic Blue (Info / Primary Tint): Fill `#e6eeff`, Text `#2a6eee`
  - Semantic Amber: Fill `#fff1d6`, Text `#8a5a00`
- **FR-003**: The system MUST provide standardized corner radius tokens matching Figma specifications:
  - `radius-sm`: `18px`
  - `radius-md`: `20px`
  - `radius-lg`: `22px`
  - `radius-xl`: `24px`
  - `radius-2xl`: `28px`
  - `radius-3xl`: `32px`
  - `radius-pill`: `99px` (or `9999px` / `rounded-full`)
- **FR-004**: The system MUST define the 5 calibrated Figma elevation shadows as reusable tokens:
  - `shadow-primary-lg`: `0 8px 20px -6px rgba(42, 110, 238, 0.28)`
  - `shadow-primary-md`: `0 6px 14px -4px rgba(42, 110, 238, 0.25)`
  - `shadow-primary-xl`: `0 12px 28px -10px rgba(42, 110, 238, 0.30)`
  - `shadow-card-subtle`: `0 8px 24px 0 rgba(18, 35, 58, 0.08)`
  - `shadow-card-elevated`: `0 8px 24px -4px rgba(18, 35, 58, 0.20)`
- **FR-005**: The system MUST define glass styling tokens consisting of background fill `rgba(255, 255, 255, 0.60)`, subtle border `1px solid rgba(255, 255, 255, 0.75)`, background blur `16px`, and an opaque fallback (`rgba(255, 255, 255, 0.95)`) for environments lacking `backdrop-filter` support.
- **FR-006**: The system MUST configure typography tokens supporting sizes 11px through 28px, font weights 400, 500, 600, 700, and exact line-height ratios:
  - Arabic (RTL): Alexandria for all text (including numerals and Latin terms).
  - English (LTR): Stack Sans Headline for headings and buttons; Stack Sans Text for body, labels, and inputs.

#### Sizing, Fluidity & Responsive Boundaries
- **FR-007**: All shared UI components MUST be fluid in width, filling 100% of their parent container by default (or hugging content where semantically appropriate, such as inline buttons), and MUST NOT hardcode Figma mobile artboard dimensions (`354px`, `370px`).
- **FR-008**: Component heights for cards, banners, list rows, and dialogs MUST hug their content dynamically. Only designated interactive controls retain standardized fixed min-heights:
  - Large Button: `56px` min-height
  - Medium Button: `44px` min-height
  - Small Button: `36px` min-height
  - Field Inputs (Text, Select, Phone, Upload): `54px` min-height
  - Chip Select: `44px` min-height
- **FR-009**: The shared UI library MUST rely strictly on CSS logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`) and container queries (`@container`) for internal responsiveness. Viewport media queries, max page widths, and outer layout paddings MUST remain exclusively in application shell components.
- **FR-010**: All touch targets on touch-capable devices MUST maintain a minimum tappable area of 44px × 44px to satisfy WCAG AA requirements. Hover styles MUST be wrapped in `@media (hover: hover)` queries to prevent sticky touch states.

#### Shared Component Variant Catalog
- **FR-011 (Button)**: The Button component MUST support Types (`Primary`, `Glass`, `Tinted`), Sizes (`Large` 56px, `Medium` 44px, `Small` 36px), States (`Default`, `Disabled`, `Loading`), full-width expansion (`fullWidth: boolean`), and leading/trailing icon slots while maintaining backward compatibility with the existing API.
- **FR-012 (Form Fields)**: Form controls MUST provide:
  - `Field / Text`: Single-line text input with floating or fixed label, clear button, leading/trailing icons, and validation message binding.
  - `Field / Select`: Dropdown selector with placeholder, searchable option list, and clear state.
  - `Field / Phone`: Country dial code selector paired with formatted telephone input.
  - `Field / Upload`: Drag-and-drop file upload target with file type hints, progress indicators, and cancel actions.
- **FR-013 (Tags & Badges)**: The Tag component MUST support 6 semantic color tones (Neutral, Info, Success, Warning, Error, Primary) across 2 sizes (Regular and Small), with optional dot/icon indicators.
- **FR-014 (Banners & Alerts)**: The Banner component MUST support Info, Warning, and Error tones with leading semantic status icons, title, description, and optional dismiss action.
- **FR-015 (Cards & Selectable Tiles)**: The library MUST provide:
  - `Card / Choice`: Interactive radio card with title, description, and right/left indicator badge.
  - `Card / Checkbox`: Multi-select card with title, icon, and embedded accessible checkbox.
- **FR-016 (Navigation & Controls)**: The library MUST provide:
  - `Chip / Select`: Filter and selection chips with active/inactive states.
  - `Progress / Steps`: Multi-step indicator displaying completed, active, and upcoming phases.
  - `Skeleton`: Loading placeholders supporting text line, list row, content card, and circular avatar shapes.
  - `Link`: Text link and prompt link variants with subtle hover underlines and keyboard focus styles.
  - `Helper / Error`: Sub-field text displaying character counts, helper explanations, and accessible error messages.
  - `Icon Button`: Circular and rounded back/action icon buttons with minimal touch padding.
  - `Divider / Or`: Horizontal separator featuring centered localized separator text ("أو" / "OR").
  - `Social Button`: Dedicated single-click authentication buttons for Google and Facebook with official logos.
  - `Nav / Tab`: Bottom and segmented navigation tab items with active pill indicator.
- **FR-017 (Provisional Interactive States)**: For all components whose Figma specifications only illustrate default states, the system MUST derive and document provisional hover, pressed, and focus-visible states matching the brand palette and WCAG AA contrast standards.

#### Verification & Showcase
- **FR-018**: The system MUST provide an interactive developer verification showcase page (`/dev/foundation` or dedicated design system route) displaying all components, variants, and states side-by-side in both Arabic (`dir="rtl"`) and English (`dir="ltr"`).
- **FR-019**: The developer verification showcase MUST present each component inside container query test fixtures configured at widths of `320px`, `390px`, `768px`, and `1280px` to verify fluid responsiveness and container adaptability.
- **FR-020**: The system MUST include an automated check in the linting/testing pipeline verifying that no component in `src/app/shared/ui/` contains hardcoded `354px` or `370px` dimensions.

---

### Key Entities *(include if feature involves data)*

- **Design Token Registry**: The centralized set of CSS variables and configuration objects defining the color palettes (Student primary `#2a6eee` and neutrals), font family mappings (`Alexandria`, `Stack Sans Headline`, `Stack Sans Text`), font size/weight scales, radius scales, shadow levels, and glass recipes.
- **Component Variant Matrix**: The formal specification of permitted inputs for each shared UI component, mapping Figma variant properties (Type, Size, State, Direction, Tone) to component properties and logical styles.
- **Responsive Test Container**: The verification harness fixture configured at predefined widths (320px, 390px, 768px, 1280px) to stress-test container query adaptability and bidirectional text rendering.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of shared UI components render with fluid width, with zero instances of hardcoded `354px` or `370px` frame dimensions detected in `src/app/shared/ui/`.
- **SC-002**: The Student role primary-500 color value matches `#2a6eee` exactly across all computed surfaces in light mode.
- **SC-003**: 100% of user-facing typography adheres to the bilingual font contract: Alexandria for all text in Arabic (RTL), and Stack Sans Headline / Stack Sans Text in English (LTR).
- **SC-004**: 100% of interactive components (buttons, fields, links, cards) provide visible focus indicators and comply with WCAG AA minimum touch target sizing (>= 44px on touch viewports) and color contrast ratios (>= 4.5:1 for normal text).
- **SC-005**: All 20 designated component types (Button, Field Text/Select/Phone/Upload, Tag, Banner, Toast, Choice Card, Checkbox Card, Chip Select, Progress Steps, Skeleton, Link, Helper Error, Icon Button, Divider Or, Social Button, Bottom Nav Tab) render all designed states on the developer verification page without console errors or layout overflow.
- **SC-006**: Total production bundle size impact for the shared UI alignment remains within the established budget, and all four quality gates (`typecheck`, `lint`, `test`, `build`) pass cleanly.

---

## Assumptions

- **Web Font Delivery**: Web font assets for `Alexandria`, `Stack Sans Headline`, and `Stack Sans Text` are either locally served or loaded via high-performance CDN links in `index.html` or `fonts.css`, with standard `font-display: swap` to prevent FOIT (Flash of Invisible Text).
- **Domain Components Deferred**: Complex domain-specific components (Passport card, Child rows, Exam cards, Plan cards, Grade inputs, Student/Parent specific navigation shells) are deliberately excluded from Phase 1.5 and will be implemented in subsequent domain feature phases.
- **Icon Assets Dependency**: Specialized custom SVG icons from Figma will continue to use temporary PrimeIcons or neutral SVG placeholders until an official automated SVG export pipeline is executed.
- **Scope Limitation**: Dark mode theming and per-role custom component variants (beyond standard CSS variable color mapping) are explicitly out of scope for this phase.
- **Container Queries Compatibility**: Target modern browsers support CSS container queries (`@container`), which is standard across all modern evergreen desktop and mobile browsers.
