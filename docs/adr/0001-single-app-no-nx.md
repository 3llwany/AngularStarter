# ADR-0001: Start as a single Angular application

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

The repository is a reusable web application starter. It needs clear module boundaries and lazy feature routes without the setup cost of a multi-project monorepo tool.

## Decision

- Use one Angular CLI application with `core`, `shared`, `features`, and development-only showcase areas.
- Use Sheriff and ESLint to enforce module boundaries and import conventions.
- Lazy-load feature routes so future applications can add capabilities without loading every page in the initial bundle.

## Consequences

- Build and workspace configuration stay straightforward for a single app.
- If the repository later grows multiple independently released apps or libraries, reassess the monorepo decision.
