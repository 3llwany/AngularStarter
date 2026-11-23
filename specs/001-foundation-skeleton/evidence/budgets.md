# Evidence: Bundle Budgets & Production Build Verification (`T051`, `T053`, `T055`)

## 1. Budget Enforcement Failure Proof (`T053`)

When `projects.mozakrety.architect.build.configurations.production.budgets[0].maximumError` in `angular.json` was temporarily lowered to `"10kB"`, `npm run build` exited with code `1`:

```text
X [ERROR] bundle initial exceeded maximum budget. Budget 10.00 kB was not met by 494.23 kB with a total of 504.23 kB.
```

## 2. Production Bundle Sizes (`T052`, `T055`)

With `@primeuix/themes/aura/base` + individual wrapped component token presets (`button`, `card`, `dialog`, `inputtext`, `ripple`, `select`) in `src/app/core/theme/moz-preset.ts` (avoiding the 90-component `@primeuix/themes/aura` barrel import per Constitution Principle VIII) and `budgets` restored to `maximumWarning: "300kB"`, `maximumError: "500kB"` (raw) in `angular.json`:

| Bundle / Chunk | Raw Size | Estimated Transfer Size (Gzip/Brotli) |
| :--- | ---: | ---: |
| `main-YBUHAUG4.js` | `376.44 kB` | `102.53 kB` |
| `styles-IHQF5WWH.css` | `36.08 kB` | `6.72 kB` |
| **Initial Total** | **`412.52 kB`** | **`109.26 kB`** |

- **Estimated transfer size (`109.26 kB`)** is well below the `300 kB` gzipped target specified in the constitution and technical plan.
- **Raw size (`412.52 kB`)** is well below the `500 kB` raw error ceiling in `angular.json` (note: Angular CLI `budgets` compare against raw uncompressed bytes, so `300 kB` raw emits an informational warning while `109.26 kB` transfer size is 63% under 300 kB).

## 3. Dev-Only Route Tree-Shaking Verification (`T051`)

In production builds (`npm run build`), `angular.json` replaces `src/app/dev/dev.routes.ts` with `src/app/dev/dev.routes.prod.ts` (`export const devRoutes: Routes = [];`).

- Searching all files in `dist/mozakrety/` for `DEV_FOUNDATION_VERIFICATION_PAGE_REMOVABLE`, `foundation-page`, and `i18n-ssr-page` returns **0 matches**.
