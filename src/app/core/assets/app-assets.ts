/**
 * سجل ثوابت الأصول الثابتة للتطبيق (صور، شعارات، أيقونات SVG) بصيغة `as const`
 * لدعم الـ Tree-shaking والـ Autocomplete والتوافق المباشر مع `NgOptimizedImage` (`ngSrc`).
 *
 * ملاحظة: لا تستخدم `class` بخصائص `static` أو `any` هنا؛ الصيغة الثابتة أسرع وأنظف.
 */
export const APP_ASSETS = {
  logos: {
    brand: 'assets/images/logos/starter-logo.svg',
  },
} as const;

type DeepAssetValues<T> = T extends string
  ? T
  : { [K in keyof T]: DeepAssetValues<T[K]> }[keyof T];

/** نوع اتحادي صارم لجميع مسارات الأصول المعرّفة داخل `APP_ASSETS`. */
export type AppAssetPath = DeepAssetValues<typeof APP_ASSETS>;
