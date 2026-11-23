# قرار معماري ADR-0005: أسلوب جلسة المصادقة واستراتيجية الاستعادة المشروطة

- **الحالة**: مقبول (Accepted) — مُحدّث بعد تبسيط هيكل `core/auth/`
- **التاريخ**: 2026-11-16
- **السياق**: يعمل مذاكرتي بتقنية Angular 22 SSR بدون `zone.js` وبافتراض جلسات كوكيز آمنة من النوع `HttpOnly` (`withCredentials: true`). يُحظر تماماً تخزين التوكنات في `localStorage` أو `sessionStorage` لأسباب أمنية. في بيئة الـ SSR، أي تخزين لحالة الجلسة على مستوى الـ Module (خارج الـ DI) يسرّب بيانات مستخدم لمستخدم آخر في الطلبات المتزامنة، كما أن إرسال طلب `auth/me` في كل صفحة عامة يبطئ سرعة العرض الأول (LCP) وزواحف محركات البحث.

## القرار

1. **عزل آلية النقل خلف `AuthApi`**:
   - يمتلك `AuthService` (`src/app/core/auth/auth.service.ts`) إشارات (`Signals`) خاصة بكل نسخة DI (`user`, `role`, `status`, `isAuthenticated`) دون أي متغيرات عامة خارج الكلاس ودون المساس بـ `localStorage` أو `sessionStorage`.
   - يعرّف `AuthApi` (`src/app/core/auth/auth-api.ts`) العقد البرمجي للاتصال بالخادم (`MockAuthApi` في `mock-auth-api.ts` خلال التطوير و `HttpAuthApi` عند ربط الباك إند).
   - يدير `AuthService` كوكي التلميح غير الحساس (`SESSION_HINT_COOKIE = 'moz_session_hint'`) بحيث لو تغيّر نظام الجلسات مستقبلاً ينحصر التعديل في `auth.service.ts` و `providers/auth.providers.ts` و `HttpAuthApi` و `credentialsInterceptor`.

2. **الاستعادة المشروطة في المتصفح فقط (Conditional Browser-Only Restore)**:
   - أثناء **SSR** (`!isPlatformBrowser`): يحوّل مهيئ البدء (`provideMozAuth()` في `src/app/core/providers/auth.providers.ts`) الحالة فوراً إلى `'anonymous'` عبر `auth.markAnonymous()` بدون أي طلبات شبكية لمنع تسرب الجلسات أو تأخير صفحات الزوار.
   - في **المتصفح**: لا تستدعي البداية `auth.restoreSession()` إلا إذا وُجد كوكي التلميح `moz_session_hint=1` أو كان المسار الابتدائي يقع تحت `/auth/**` أو أحد مسارات الأدوار (`student`, `parent`, ...).
   - أثناء التنقل الداخلي، يستدعي حراس المسارات في `src/app/core/guards/auth.guards.ts` (`roleGuard`, `roleRedirectGuard`, `guestGuard`) الدالة `auth.ensureSessionResolved()` التي تدمج أي استدعاءات متزامنة لـ `restoreSession()` في وعد واحد (`Promise`) قبل حسم السماح أو التحويل.

## البدائل المدروسة

- **طلب `auth/me` إجبارياً في كل تحميل للتطبيق**: تم رفضه لأنه يبطئ الصفحات العامة ويسبب طلبات `401` غير ضرورية لمحركات البحث والزوار.
- **تمرير كوكيز الجلسة لرسم صفحات الأدوار في الـ SSR**: تم تجنّبه في المرحلة الثانية وضبط جميع مسارات الأدوار بـ `RenderMode.Client` لتفادي أي خطر لتخزين بيانات خاصة في كاش SSR.

## النتائج والتبعات

- الصفحات العامة تفتح فوراً في المتصفح وSSR دون انتظار فحص الجلسة.
- الانتقال من جلسات `HttpOnly Cookie` إلى أي مخطط توثيق آخر معزول في ملفات محدودة ومعروفة.
