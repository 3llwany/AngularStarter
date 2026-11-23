# هيكلية تطبيق مذاكرتي وحدود الوحدات البرمجية (Structure & Boundaries)

مذاكرتي هو تطبيق Angular موحّد (بدون Nx) منظم حول حدود معمارية صارمة يفرضها **Sheriff** (`sheriff.config.ts`) و **ESLint** (`eslint.config.js`).

## الهيكل العلوي للمشروع (`src/app/`)

```text
src/app/
├── core/                  # الخدمات المفردة والبنية التحتية الأساسية للتطبيق:
│   ├── assets/            # ثوابت مسارات الأصول الثابتة (APP_ASSETS)
│   ├── auth/              # المصادقة، جدول طرق الدخول (login-methods.ts)، وإدارة الجلسة
│   ├── config/            # إعدادات الإطار العام، PrimeNG، و runtime config.json
│   ├── data-access/       # كلاس BaseRepository
│   ├── errors/            # نموذج ومحوّل AppError (app-error.ts) ومعالج الأخطاء العام (global-error-handler.ts)
│   ├── file/              # خدمة التعامل مع الملفات (FileService)
│   ├── guards/            # حراس المسارات (roleGuard, roleRedirectGuard, guestGuard في auth.guards.ts)
│   ├── http/              # ApiClient وسياق الطلبات (HttpContext)
│   ├── i18n/              # إعداد ngx-translate و LocaleService ودعم SSR
│   ├── interceptors/      # معترضات الشبكة (apiBaseUrl, commonParams, credentials, localeHeader, errorMapping، و loading الاختياري)
│   ├── layout/            # LayoutService وتبديل Navbar/Sidebar حسب الدور
│   ├── loading/           # خدمة حالة التحميل المبنية على Signals
│   ├── navigation/        # خدمة قائمة التنقل من الباك إند (NavService)
│   ├── platform/          # مغلفات SSR-safe مثل CookieService
│   ├── providers/         # جميع مزوّدات بدء التشغيل مجمّعة في provideCore(routes)
│   ├── routes/            # ثوابت المسارات الآمنة للأنواع (APP_ROUTES و buildAppRoute)
│   ├── seo/               # خدمة SeoService ودعم JSON-LD وكود الحالة في SSR
│   └── theme/             # ThemeService ولوحات ألوان الأدوار الستة
├── layout/                # غلاف التطبيق التكيفي (AppShellComponent) الرابط بين core و shared/ui
├── shared/                # مكتبة المكونات والأدوات المشتركة (shared/ui/*)
├── domain/                # مجالات الأعمال المشتركة بين أكثر من دور (تُضاف عند التداخل الفعلي فقط — راجع src/app/domain/README.md)
├── features/
│   ├── public/            # صفحات العرض العام و SSR و SEO وصفحة 404 (not-found.page.ts)
│   ├── auth/              # شاشات تسجيل الدخول والتسجيل واستعادة الحساب
│   ├── student/           # مساحة الطالب
│   ├── parent/            # مساحة ولي الأمر
│   ├── teacher/           # مساحة المعلم
│   ├── school/            # مساحة المدرسة
│   ├── partner/           # مساحة شريك المتجر
│   └── admin/             # مساحة مدير النظام
└── dev/                   # صفحات تحقق مؤقتة للتطوير فقط (مستبعدة من بناء الإنتاج)
```

## الهيكل الداخلي لكل ميزة (`features/<area>/`)

كل مجلد تحت `src/app/features/<area>/` ينقسم إلى أربع طبقات واضحة:

1. **`pages/`** — الحاويات الذكية المرتبطة بالمسارات (Routed pages). تدير تدفق الصفحة عبر متاجر/واجهات `data-access/` ولا تستدعي `HttpClient` مباشرة أبداً.
2. **`ui/`** — مكونات عرض خالصة خاصة بالميزة تعتمد على `input()` و `output()` و `model()`.
3. **`data-access/`** — متاجر `@ngrx/signals` ومجردات المستودعات (abstract repository DI tokens) وتطبيقات HTTP الخاصة بها، ومحوّلات الـ DTO إلى نماذج النطاق.
4. **`models/`** — أنواع ونماذج النطاق الخاصة بالميزة (لا تتسرب DTOs الخاصة بالباك إند مباشرة إلى القوالب).

