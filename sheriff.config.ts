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
    // مكتبة واجهات المستخدم وحدة واحدة مدخلها الوحيد index.ts؛ من خارجها الاستيراد عبر '@shared/ui' فقط.
    'src/app/shared/ui': 'type:shared',
    // مجالات الأعمال المشتركة بين أكثر من دور (مثل courses, exams). كل مجال وحدة مستقلة مدخلها index.ts عبر '@domain/<name>'.
    'src/app/domain/<domain>': 'type:domain',
    'src/app/features/public': 'feature:public', // الصفحات العامة و SSR و SEO
    'src/app/features/auth': 'feature:auth', // شاشات تسجيل الدخول والتسجيل واستعادة الحساب
    'src/app/features/<role>': ['type:role-feature', 'feature:<role>'], // مساحات الأدوار: student, parent, teacher, school, partner, admin
  },

  // قواعد الاعتمادية: المفتاح = الوحدة المستورِدة، القيمة = الوسوم المسموح لها بالاستيراد منها فقط
  depRules: {
    // جذر التطبيق (main.ts، app.config.ts، app.routes.ts، dev/*) يرى جميع الطبقات لربط التطبيق
    root: ['type:core', 'type:shared', 'type:domain', 'feature:*', 'type:role-feature', 'noTag'],

    // أي مجلد غير مصنّف صراحةً أعلاه يستورد فقط من ملفات غير مصنّفة أو من core و shared
    noTag: ['noTag', 'type:core', 'type:shared'],

    // core معزول تماماً: يستورد من core فقط (ممنوع استيراد shared أو domain أو أي feature)
    'type:core': ['type:core'],

    // shared معزول تماماً: يستورد من shared فقط (ممنوع استيراد core أو domain أو أي feature)
    'type:shared': ['type:shared'],

    // domain: قدرات وعقود مشتركة بين الأدوار؛ تستورد من core و shared فقط (ممنوع استيراد features أو مجال domain آخر لتجنب التشابك)
    'type:domain': ['type:core', 'type:shared'],

    // الميزات (public, auth, وكل دور): تستورد من نفسها (sameTag) + core + shared + domain فقط، وممنوع استيراد أي ميزة أخرى
    'feature:public': [sameTag, 'type:core', 'type:shared', 'type:domain'],
    'feature:auth': [sameTag, 'type:core', 'type:shared', 'type:domain'],
    'type:role-feature': [sameTag, 'type:core', 'type:shared', 'type:domain'],
    'feature:*': [sameTag, 'type:core', 'type:shared', 'type:domain'],
  },
};
