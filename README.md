# Angular Starter

قالب تجريبي عام لمشاريع Angular.

يحتفظ القالب بالبنية والأدوات القابلة لإعادة الاستخدام، ولا يحتوي على منتج أو مجال عمل مفروض. استخدمه كبداية لتطبيقات الويب التي تحتاج واجهة مشتركة، تقسيم ميزات، مصادقة اختيارية، API، ترجمة عربية/إنجليزية، أو SSR.

## المكونات والتقنيات

- Angular 22 وTypeScript strict مع standalone APIs وSignals وZoneless change detection.
- Angular SSR وHydration وHTTP Transfer Cache.
- PrimeNG 22 خلف مكتبة الواجهة المشتركة في `src/app/shared/ui/`.
- Tailwind CSS 4 وCSS design tokens مع لوحة ألوان واحدة ثابتة.
- ngx-translate للغتين العربية والإنجليزية، مع RTL/LTR.
- طبقة HTTP عامة، interceptors، repositories، وأمثلة auth providers بنمط mock أو HTTP.
- Sheriff وESLint لفرض حدود الوحدات، وGitHub Actions لبوابات الجودة.
- صفحة معرض مكونات التطوير موجودة على `/dev/foundation` في وضع التطوير فقط.

## التشغيل

```bash
npm ci
npm start
```

## الأوامر

| الأمر               | الوظيفة                                         |
| ------------------- | ----------------------------------------------- |
| `npm start`         | تشغيل خادم التطوير                              |
| `npm run build`     | بناء التطبيق وSSR                               |
| `npm run serve:ssr` | تشغيل خادم SSR بعد البناء                       |
| `npm test`          | تشغيل اختبارات Vitest                           |
| `npm run typecheck` | فحص TypeScript للتطبيق والاختبارات              |
| `npm run lint`      | ESLint وحدود Sheriff والتراجم والتصميم والتباين |
| `npm run test:ci`   | تشغيل الاختبارات دون وضع watch لـCI             |

## أين تبدأ؟

- أضف ميزات المشروع داخل `src/app/features/<feature>/`.
- ضع الخدمات المشتركة والبنية الأساسية داخل `src/app/core/`.
- ضع المكونات العامة داخل `src/app/shared/ui/`.
- راجع [دليل هيكلية التطبيق](docs/architecture/structure.md) و[معمارية HTTP](docs/http-and-api-architecture.md) قبل توسيع البنية.
- اضبط `public/config.json` لعنوان API الخاص بمشروعك، وبدّل اسم التطبيق والأيقونة والترجمة قبل النشر.

## ملاحظات قبل إعادة الاستخدام

هذا مشروع بداية وديمو، وليس منتجًا جاهزًا للنشر كما هو. راجع ترخيص المشروع المصدر وأي مكتبة منسوخة أو أصول مرفقة قبل إعادة التوزيع، واستبدل إعدادات الـAPI والهوية البصرية ومفاتيح الترجمة بما يناسب مشروعك.
