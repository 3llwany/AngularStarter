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
    'src/app/core': 'type:core', // البنية التحتية والخدمات المركزية
    'src/app/shared': 'type:shared', // الأدوات والمكونات المشتركة
    'src/app/shared/ui': 'type:shared', // مكتبة واجهات المستخدم (تحتوي index.ts الخاص بها)
    'src/app/shared/ui/<component>': 'type:shared', // أي مكوّن فرعي داخل shared/ui يمتلك index.ts مستقل (مثل toast)
    'src/app/features/public': 'feature:public', // الصفحات العامة و SSR و SEO
    'src/app/features/auth': 'feature:auth', // شاشات تسجيل الدخول والتسجيل واستعادة الحساب
    'src/app/features/<role>': ['type:role-feature', 'feature:<role>'], // مساحات الأدوار: student, parent, teacher, school, partner, admin
  },

  // قواعد الاعتمادية: المفتاح = الوحدة المستورِدة، القيمة = الوسوم المسموح لها بالاستيراد منها فقط
  depRules: {
    // جذر التطبيق (main.ts، app.config.ts، app.routes.ts، dev/*) يرى جميع الطبقات لربط التطبيق
    root: ['type:core', 'type:shared', 'feature:*', 'type:role-feature', 'noTag'],

    // أي مجلد غير مصنّف صراحةً أعلاه يستورد فقط من ملفات غير مصنّفة أو من core و shared
    noTag: ['noTag', 'type:core', 'type:shared'],

    // core معزول تماماً: يستورد من core فقط (ممنوع استيراد shared أو أي feature)
    'type:core': ['type:core'],

    // shared معزول تماماً: يستورد من shared فقط (ممنوع استيراد core أو أي feature)
    'type:shared': ['type:shared'],

    // الميزات (public, auth, وكل دور): تستورد من نفسها (sameTag) + core + shared فقط، وممنوع استيراد أي ميزة أخرى
    'feature:public': [sameTag, 'type:core', 'type:shared'],
    'feature:auth': [sameTag, 'type:core', 'type:shared'],
    'type:role-feature': [sameTag, 'type:core', 'type:shared'],
    'feature:*': [sameTag, 'type:core', 'type:shared'],
  },
};
