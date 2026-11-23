# Evidence: SSR Translation Rendering & TransferState Verification (`T050`)

## Overview

Verified server-side rendering on `/dev/i18n-ssr` (`RenderMode.Server`) using the compiled Node SSR server (`dist/mozakrety/server/server.mjs`) with request cookies for both Arabic (`ar`) and English (`en`):

1. Server-rendered HTML already contains the translated strings from `public/i18n/{ar,en}.json` for both template pipe (`| translate`) and reactive signal (`toSignal(translate.stream(...))`) bindings.
2. No raw translation keys (`dev.i18n_ssr.*`) appear in the rendered DOM.
3. The root `<html>` tag reflects `lang`, `dir` (`rtl` / `ltr`), and `data-role` from the request cookies (`moz_lang`, `moz_role`).
4. `<script id="ng-state" type="application/json">` contains the serialized `TransferState` keys (`moz.i18n.ar` and `moz.i18n.en`), preventing duplicate client-side HTTP refetches during hydration.

## Captured SSR Response 1 — Arabic (`Cookie: moz_lang=ar; moz_role=student`)

```json
{
  "cookie": "moz_lang=ar; moz_role=student",
  "status": 200,
  "htmlTag": "<html lang=\"ar\" dir=\"rtl\" data-role=\"student\">",
  "title": "اختبار العرض على الخادم (SSR) للترجمة",
  "desc": "تم عرض هذا النص على الخادم باستخدام ملف تعريف الارتباط ونقله عبر TransferState دون طلب الشبكة مرة أخرى.",
  "stream": "قيمة مشتقة عبر toSignal(translate.stream(...))",
  "hasTransferStateAr": true,
  "hasTransferStateEn": false
}
```

## Captured SSR Response 2 — English (`Cookie: moz_lang=en; moz_role=teacher`)

```json
{
  "cookie": "moz_lang=en; moz_role=teacher",
  "status": 200,
  "htmlTag": "<html lang=\"en\" dir=\"ltr\" data-role=\"teacher\">",
  "title": "Server-Side Rendering (SSR) Translation Probe",
  "desc": "This text was rendered on the server using the request cookie and transferred via TransferState without browser refetching.",
  "stream": "Reactive value via toSignal(translate.stream(...))",
  "hasTransferStateAr": true,
  "hasTransferStateEn": true
}
```