## مصفوفة الاعتماديات المسموحة (Dependency Matrix)

| الطبقة / المسار المصدر | الاستيراد من `core` | الاستيراد من `shared` | الاستيراد من `domain` | الاستيراد داخل نفس الميزة | الاستيراد من ميزة أخرى | استيراد `primeng/*` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `core` | نعم | **لا** | **لا** | غير منطبق | **لا** | فقط في `core/theme` و `core/config` |
| `shared` | **لا** | نعم | **لا** | غير منطبق | **لا** | فقط في `shared/ui` |
| `domain/<capability>` | نعم | نعم | **لا** (نفس المجال فقط) | غير منطبق | **لا** | **لا** |
| `features/public` | نعم | نعم | نعم | نعم | **لا** (ممنوع تماماً استيراد مساحات الأدوار) | **لا** |
| `features/auth` | نعم | نعم | نعم | نعم | **لا** | **لا** |
| `features/<role>` | نعم | نعم | نعم | نعم | **لا** | **لا** |

---

## دليل الفريق للتعامل مع حدود الوحدات (Sheriff Guide)

يفرض ملف `sheriff.config.ts` هذه الحدود آلياً عند تشغيل `npm run lint` أو داخل الـ IDE عبر `@softarc/eslint-plugin-sheriff`. الهدف من ذلك هو منع تشابك الميزات مع بعضها والحفاظ على قابلية الصيانة والعزل.

### 1. ملخص القواعد: مين يقدر يستورد من مين؟

- **`root` (`main.ts`، `app.config.ts`، `app.routes.ts`، `dev/*`)**: نقطة التجميع الوحيدة في التطبيق؛ مسموح لها استيراد كل الطبقات (`core` و `shared` و `features/*`).
- **`type:core` (`src/app/core/**`)**: يستورد من `core` فقط. **ممنوع** استيراد أي ملف من `shared` أو `features/*`.
- **`type:shared` (`src/app/shared/**` و `src/app/shared/ui/**`)**: يستورد من `shared` فقط. **ممنوع** استيراد `core` (مثل `AuthService` أو `ApiClient`) أو `features/*`.
- **`feature:public` / `feature:auth` / `feature:<role>`**: كل ميزة تستورد من **نفسها فقط** (`sameTag`) بالإضافة إلى `core` و `shared`. **ممنوع تماماً** أن تستورد ميزة ملفاً من ميزة أخرى (مثلاً: `student` لا يستورد من `teacher`، و`public` لا يستورد من أي دور).
- **`noTag`**: أي مجلد تحت `src/` لا يطابق قاعدة في `modules`؛ يرى فقط `noTag` و`core` و`shared`.

### 1.1 مسارات الاستيراد العامة (Public API) ومنع الـ Deep Imports

كل وحدة لها **مدخل عام واحد** (`index.ts`)، والاستيراد من خارجها يتم عبر الـ path aliases المعرّفة في `tsconfig.json`:

| الوحدة | مسار الاستيراد المسموح | ممنوع |
|---|---|---|
| أي مجلد داخل `core` (`auth`, `http`, `data-access`, `theme`, `i18n`, ...) | `@core/<module>` مثل `@core/http` | `@core/http/api-client` أو `../../../core/http/api-client` |
| مكتبة الواجهات `shared/ui` | `@shared/ui` | `@shared/ui/button/button` أو `../shared/ui/navbar/navbar` |
| أي مجال مشترك داخل `domain` (`courses`, `exams`, ...) | `@domain/<capability>` مثل `@domain/courses` | `@domain/courses/course.dto` أو `../../../domain/courses` |

- **Sheriff** (`enableBarrelLess` + وجود `index.ts`) يعتبر أي استيراد لملف داخلي في وحدة لها `index.ts` **Encapsulation Violation** ويوقف `npm run lint`.
- **ESLint** (`no-restricted-imports`) يمنع المسارات النسبية الداخلة إلى `core` أو `shared` أو `domain` ويطلب استخدام `@core/*` و `@shared/*` و `@domain/*`.
- داخل نفس الوحدة استخدم المسارات النسبية العادية (`./locale`)، وبين الوحدات استخدم الـ aliases العامة.
- **إضافة ملف جديد في `core/<module>` أو `domain/<capability>`**: لو المطلوب استخدامه من خارج الوحدة، أضف `export * from './file';` في `index.ts`. لو داخلي فقط، لا تصدّره.
- **إضافة وحدة جديدة في `core` أو `domain`**: أنشئ المجلد مع `index.ts`؛ الأنماط في `sheriff.config.ts` تلتقطها تلقائياً.

