# ADR-0002: Keep PrimeNG behind shared UI components

- **Status:** Accepted
- **Date:** 2026-11-11

## السياق

The app uses **PrimeNG v22** with `@primeuix/themes` Aura and `tailwindcss-primeui`. Direct imports inside every feature would duplicate accessibility, styling, and upgrade work:

1. Third-party API changes would affect many feature files.
2. Each feature could implement different visual behavior for the same control.
3. Accessibility, localization, and RTL details would be repeated across features.

## القرار

1. Keep shared PrimeNG components and directives in `src/app/shared/ui/` behind reusable wrappers.
2. Use signal-based inputs and outputs and translation keys where they fit the component.
3. Keep PrimeNG component types behind the shared UI boundary.
4. Enforce import restrictions with ESLint, allowing the application theme preset and app configuration.

## النتائج والتبعات

- **Benefits:** PrimeNG upgrades and accessibility fixes stay localized while feature templates remain consistent.
- **Trade-off:** A new PrimeNG control is added to `shared/ui` and documented before features use it.
