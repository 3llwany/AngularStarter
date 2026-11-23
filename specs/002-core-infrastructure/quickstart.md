# دليل التحقق السريع: المرحلة الثانية — البنية التحتية الأساسية (`002-core-infrastructure`)

**الفرع**: `002-core-infrastructure` | **التاريخ**: 2026-11-16 (مُحدّث بعد تبسيط هيكل `core/`) | **المواصفة**: [spec.md](spec.md)

أوامر وخطوات التحقق التي تثبت استيفاء متطلبات المرحلة الثانية.

---

## 1. بوابات الجودة المؤتمتة (Automated Quality Gates)

| البوابة | الأمر | النتيجة المطلوبة |
|---|---|---|
| فحص الأنواع الصارم | `npm run typecheck` | صفر أخطاء في `tsconfig.app.json` و `tsconfig.spec.json` |
| الفحص، Sheriff والترجمة | `npm run lint` | صفر أخطاء Lint، صفر مخالفات Sheriff، صفر استيراد مباشر لـ PrimeNG خارج `shared/ui` و `core/{theme,config}`، وتطابق مفاتيح `ar.json` و `en.json` |
| اختبارات الوحدة | `npm test` | نجاح جميع الاختبارات عبر Vitest |
| بناء الإنتاج والـ SSR | `npm run build` | نجاح توليد حزم المتصفح وخادم SSR ضمن حدود الحجم المعتمدة |

---

## 2. خريطة الاختبارات حسب الوحدة

| المخرج | ملف الاختبار |
|---|---|
| `LOGIN_METHODS` + `AuthService` + الحراس (`roleGuard`, `roleRedirectGuard`, `guestGuard`) | `src/app/core/auth/auth.spec.ts` |
| الـ Interceptors (`credentials`, `localeHeader`, `errorMapping`) + `AppError` | `src/app/core/interceptors/credentials.interceptor.spec.ts`, `locale-header.interceptor.spec.ts`, `error-mapping.interceptor.spec.ts`, `src/app/core/errors/app-error.spec.ts` |
| `GlobalErrorHandler` + `TOAST_HANDLER` | `src/app/core/errors/global-error-handler.spec.ts` |
| `NotFoundPageComponent` (`404` + `noindex`) | `src/app/features/public/pages/not-found.page.spec.ts` |
| `SeoService` (`JSON-LD`, `canonical`, `hreflang`, `RESPONSE_INIT`) | `src/app/core/seo/seo.service.spec.ts` |
| `NavService` (`httpResource` على `auth/menu`) | `src/app/core/navigation/nav.service.spec.ts` |

---

## 3. التحقق المباشر من استجابة SSR `404` ووسوم الرأس

بعد تشغيل `npm run build`:

1. شغّل خادم الـ SSR:
   ```powershell
   npm run serve:ssr:mozakrety
   ```
2. افحص كود الحالة ووسوم الرأس لمسار غير موجود:
   ```powershell
   curl -i http://localhost:4000/this-route-does-not-exist
   ```
   **المتوقع**:
   - كود الاستجابة: `HTTP/1.1 404 Not Found`
   - وجود `<meta name="robots" content="noindex, nofollow">` وعنوان 404 المترجم.
3. افحص `http://localhost:4000/robots.txt`:
   - يرجع `200 OK` متضمناً `Disallow` لمسارات الأدوار و `/auth/` و `/dashboard` و `/dev/`.
