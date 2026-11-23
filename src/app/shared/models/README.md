# `shared/models` — أنواع عامة فقط

هذا المجلد **ليس** مكان تجميع لأنواع المشروع. ضع هنا فقط الأنواع العامة التي لا تحمل أي معنى دومين
(مثل `Nullable<T>`، `Brand<T>`، أنواع مساعدة عامة).

- نموذج خاص بميزة واحدة (تقدّم طالب، إعدادات مدرس...) → `features/<feature>/models/`
- نموذج أو عقد API مشترك بين **دورين أو أكثر** (كورسات، امتحانات...) → `domain/<capability>/` (راجع `src/app/domain/README.md`)
- DTO ومحوّله → بجوار الـ repository المالك له (`features/<feature>/data-access/` أو `domain/<capability>/`)
- عقد بنية تحتية (`IResponse`، `AppError`، `Role`) → وحدة `core/<module>` المالكة له
- نوع خاص بمكوّنات الواجهة العامة → `shared/ui/foundation/`

التفاصيل: `docs/architecture/structure.md` (القسم 1.2 "أين توضع الأنواع").
