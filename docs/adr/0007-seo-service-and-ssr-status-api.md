# ADR-0007: Centralized SEO metadata and SSR response status

- **Status:** Accepted
- **Date:** 2026-11-18

## Context

Server-rendered public pages need consistent document titles, descriptions, canonical links, social metadata, alternate-language links, JSON-LD, and correct HTTP status codes for missing pages.

## Decision

- Use `SeoService` from routed page components instead of manipulating `Title` and `Meta` directly.
- Use `setPage()` for public page metadata and `setJsonLd()` for structured data when appropriate.
- Use `setNotFound()` for the 404 page so SSR returns an actual 404 response and search crawlers receive noindex metadata.
- Keep authenticated pages out of indexing by setting `noindex` where needed.

## Consequences

- Metadata and HTTP response status are managed through one SSR-aware service.
- Each consuming application must configure its own canonical base URL and site name.
