# ADR-0004: Centralized design tokens and responsive components

- **Status:** Accepted
- **Date:** 2026-11-15

## Context

Reusable UI components need consistent spacing, color, surfaces, and interactive states across mobile and desktop layouts. Fixed artboard widths should not become constraints on responsive web components.

## Decision

- Keep the fixed application palette and shared color tokens in `src/styles/palette.css` and `src/styles/theme.css`.
- Use tinted surfaces and ambient shadows derived from the same primary palette.
- Use container queries and fluid widths when components need to adapt to their parent.
- Keep touch targets at least 44px where appropriate and provide keyboard focus styles.
- Use Alexandria for Arabic and Stack Sans for English; both font families are self-hosted in `public/fonts/`.

## Consequences

- UI components share a consistent token source and can adapt to varied layouts.
- Color and responsive changes should be validated through the existing contrast and design-token checks.
