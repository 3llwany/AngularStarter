# ADR-0006: Authentication provider and backend navigation

- **Status:** Accepted
- **Date:** 2026-11-23

## Decision

- Keep the authentication transport behind the `AuthApi` abstraction. Configure either the in-memory mock or the HTTP implementation in the application provider.
- Fetch authenticated navigation from the backend through `NavService`; keep the navigation item contract generic and independent of route ownership.
- Keep local showcase menu data in the development interceptor. Production navigation comes from the consuming application's backend contract.

## Consequences

- Account-specific authorization rules belong to the consuming application, not the starter's generic auth provider.
- Applications with a different login contract update their feature UI and `AuthApi` request model as needed.
- Feature routes remain owned by their feature; menu links are configuration data, not a centralized route registry.
