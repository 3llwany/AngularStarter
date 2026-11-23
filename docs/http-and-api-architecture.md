# HTTP and API Architecture

The starter provides a small transport layer. Features own endpoint definitions, request/response DTOs, mapping, and feature state.

## Request flow

```text
Feature page → feature repository/service → ApiClient → HTTP interceptors → backend
```

- Pages call feature data-access services; they do not construct API URLs or call `HttpClient` directly.
- `ApiClient` handles shared transport behavior and unwraps the common response envelope.
- `BaseRepository` offers typed CRUD helpers for features whose backend follows the configured endpoint convention.
- Interceptors handle base URL, common locale parameters, credentials, errors, and loading state.
- The common parameter interceptor adds the active locale only. It does not infer product permissions or user categories.

## Ownership

| Concern | Owner |
|---|---|
| Base URL, credentials, locale header/query, error mapping, request context | `core/http` and `core/interceptors` |
| Endpoint paths and backend DTOs | `features/<feature>/data-access/` |
| DTO-to-view-model mapping | The feature repository or mapper that owns the endpoint |
| Loading, filters, selected item, and screen state | Feature-local service or SignalStore |
| Session restoration and authentication status | `core/auth` |

Do not add product-specific methods or stores to `ApiClient`, `BaseRepository`, or `core`. Add a shared capability only when multiple features actually own the same contract.

## Configuration

`public/config.json` contains `apiBaseUrl`; the starter defaults to `/api`. Set the value to the backend base URL for each deployment environment. Avoid committing credentials or environment secrets into this file.

## SSR transfer cache

`provideCoreFramework()` enables Angular hydration and transfer caching. Requests with credentials, auth headers, mutating verbs, or non-cacheable cache directives are excluded. Review the cache filter whenever the backend adds sensitive public-looking endpoints.

## Example

```ts
@Service()
export class ItemRepository extends BaseRepository<Item> {
  protected override readonly endpoint = 'items';
}
```

For a non-CRUD endpoint, inject `ApiClient` into a feature-owned service and keep the response types next to that feature.
