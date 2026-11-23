# Generic repository helpers

`BaseRepository` provides typed CRUD methods and loading/saving/deleting signals for features whose backend follows the configured endpoint convention. It is transport infrastructure only; endpoint-specific models and behavior stay in feature `data-access/`.

## Basic usage

```ts
@Service()
export class ItemRepository extends BaseRepository<Item> {
  protected override readonly endpoint = 'items';
}
```

Override individual operation names through `endpoints` when a backend uses a different convention. Use an empty operation name for REST endpoints without action suffixes.

The repository supports identifiers in the path, request body, or query parameters for update/delete operations. For custom requests, use the inherited `ApiClient` and loading helpers.

Do not add product-specific endpoints, DTOs, or cross-feature state here. Each feature owns its API contract and mapping.
