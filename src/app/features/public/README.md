# Public feature

Owns pages that do not require an authenticated session, including the starter home and not-found page. Keep SEO and SSR behavior close to the page that owns it, using `SeoService` for metadata and response status.

Public pages may depend on `core`, `shared`, and their own feature files. They must not import other features.
