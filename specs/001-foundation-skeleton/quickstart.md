# Quickstart: Validating Phase 1

Prerequisites: `npm install` (after the Phase 1 dependency install step).

| Check | Command | Expected |
|-------|---------|----------|
| Typecheck | `npm run typecheck` | No errors (strict) |
| Lint | `npm run lint` | Clean tree passes (Sheriff, PrimeNG import rule, physical-utility rule, a11y template rules) |
| Unit tests | `npm test` | ThemeService, LocaleService and contrast tests pass |
| Production build | `npm run build` | Succeeds; initial size reported; budgets enforced |
| Budget failure | temporarily set initial error to 10kB → `npm run build` | Fails; revert |
| i18n keys | `npm run i18n:check` | No missing, mismatched or unused keys |
| i18n SSR proof | `ng build --configuration development` (the probe is excluded from production) then `npm run serve:ssr:mozakrety`; `curl -H 'Cookie: moz_lang=ar' /dev/i18n-ssr` and `moz_lang=en` | HTML contains translated text, no raw keys; no hydration errors; no refetch of the initial language file |
| Dev page | `npm start` → `/dev/foundation` | Components, 6-role switcher, ar/en switcher, "temporary / removable" marker |
| Prod exclusion | grep `dist` for the dev page marker | Not found |

Boundary proof (record output in phase summary): add one at a time — feature→feature, shared→features, core→features, public→role feature, plus `primeng` import in a feature — run `npm run lint` (must fail), remove, run again (must pass).

Manual checks: language toggle flips `dir`, text, spacing and directional icons; reload keeps language and role with no flash (disable JS-free cache, hard reload); cookies blocked → defaults; slow font → fallback readable; OS dark mode has no effect.

Requirements map: AC1 folders+READMEs; AC2 boundary proof; AC3 dev page; AC4 language switch + lint rules; AC5 role switch + contrast test; AC6 strict/lint/build/test/budgets; AC7 zoneless/signals + reported bundle size.
