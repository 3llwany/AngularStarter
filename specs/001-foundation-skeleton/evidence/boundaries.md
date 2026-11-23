# Boundary Enforcement Verification Evidence (AC2 / T016)

Verified on 2026-11-11 using `sheriff.config.ts` (`@softarc/sheriff-core` + `@softarc/eslint-plugin-sheriff`) and `eslint.config.js` (`no-restricted-imports`).

## 1. Feature → Other Feature (`student` → `teacher`)

```text
W:\Mashura\Front-End\mozakrety\src\app\features\student\models\temp-violation.ts
  1:1  error  module \src\app\features\student cannot access \src\app\features\teacher. Tag feature:student has no clearance for tags type:role-feature, feature:teacher  @softarc/sheriff/dependency-rule

✖ 1 problem (1 error, 0 warnings)
```

## 2. Shared → Features (`shared` → `student`)

```text
W:\Mashura\Front-End\mozakrety\src\app\shared\temp-violation.ts
  1:1  error  module \src\app\shared cannot access \src\app\features\student. Tag type:shared has no clearance for tags type:role-feature, feature:student  @softarc/sheriff/dependency-rule

✖ 1 problem (1 error, 0 warnings)
```

## 3. Core → Features (`core` → `student`)

```text
W:\Mashura\Front-End\mozakrety\src\app\core\temp-violation.ts
  1:1  error  module \src\app\core cannot access \src\app\features\student. Tag type:core has no clearance for tags type:role-feature, feature:student  @softarc/sheriff/dependency-rule

✖ 1 problem (1 error, 0 warnings)
```

## 4. Public → Role Feature (`public` → `student`)

```text
W:\Mashura\Front-End\mozakrety\src\app\features\public\models\temp-violation.ts
  1:1  error  module \src\app\features\public cannot access \src\app\features\student. Tag feature:public has no clearance for tags type:role-feature, feature:student  @softarc/sheriff/dependency-rule

✖ 1 problem (1 error, 0 warnings)
```

## 5. Direct PrimeNG Import in a Feature (`student` → `primeng/button`)

```text
W:\Mashura\Front-End\mozakrety\src\app\features\student\ui\temp-primeng.ts
  1:1  error  'primeng/button' import is restricted from being used by a pattern. Direct PrimeNG imports are forbidden outside src/app/shared/ui (and core theme config). Use moz-* wrapper components from shared/ui  no-restricted-imports

✖ 1 problem (1 error, 0 warnings)
```

## 6. Clean Tree After Removing Violations

```text
Clean lint exit code: 0
All files pass linting.
```