### 1.2 أين توضع الأنواع (Types & Models)؟

القاعدة: **النوع يعيش بجوار من يملكه**، و`shared` ليست مكان تجميع.

| نوع النوع | مكانه |
|---|---|
| نموذج نطاق خاص بميزة واحدة (`StudentProgress`, `TeacherSettings`) | `features/<feature>/models/` |
| نموذج نطاق أو عقد API مشترك بين **دورين أو أكثر** (`Course`, `ExamSummary`) | `domain/<capability>/` (راجع `src/app/domain/README.md`) |
| DTO قادم من الباك إند ومحوّله | بجوار الـ repository المالك له (`features/<feature>/data-access/` أو `domain/<capability>/`) ولا يتسرب للقوالب |
| Props/حالة خاصة بمكوّن عرض واحد | داخل ملف المكوّن نفسه في `features/<feature>/ui/` |
| عقود البنية التحتية (`IResponse`, `AppError`, `AuthUser`, `Role`) | داخل وحدة `core/<module>` المالكة لها وتُصدَّر من `index.ts` |
| أنواع عامة لمكونات الواجهة (`UiNavItem`, `FieldError`) | `shared/ui/foundation/` |
| نوع عام فعلاً بلا أي معنى دومين (مثل `Nullable<T>`, `Brand<T>`) | `shared/models/` |

- **ممنوع** وضع أي نوع فيه معنى دومين خاص بمذاكرتي (طالب، مدرس، محفظة، كورس...) في `shared/models`.
- لو نوع أو repository احتاجته ميزتان أو أكثر فعلياً: انقله إلى `domain/<capability>/` مع `index.ts` وصدّره عبر `@domain/<capability>` (لا تنسخه ولا تضعه في `core`).
- لا تنشئ ملف `models.ts` أو `types.ts` عام يجمع كل شيء؛ ملف لكل مفهوم (`course.model.ts`).

---

### 2. أمثلة عملية بالكود (✅ مسموح مقابل ❌ ممنوع)

#### مثال 1: داخل ميزة (`src/app/features/student/...`)

```ts
// ✅ مسموح: الاستيراد من core، من shared، أو من نفس الميزة (student)
import { AuthService } from '@core/auth';
import { AppButton } from '@shared/ui';
import { StudentCourseCardComponent } from '../ui/student-course-card.component';

// ❌ ممنوع ويوقف الـ lint: الاستيراد من ميزة أخرى (teacher أو auth)
import { TeacherCourseService } from '../../teacher/data-access/teacher-course.service';

// ❌ ممنوع ويوقف الـ lint: deep import أو مسار نسبي داخل core/shared
import { AuthService } from '@core/auth/auth.service';
import { AppButton } from '../../../shared/ui/button/button';
```

#### مثال 2: داخل مكتبة المكونات المشتركة (`src/app/shared/ui/...`)

```ts
// ✅ مسموح: الاستيراد من أدوات وأساسيات shared فقط
import { createUniqueId } from '../foundation/utils';

// ❌ ممنوع ويوقف الـ lint: استيراد خدمات النواة أو النماذج الخاصة بالمشروع داخل shared
import { AuthService } from '@core/auth';
```

#### مثال 3: داخل النواة (`src/app/core/...`)

```ts
// ✅ مسموح: الاستيراد بين وحدات core عبر الـ Public API
import { AppError } from '@core/errors';

// ❌ ممنوع ويوقف الـ lint: استيراد مكوّن أو خدمة عرض من shared داخل core
import { ToastService } from '@shared/ui';
```

> **ملاحظة إضافية (ESLint بجانب Sheriff)**: استيراد `primeng/*` و `@primeuix/*` مسموح فقط داخل `src/app/shared/ui/**` و `src/app/core/{theme,config}/**`؛ فلا تستورد عناصر PrimeNG مباشرة في `features/*`.

