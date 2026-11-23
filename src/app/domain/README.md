# Shared capabilities

Use `domain/<capability>/` for a stable contract, repository, or behavior that multiple features genuinely share. Keep feature-only UI, routes, screen state, and DTOs inside the owning feature.

Do not create capability folders speculatively. Start in the first feature that needs the behavior and extract a shared capability once another feature has the same real requirement.

Domain capabilities may depend on `core` and `shared`, but not on features or other domain modules. Export only the supported public API from each capability's `index.ts` and import through `@domain/<capability>`.
