import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

/**
 * إعدادات Sheriff لفرض حدود الوحدات البرمجية (Module Boundaries) ومنع الاستيراد العشوائي بين الطبقات.
 * أي مخالفة لهذه القواعد توقف `npm run lint` فوراً عبر `@softarc/eslint-plugin-sheriff`.
 *
 * راجع دليل الفريق الكامل والأمثلة في: `docs/architecture/structure.md`.
 */
export const config: SheriffConfig = {
  version: 1,

  // تفعيل الوحدات بدون الحاجة لملف index.ts في كل مجلد (كل مسار مطابق هنا يصبح وحدة معزولة)
  enableBarrelLess: true,

  // تعريف الوحدات والوسوم (Tags) الخاصة بها
  modules: {
    // كل مجلد داخل core وحدة مستقلة لها index.ts (Public API). الاستيراد يتم عبر '@core/<module>' فقط،
    // وأي deep import (مثل '@core/http/api-client') يعتبر Encapsulation Violation ويوقف الـ lint.
    'src/app/core/<module>': 'type:core',
    'src/app/core': 'type:core', // البنية التحتية والخدمات المركزية
    'src/app/shared': 'type:shared', // الأدوات والمكونات المشتركة
    // Aggregate UI API plus focused public APIs for shell and toast composition.
    'src/app/shared/ui': 'type:shared',
    // Public sub-APIs used by the app shell avoid eagerly loading the full showcase library.
    'src/app/shared/ui/shell': 'type:shared',
    'src/app/shared/ui/toast': 'type:shared',
    'src/app/shared/ui/confirm': 'type:shared',
    'src/app/shared/ui/navbar': 'type:shared',
    'src/app/shared/ui/sidebar': 'type:shared',
    'src/app/shared/ui/foundation': 'type:shared',
    // Capabilities intentionally shared by multiple features.
    'src/app/domain/<capability>': 'type:domain',
    'src/app/features/public': 'feature:public', // الصفحات العامة و SSR و SEO
    'src/app/features/auth': 'feature:auth', // شاشات تسجيل الدخول والتسجيل واستعادة الحساب
    'src/app/features/<feature>': ['type:feature', 'feature:<feature>'],
  },

  // قواعد الاعتمادية: المفتاح = الوحدة المستورِدة، القيمة = الوسوم المسموح لها بالاستيراد منها فقط
  depRules: {
    // جذر التطبيق (main.ts، app.config.ts، app.routes.ts، dev/*) يرى جميع الطبقات لربط التطبيق
    root: ['type:core', 'type:shared', 'type:domain', 'feature:*', 'type:feature', 'noTag'],

    // أي مجلد غير مصنّف صراحةً أعلاه يستورد فقط من ملفات غير مصنّفة أو من core و shared
    noTag: ['noTag', 'type:core', 'type:shared'],

    // core معزول تماماً: يستورد من core فقط (ممنوع استيراد shared أو domain أو أي feature)
    'type:core': ['type:core'],

    // shared معزول تماماً: يستورد من shared فقط (ممنوع استيراد core أو domain أو أي feature)
    'type:shared': ['type:shared'],

    // Shared capabilities can depend on infrastructure, but not on feature internals.
    'type:domain': ['type:core', 'type:shared'],

    // Features can depend on their own code, shared infrastructure, and explicit shared capabilities.
    'feature:public': [sameTag, 'type:core', 'type:shared', 'type:domain'],
    'feature:auth': [sameTag, 'type:core', 'type:shared', 'type:domain'],
    'type:feature': [sameTag, 'type:core', 'type:shared', 'type:domain'],
    'feature:*': [sameTag, 'type:core', 'type:shared', 'type:domain'],
  },
};
