# مكونات واجهة المستخدم المشتركة (`src/app/shared/ui`)

مكتبة واجهة مستخدم عامة ومستقلة عن نطاق العمل مبنية على **Angular 22** و **PrimeNG v22** و **Tailwind CSS v4**.

---

## متغيرات CSS المتوقعة من المشروع المستهلك

يجب أن يوفّر المشروع المستهلك متغيرات CSS التالية (تُعرَّف عادةً على `:root` أو على سمة الدور `html[data-role='...']`):

### 1. تدرج اللون الأساسي (`50`–`950`)
تستخدمها كلاسات Tailwind (`bg-primary-500` وغيرها) وتُربط تلقائياً مع `UiThemePreset` / `MozAuraPreset`:
- `--moz-primary-50` / `--primary-50`: درجة فائقة الفاتحية للخلفيات والشارات.
- `--moz-primary-100` / `--primary-100`: درجة فاتحة جداً لحالات المرور على الأسطح الفاتحة.
- `--moz-primary-200` / `--primary-200`: حدود خفيفة.
- `--moz-primary-300` / `--primary-300`: حدود زخرفية وإبراز ثانوي.
- `--moz-primary-400` / `--primary-400`: عناصر تفاعلية خفيفة.
- `--moz-primary-500` / `--primary-500`: **اللون الأساسي للعلامة التجارية**.
- `--moz-primary-600` / `--primary-600`: الأزرار والأسطح التفاعلية الأساسية المعبّأة.
- `--moz-primary-700` / `--primary-700`: حالة التحويم (`hover`) للأزرار الأساسية.
- `--moz-primary-800` / `--primary-800`: حالة الضغط (`active`).
- `--moz-primary-900` / `--primary-900`: درجة داكنة للنصوص أو التمييز القوي.
- `--moz-primary-950` / `--primary-950`: أعمق درجة لأعلى تباين.

### 2. متغيرات النص والتباين فوق اللون الأساسي
- `--primary-contrast`: لون النص/الأيقونة الآمن فوق `--primary-500` (يجب أن يضمن تباين `≥ 4.5:1` حسب WCAG AA).
- `--moz-on-primary`: لون النص المتباين فوق `--primary-600` (عادةً `#FFFFFF`).
- `--moz-on-primary-500`: اسم مستعار لـ `--primary-contrast`.
- `--primary-gradient`: التدرج اللوني الخطي لأسطح الأزرار الرئيسية.

### 3. الخطوط والسمات
- `--font-sans`: الخط الأساسي لوسم `body` وحقول الإدخال (ترث PrimeNG الخط من `body`).

---

## إعداد الأنماط العام (Global Styles Setup)

في ملف `src/styles.css` الرئيسي للمشروع:

```css
@layer theme, base, tailwind-base, primeng, components, utilities, tailwind-utilities;

@import 'tailwindcss';
@import 'tailwindcss-primeui';
@import 'primeicons/primeicons.css';
@import './styles/fonts.css';
@import './styles/roles.css';
@import './styles/theme.css';
@import './styles/ui-library.css';

@custom-variant dark (&:where(.app-dark, .app-dark *));
```

وفي `appConfig` / `providePrimeNG`:
```ts
providePrimeNG({
  theme: {
    preset: UiThemePreset,
    options: {
      darkModeSelector: '.app-dark',
      cssLayer: {
        name: 'primeng',
        order: 'theme, base, tailwind-base, primeng, components, utilities, tailwind-utilities',
      },
    },
  },
})
```
