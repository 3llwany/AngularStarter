# طبقة `domain/` — مجالات الأعمال المشتركة بين الأدوار (Shared Capabilities)

هذا المجلد مخصص **فقط** للعقود والـ repositories والمنطق الدوميني الذي يشترك فيه **أكثر من دور**
(مثلاً الطالب `student` والمعلم `teacher` وولي الأمر `parent`)، حتى لا ننسخ نفس الكود بين الأدوار
ولا نلوّث `core/` بمنطق دومين.

> **قاعدة ذهبية:** لا تنشئ مجلداً داخل `domain/` مقدماً "تحسباً". ابدأ الكود داخل الـ `feature` التي تحتاجه أولاً،
> وانقله إلى `domain/<capability>/` فقط عندما يظهر **دور ثانٍ فعلياً** يحتاج نفس الـ endpoint أو العقد.

---

## 1. إمتى أحط الكود هنا وإمتى لأ؟ (دليل القرار السريع)

| الحالة | المكان الصحيح | السبب |
|---|---|---|
| كود يخص دوراً واحداً فقط (مثلاً إعدادات جدول المعلم، واجبات الطالب) | `features/<role>/` | لا يوجد تداخل بعد؛ إبقاءه في ميزته أبسط وأوضح. |
| نفس الـ endpoint أو الـ model محتاجه **دوران أو أكثر** (مثلاً تفاصيل الكورس `GET /courses/:id` يقرأها الطالب والمعلم وولي الأمر والصفحة العامة) | `domain/<capability>/` (مثلاً `domain/courses/`) | مصدر حقيقة واحد للـ DTO و الـ Model و الـ Repository بدون نسخ. |
| خدمة بنية تحتية لا تعرف أي دومين (`ApiClient`, `AuthService`, `LocaleService`, `SeoService`) | `core/<module>/` | بنية تحتية عامة للتطبيق كله. |
| مكوّن واجهة عام قابل لإعادة الاستخدام بدون منطق مذاكرتي (زر، جدول، حقل إدخال) | `shared/ui/` | مكتبة الواجهة العامة. |
| صفحة، شاشة، أو `@ngrx/signals` Store يدير حالة شاشة دور معين (فلاتر، اختيار، modals) | `features/<role>/` | حتى لو البيانات قادمة من `@domain/courses`، حالة الشاشة والـ UI تظل ملك الدور. |

---

## 2. إيه اللي يدخل `domain/<capability>/` وإيه اللي ممنوع؟

### ✅ مسموح داخل `domain/<capability>/`
- **الـ Models المشتركة**: مثل `course.model.ts` (`CourseSummary`, `CourseDetails`).
- **الـ DTOs والمحوّلات (Mappers)**: تحويل استجابة الباك إند إلى Model نظيف.
- **الـ Repository / API Client الخاص بالمجال**: مثل `course.repository.ts` الذي يرث من `BaseRepository` أو يحقن `ApiClient` من `@core/http`.
- **دوال منطق أعمال نقية (Pure domain helpers)**: مثل حساب نسبة إكمال الكورس أو تنسيق حالة الامتحان.
- **ملف `index.ts` (Public API)**: المدخل الوحيد الذي يُصدّر ما يُسمح للأدوار باستيراده عبر `@domain/<capability>`.

### ❌ ممنوع داخل `domain/<capability>/`
- ❌ صفحات (`pages/`) أو مسارات (`*.routes.ts`).
- ❌ مكونات واجهة مرتبطة بتصميم دور معين (مكونات العرض الخاصة بدور تبقى في `features/<role>/ui/`، والعامة في `shared/ui/`).
- ❌ Store مركزي ضخم يجمع حالة كل الأدوار معاً.
- ❌ استيراد أي ملف من `features/*` أو من مجال `domain` آخر (يمنعه Sheriff آلياً).

---

## 3. مثال عملي: كيف نستخدم `domain/courses/` عند ظهور تداخل حقيقي؟

افترض أن `student` و `teacher` و `public` كلهم يحتاجون قراءة بيانات الكورسات من نفس الـ API:

### أ. الهيكل داخل `src/app/domain/courses/`
```text
src/app/domain/courses/
├── course.model.ts        # واجهة Course و CourseSummary
├── course.dto.ts          # شكل استجابة الباك إند + دالة mapCourseDto()
├── course.repository.ts   # CourseRepository extends BaseRepository<Course>
└── index.ts               # Public API: يصدّر فقط ما تحتاجه الـ features
```

### ب. ملف `index.ts`
```ts
// src/app/domain/courses/index.ts
export type { Course, CourseSummary } from './course.model';
export { CourseRepository } from './course.repository';
// لاحظ: لم نصدّر course.dto.ts لأنه تفصيلة داخلية للـ repository فقط
```

### ج. الاستهلاك من الأدوار (بدون أي استيراد بين دور ودور)
```ts
// داخل src/app/features/student/data-access/student-courses.store.ts
import { CourseRepository, type CourseSummary } from '@domain/courses';

// داخل src/app/features/teacher/data-access/teacher-courses.store.ts
import { CourseRepository, type CourseSummary } from '@domain/courses';
```

كل دور يحتفظ بصفحاته وواجهاته وـ Store حالته داخل `features/<role>/`، مع مشاركة العقد والـ repository مرة واحدة فقط من `@domain/courses`.

---

## 4. قواعد الحماية الآلية (Sheriff + ESLint)

- الاستيراد من خارج المجال يتم **فقط** عبر `@domain/<capability>` (مثل `@domain/courses`).
- أي deep import مثل `@domain/courses/course.dto` أو مسار نسبي مثل `../../../domain/courses` يوقف `npm run lint` فوراً.
- `domain` يستطيع الاستيراد من `@core/*` و `@shared/*` فقط.
- `core` و `shared` **ممنوع** عليهما الاستيراد من `domain`.
- `features/*` (بما فيها `public`, `auth`, وكل الأدوار) مسموح لها الاستيراد من `@domain/<capability>`.
