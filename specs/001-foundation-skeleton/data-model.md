# Data Model: Phase 1 — Foundation Skeleton

No backend data. Client-side values only.

## Role
`'student' | 'parent' | 'teacher' | 'school' | 'partner' | 'admin'`

## RolePalette
| Field | Notes |
|-------|-------|
| role | Role |
| base | student #2E7DFF, parent #10B981, teacher #8B5CF6, school #EF4444, partner #F59E0B, admin neutral slate (+ indigo accent) |
| scale | 50…950 CSS variables `--moz-primary-*` |
| onPrimary | `--moz-on-primary`; AA contrast with the shade used for filled controls |

Rule: base colors with white text fail AA at shade 500 (student 3.82, parent 2.54, teacher 4.23, school 3.76, partner 2.15), so filled surfaces use a darker shade or dark text; a contrast test enforces ≥ 4.5 for text and ≥ 3 for UI boundaries.

## ThemePreference — cookie `moz_role`
Value: Role. Invalid/missing → `student`. Written on `setRole`; read by the pre-paint script, the browser service and the SSR server.

## LocalePreference — cookie `moz_lang`
Value: `'ar' | 'en'`; `dir` derived (`ar`→`rtl`, `en`→`ltr`), never stored. Invalid/missing → detected from `Accept-Language`/`navigator.languages`, fallback `ar`.

Cookie attributes: `Path=/; Max-Age=31536000; SameSite=Lax` (+ `Secure` in production). No personal data.

## Transitions
- `setRole(r)`: validate → signal → `<html data-role>` → cookie (best effort).
- `setLang(l)`: validate → TranslateService active lang → `<html lang dir>` → cookie (best effort).
- Cookies blocked: in-session value only; no error shown.
