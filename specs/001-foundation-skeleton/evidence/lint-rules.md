# Evidence: Custom ESLint & i18n Quality Gate Verification (`T037`)

## Overview

Verified that `npm run lint` (`ng lint && npm run i18n:check`) fails when any of the following violations are introduced and passes once they are removed:

1. **Physical-direction Tailwind utility** (`ml-4`, `text-left`) — caught by `mozakrety/no-physical-direction`
2. **Hardcoded user-facing template string** (`<p>Hardcoded English Text Violation</p>`) — caught by `mozakrety/no-untranslated-template-text`
3. **`TranslateService.instant()` call in application code** — caught by `mozakrety/no-translate-instant`
4. **Missing translation key** (`common.missing_key_probe`) — caught by `tools/i18n-check.mjs`
5. **Unused translation key** (defined in `public/i18n/{ar,en}.json` but unreferenced in `src/`) — caught by `tools/i18n-check.mjs`

## Captured Failure Output

```text
W:\Mashura\Front-End\mozakrety\src\app\dev\_lint-violation-probe.ts
   7:13  error  Physical-direction utility "text-left" is forbidden (Constitution Principle IX). Use logical Tailwind utilities (ms-*, me-*, ps-*, pe-*, start-*, end-*, text-start, text-end, border-s/e, rounded-s/e)  mozakrety/no-physical-direction
  16:31  error  TranslateService.instant() is forbidden outside unit tests. Use the translate pipe in templates or toSignal(translate.stream(...)) in TypeScript                                                         mozakrety/no-translate-instant
   8:10  error  Physical-direction utility "ml-4" is forbidden (Constitution Principle IX). Use logical Tailwind utilities (ms-*, me-*, ps-*, pe-*, start-*, end-*, text-start, text-end, border-s/e, rounded-s/e)       mozakrety/no-physical-direction
   9:10  error  Hardcoded user-facing template string "Hardcoded English Text Violation" is forbidden (Constitution Principle IX). Use an ngx-translate key with the translate pipe                                      mozakrety/no-untranslated-template-text

✖ 4 problems (4 errors, 0 warnings)

Mozakrety i18n key check failed:
  - [Code -> ar.json] Missing translation key "common.missing_key_probe" referenced in source.
  - [Code -> en.json] Missing translation key "common.missing_key_probe" referenced in source.
```

Unused key check failure output (captured before dev pages referenced `common.*` / `dev.*`):

```text
Mozakrety i18n key check failed:
  - [Unused key] "common.app_name" is defined in translation JSON files but never referenced in src/.
```

## Captured Pass Output After Revert

```text
> mozakrety@0.0.0 lint
> ng lint && npm run i18n:check

Linting "mozakrety"...
All files pass linting.

> mozakrety@0.0.0 i18n:check
> node tools/i18n-check.mjs

Mozakrety i18n check passed: 59 keys verified across ar.json and en.json (59 referenced in src/).
```
