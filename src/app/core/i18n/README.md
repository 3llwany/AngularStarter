# `src/app/core/i18n` — التدويل والاتجاهين (ngx-translate v18)

يدعم تطبيق مذاكرتي اللغة **العربية (`ar`، اتجاه `rtl` افتراضياً)** و**الإنجليزية (`en`، اتجاه `ltr`)** باستخدام `@ngx-translate/core` v18.

## قواعد تسمية مفاتيح الترجمة

- **الهيكلية**: كائنات JSON متداخلة داخل `public/i18n/ar.json` و `public/i18n/en.json`.
- **صيغة الكتابة**: `lower_snake_case` مفصولة بنقاط مثل `common.actions.save` و `auth.errors.invalid_credentials` و `errors.http.network`.
- **البادئات**: يجب أن يبدأ كل مفتاح بـ `common.` أو باسم النطاق المالك له (`public.`, `auth.`, `errors.`, `student.`, `parent.`, `teacher.`, `school.`, `partner.`, `admin.`, `dev.`).
- **نصوص حرفية فقط**: استخدم مفاتيح نصية ثابتة (Literals) داخل `translate` pipe أو `translate.stream('...')` أو خصائص مثل `labelKey`/`errorKey` حتى يتمكّن فحص `npm run i18n:check` (`tools/i18n-check.mjs`) من التحقق من تطابقها وعدم وجود مفاتيح مهجورة.

## الاستخدام في القوالب و TypeScript

- **القوالب (HTML)**: استخدم `TranslatePipe` (`{{ 'common.actions.save' | translate }}`).
- **ملفات TypeScript**: استخدم الـ Signals التفاعلية عبر `toSignal(this.translate.stream('common.actions.save'), { initialValue: '' })`.
- **ممنوع**: يُحظر استدعاء `translate.instant(...)` عبر ESLint (`mozakrety/no-translate-instant`) خارج ملفات الاختبار `*.spec.ts`.

## الـ SSR ونقل الحالة (`SSRTranslateLoader`)

- أثناء التصيير على الخادم (SSR)، يقرأ `SERVER_TRANSLATION_READER` (المُسجّل في `app.config.server.ts`) ملف `public/i18n/{lang}.json` من نظام ملفات الخادم ويخزّنه داخل `TransferState` (`moz.i18n.{lang}`).
- ينتظر `provideAppInitializer` اكتمال `LocaleService.init()` حتى تخرج استجابة HTML من الخادم مترجمة بالكامل (وليس كمفاتيح خام).
- عند تفعيل التطبيق في المتصفح (Hydration)، يقرأ `SSRTranslateLoader` القاموس فوراً من `TransferState` دون إرسال طلب شبكة مكرر.

## استراتيجية صيغ الجمع العربية (Pluralization)

تمتلك اللغة العربية ست فئات للجمع حسب معيار CLDR (`zero`, `one`, `two`, `few`, `many`, `other`). وكما هو موثق في `docs/adr/0004-ngx-translate-for-i18n.md`، عند الحاجة لاحقاً لنصوص تعتمد على الأعداد في ميزات المستقبل، سيتم توفير دالة مساعدة مبنية على `Intl.PluralRules('ar')` لاختيار المفتاح الفرعي المناسب أو تقييم مترجم ICU متوافق مع v18.

## تقسيم ملفات الترجمة مستقبلاً لكل ميزة

عند توسّع الميزات، يمكن وضع ملفات JSON منفصلة لكل ميزة داخل `public/i18n/<feature>/{ar,en}.json` ودمجها عبر `translate.setTranslation(lang, data, true)` في مزوّدات المسار الكسول.