---

### 3. لو احتجت حاجة من طبقة ممنوع الاستيراد منها، أحلها إزاي؟

لا تتحايل على قواعد Sheriff ولا تعطل قاعدة ESLint. استخدم أحد الحلول الثلاثة المعتمدة:

#### الحل الأول: انقل الكود المشترك إلى `shared` أو `core`
- **مكوّن UI متكرر بين `student` و `teacher`** (مثلاً كارت تقييم عام أو مكوّن عرض فيديو): انقله إلى `src/app/shared/ui/<component>/` واجعله عاماً بدون منطق أدوار أو أسماء مسارات خاصة بالميزة.
- **خدمة أو نوع بيانات مشترك بين أكثر من ميزة** (مثلاً `CourseSummary` أو خدمة تنبيهات/ملفات): انقله إلى `src/app/core/`.

#### الحل الثاني: عكس الاعتمادية عبر `InjectionToken` (عندما يحتاج `core` خدمة في `shared`)
إذا كانت خدمة في `core` تحتاج تنبيه واجهة المستخدم في `shared` (كما في التوست داخل `GlobalErrorHandler` و `errorMappingInterceptor`):
1. عرّف `InjectionToken` بالواجهة المطلوبة فقط داخل `src/app/core/errors/global-error-handler.ts` واحقنه بـ `{ optional: true }`:
   ```ts
   // داخل core
   export const TOAST_HANDLER = new InjectionToken<ToastNotifier>('TOAST_HANDLER');
   private readonly toast = inject(TOAST_HANDLER, { optional: true });
   ```
2. اربطه بالتطبيق الفعلي داخل `src/app/app.config.ts` (لأن `app.config.ts` يتبع `root` المسموح له باستيراد `core` و `shared` معاً):
   ```ts
   // داخل src/app/app.config.ts (طبقة root)
   { provide: TOAST_HANDLER, useExisting: ToastService }
   ```

#### الحل الثالث: التنقل بين الميزات عبر المسارات النصية (Routes)
إذا احتاجت صفحة في `public` أو `student` تحويل المستخدم إلى صفحة في `auth` (مثل تسجيل الدخول):
- **❌ لا تستورد** `LoginPageComponent` أو أي ملف من `features/auth/`.
- **✅ استخدم** المسار النصي في `Router` أو القالب:
  ```ts
  this.router.navigate(['/auth/login']);
  // أو في القالب:
  // <a routerLink="/auth/login">...</a>
  ```

---

### 4. كيف تعدّل `sheriff.config.ts` عند الحاجة؟

- **إضافة مساحة دور جديدة** (مثلاً `supervisor` تحت `src/app/features/supervisor/`):
  **لا تحتاج لأي تعديل في `sheriff.config.ts`**! النمط `'src/app/features/<role>'` يلتقطها تلقائياً ويعطيها `['type:role-feature', 'feature:supervisor']`.
- **إضافة مكوّن جديد داخل `shared/ui/`**:
  **لا تحتاج لأي تعديل في Sheriff**؛ فقط صدّره من `src/app/shared/ui/index.ts` ليصبح متاحاً عبر `@shared/ui`.
- **إضافة ميزة عامة جديدة ليست دوراً** (أو مجلد قطاع مستقل خارج `features/`):
  إذا أنشأت مثلاً ميزة مستقلة باسم `src/app/features/courses` لها تعامل خاص مختلف عن `<role>`، يمكنك تعريفها هكذا في `sheriff.config.ts`:
  ```ts
  modules: {
    // ...
    'src/app/features/courses': 'feature:courses', // توضع قبل النمط العام <role> لو كانت تحت features/
  },
  depRules: {
    // ...
    // السماح لـ courses باستيراد core و shared ونفسها، مع بقاء عزلها عن باقي الميزات
    'feature:courses': [sameTag, 'type:core', 'type:shared'],
  }
  ```
  > تذكّر: كل قاعدة تُضاف في `modules` بوسم جديد لا بد أن يكون لها إدخال مقابل في `depRules` (أو يغطيها نمط مثل `'feature:*'`). وبعد أي تعديل شغّل `npm run lint` للتأكد من صحة الإعدادات على كل المشروع.
