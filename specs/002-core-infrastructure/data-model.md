# نموذج البيانات: المرحلة الثانية — البنية التحتية الأساسية (`002-core-infrastructure`)

**الفرع**: `002-core-infrastructure` | **التاريخ**: 2026-11-15 | **المواصفة**: [spec.md](spec.md)

جميع الكيانات التالية هي أنواع نطاق TypeScript نقية داخل `src/app/core/**` (لن تتسرب DTOs الخاصة بالباك إند مباشرة إلى المكونات).

---

## 1. نطاق المصادقة والجلسة (`src/app/core/auth/models/`)

- **`Role`**: من `src/app/core/theme/role.ts` (`'student' | 'parent' | 'teacher' | 'school' | 'partner' | 'admin'`).
- **`PrimaryAuthRole`**: `'student' | 'parent' | 'teacher' | 'school' | 'partner'`.
- **`AuthStatus`**: `'unknown' | 'anonymous' | 'authenticated'`.
- **`AuthUser`**: `{ readonly id: string; readonly role: Role; readonly displayName: string; readonly identifier: string; readonly avatarUrl?: string }`.
- **نماذج بيانات الدخول حسب الدور**:
  - `StudentCredentials`: `{ email, password }`
  - `ParentCredentials`: `{ mobileNumber, password }`
  - `TeacherCredentials`: `{ teacherId, password }`
  - `SchoolCredentials`: `{ schoolCode, password }`
  - `PartnerCredentials`: `{ businessEmail, password }`
  - `GenericCredentialsInput` و `RoleCredentialsInput` و `AuthLoginPayload` (`role`, `identifier`, `identifierType`, `password`).
- **الأنماط المبدئية (`identifier-patterns.ts` — PROVISIONAL)**:

| الدور | الحقل | القاعدة النمطية المبدئية | مثال |
|---|---|---|---|
| `student` | `email` | صيغة البريد الإلكتروني القياسية | `student@example.com` |
| `parent` | `mobileNumber` | رقم موبايل مصري من 11 خانة يبدأ بـ `010/011/012/015` | `01012345678` |
| `teacher` | `teacherId` | أحرف وأرقام (4–20 خانة) | `TCH-1042` |
| `school` | `schoolCode` | أحرف وأرقام (4–16 خانة) | `SCH-2026` |
| `partner` | `businessEmail` | صيغة بريد إلكتروني للعمل | `ops@mallpartner.com` |

---

## 2. نماذج الأخطاء وسياسة كاش الـ SSR (`src/app/core/errors/` و `src/app/core/config/`)

- **`AppErrorCode`**: `'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'SERVER_ERROR' | 'AUTH_INVALID_IDENTIFIER' | 'AUTH_STRATEGY_NOT_FOUND' | 'UNKNOWN_ERROR'`.
- **`AppError`**: يحتوي على `code`, `status`, `translationKey`, واختيارياً `translationParams`, `details`, `notified`, `cause`, و `timestamp`.
- **سياسة كاش النقل SSR Transfer Cache**:
  - **يُخزَّن**: طلبات `GET`/`HEAD` العامة المجهولة الخالية من `withCredentials` وترويسات المصادقة ومسارات `/auth/`.
  - **يُمنع تخزينه**: الطلبات المرسلة مع `withCredentials` أو ترويسات `Authorization`/`Cookie` أو `/auth/*` أو طلبات التعديل (`POST`/`PUT`/`PATCH`/`DELETE`).

---

## 3. نماذج الـ SEO والبيانات المنظمة (`src/app/core/seo/`)

- **`PageSeoConfig`**: `title` (يُلصق معه ` | Mozakrety` ما لم يُمرر `rawTitle: true`)، `description`, `canonical`, `image`, `type`, `noindex`, `alternates` (`ar` | `en` | `x-default`), `status`.
- **أنواع JSON-LD المدعومة**: `PersonJsonLd`, `CourseJsonLd`, `VideoObjectJsonLd`, `EducationalOrganizationJsonLd`, و `BreadcrumbListJsonLd`.

---

## 4. نموذج سجل التنقل والأحداث (`src/app/core/navigation/` و `src/app/core/events/`)

- **`NavItem`**: `{ readonly id: string; readonly labelKey: string; readonly route: string | readonly string[]; readonly icon: string; readonly roles: readonly Role[]; readonly order: number; readonly group?: string }`.
- **`DomainEvent<TType, TPayload>`**: `{ readonly type: TType; readonly payload: TPayload; readonly occurredAt: number }`.
