# مذاكرتي (Mozakrety)

منصة التعلّم الاجتماعي المتمحورة حول الطالب — مبنية بـ **Angular 22** (بدون `zone.js`، بنظام الـ Signals)، مع دعم كامل لـ **SSR (Server-Side Rendering)**، واللغة العربية كاتجاه افتراضي (`RTL`) مع الإنجليزية (`LTR`)، وتصميم موحّد يعتمد على مكونات `src/app/shared/ui/` مع تغيير الألوان ديناميكياً حسب دور المستخدم.

---

## الأوامر الأساسية للتشغيل والتطوير

| الأمر | الوظيفة |
|---|---|
| `npm start` (`ng serve`) | تشغيل خادم التطوير المحلي على `http://localhost:4200/` مع إعادة التحميل التلقائي |
| `npm run build` | بناء التطبيق للإنتاج (متصفح + خادم SSR) وحفظ المخرجات في `dist/mozakrety` |
| `npm run serve:ssr:mozakrety` | تشغيل خادم Node Express للـ SSR بعد البناء (`node dist/mozakrety/server/server.mjs`) |
| `npm test` | تشغيل جميع اختبارات الوحدة عبر **Vitest** |
| `npm run typecheck` | فحص الأنواع الصارم لملفات التطبيق والاختبارات (`tsconfig.app.json` و `tsconfig.spec.json`) |
| `npm run lint` | تشغيل قواعد **ESLint** وحدود **Sheriff** المعمارية وفحص مفاتيح الترجمة (`npm run i18n:check`) |
| `npm run i18n:check` | التحقق من تطابق مفاتيح الترجمة بين `ar.json` و `en.json` وعدم وجود مفاتيح غير مستخدمة |

---

## البنية العامة للمجلدات

- `src/app/core/`: الخدمات المركزية والأساسية (المصادقة `auth`، حماية المسارات، الـ `http` والـ Interceptors، الأخطاء والتنبيهات `errors`، الـ SEO و SSR `seo`، سجل التنقل `navigation`، ناقل الأحداث `events`، السمات `theme`، الترجمة `i18n`، إعدادات التشغيل `config`، والملفات والتحميل).
- `src/app/shared/`: مكتبة المكونات والأدوات المشتركة القابلة لإعادة الاستخدام (`src/app/shared/ui/`).
- `src/app/features/`: وحدات الميزات المعزولة لكل نطاق (`public`, `auth`, `student`, `parent`, `teacher`, `school`, `partner`, `admin`)، بحيث لا يستورد أي Feature من Feature آخر.
- `src/app/dev/`: صفحات معاينة وتحقق خاصة بالتطوير فقط، تُستبعد تلقائياً أثناء بناء الإنتاج.
- `docs/`: وثائق المعمارية وسجلات القرارات المعمارية (`docs/adr/`) وسجل مساهمات مكتبة الواجهة (`docs/ui-library-contributions.md`).
- `specs/`: مواصفات وخطط ومهام المراحل (`speckit`).

---

## بوابات الجودة (Quality Gates)

قبل اعتماد أي مهمة برمجية، يجب أن تنجح البوابات الأربع التالية دون أخطاء:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

للمزيد من التفاصيل حول المعمارية راجع [دليل هيكلية التطبيق](file:///w:/Mashura/Front-End/mozakrety/docs/architecture/structure.md) و [معمارية HTTP](file:///w:/Mashura/Front-End/mozakrety/docs/http-and-api-architecture.md).
