# ADR-0005: Authentication session and conditional restore

- **Status:** Accepted
- **Date:** 2026-11-23

## Context

Authentication is optional in consuming applications. When enabled, session state must remain scoped to Angular dependency injection so concurrent SSR requests cannot share user state. Tokens must not be stored in Web Storage.

## Decision

- Keep transport behind `AuthApi`; `MockAuthApi` supports local demos and `HttpAuthApi` demonstrates HttpOnly-cookie sessions.
- `AuthService` owns only generic user data and the `unknown` / `anonymous` / `authenticated` states.
- Restore the session in the browser only when the session hint cookie exists or the initial path is under `/auth`.
- Use `authGuard` and `guestGuard` for authentication status. Product-specific authorization belongs to the consuming application.
- SSR starts anonymous and does not issue a session lookup.

## Consequences

- Public pages do not wait on an unnecessary `auth/me` request.
- Switching authentication providers stays within `core/auth` and its provider configuration.
- A real application must confirm its backend endpoints, CSRF policy, and session behavior before enabling the HTTP provider.
