# مكونات واجهة المستخدم المشتركة (`src/app/shared/ui`)

مكتبة واجهة مستخدم عامة ومستقلة عن نطاق العمل مبنية على **Angular 22** و **PrimeNG v22** و **Tailwind CSS v4**.

يستورد معرض التطوير المكونات من `@shared/ui`. يستخدم App Shell المدخلين العامين `@shared/ui/shell` و`@shared/ui/toast` لتحميل مكونات الغلاف فقط في المسار الأولي.

---

## متغيرات CSS المتوقعة من المشروع المستهلك

يجب أن يوفّر المشروع المستهلك متغيرات CSS التالية على `:root` ضمن لوحة ألوان واحدة:

### 1. تدرج اللون الأساسي (`50`–`950`)
تستخدمها كلاسات Tailwind (`bg-primary-500` وغيرها) وتُربط تلقائياً مع `UiThemePreset` / `AppAuraPreset`:
- `--app-primary-50` / `--primary-50`: درجة فائقة الفاتحية للخلفيات والشارات.
- `--app-primary-100` / `--primary-100`: درجة فاتحة جداً لحالات المرور على الأسطح الفاتحة.
- `--app-primary-200` / `--primary-200`: حدود خفيفة.
- `--app-primary-300` / `--primary-300`: حدود زخرفية وإبراز ثانوي.
- `--app-primary-400` / `--primary-400`: عناصر تفاعلية خفيفة.
- `--app-primary-500` / `--primary-500`: **اللون الأساسي للعلامة التجارية**.
- `--app-primary-600` / `--primary-600`: الأزرار والأسطح التفاعلية الأساسية المعبّأة.
- `--app-primary-700` / `--primary-700`: حالة التحويم (`hover`) للأزرار الأساسية.
- `--app-primary-800` / `--primary-800`: حالة الضغط (`active`).
- `--app-primary-900` / `--primary-900`: درجة داكنة للنصوص أو التمييز القوي.
- `--app-primary-950` / `--primary-950`: أعمق درجة لأعلى تباين.

### 2. متغيرات النص والتباين فوق اللون الأساسي
- `--primary-contrast`: لون النص/الأيقونة الآمن فوق `--primary-500` (يجب أن يضمن تباين `≥ 4.5:1` حسب WCAG AA).
- `--app-on-primary`: لون النص المتباين فوق `--primary-600` (عادةً `#FFFFFF`).
- `--app-on-primary-500`: اسم مستعار لـ `--primary-contrast`.
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
@import './styles/palette.css';
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
