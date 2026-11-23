# مواصفات الميزة 003: هيكل التطبيق التكيفي وثوابت الأصول والمسارات (`003-app-shell`)

- **الحالة**: مسودة للتخطيط (`/speckit-plan`)
- **التاريخ**: 2026-11-18
- **النطاق**: تأسيس المرحلة الثالثة (بداية الطبقة البصرية والهيكلة العملية للتطبيق) مع الالتزام التام بـ Angular 22+ و PrimeNG و حدود Sheriff.

## المتطلبات الأساسية

1. **ثوابت الأصول (`APP_ASSETS`)**:
   - إنشاء سجل ثوابت مكتوب بطريقة حديثة (`const ... as const` بدون كلاسات أو `any`) لتجميع مسارات الصور والأيقونات والـ SVG بشكل آمن للـ Tree-shaking ومتوافق مع `NgOptimizedImage`.

2. **ثوابت المسارات الآمنة للأنواع (`app-routes.ts`)**:
   - إنشاء سجل مسارات مركزي في `core` للمسارات العامة وجذور الأدوار، مع تضمين أمثلة عملية لمسارات متداخلة ومعقدة متعددة المعاملات (nested params + query params builder) لتكون المرجع القياسي لباقي الميزات.

3. **معترض التحميل الاختياري (`loadingInterceptor`)**:
   - إنشاء `loadingInterceptor` مرتبط بـ `LoadingService` وسياق `SKIP_LOADING` مع اختباراته الكاملة، **دون تفعيله افتراضياً** في `provideMozHttp()`؛ بحيث يظل خياراً جاهزاً للاستيراد عند الحاجة فقط بينما يعتمد كل قسم على حالة التحميل الخاصة به (`isLoading()`).

4. **خدمة تخطيط التنقل (`LayoutService`) + الهيكل البصري (`Navbar` / `Sidebar` باستخدام PrimeNG)**:
   - إنشاء `LayoutService` في `core` لتحديد وضع عرض الروابط (`'navbar'` أو `'sidebar'`) تلقائياً حسب دور المستخدم بعد تسجيل الدخول (مجموعة أدوار يظهر لها `Sidebar` + Header مضغوط، ومجموعة أدوار يظهر لها `Navbar` مدمج مع الـ Header بدون `Sidebar`)، مع إمكانية تغيير الوضع برمجياً أو من الواجهة في أي وقت.
   - بناء مكوني `AppNavbar` و `AppSidebar` في `src/app/shared/ui/` بالاعتماد على مكونات PrimeNG الجاهزة (`Menubar`، `Drawer`، `PanelMenu`) بشكل عام 100% ودعم كامل للـ RTL و WCAG AA و SSR.
   - بناء `AppShellComponent` لربط `NavService` و `LayoutService` و `AuthService` و `LocaleService` و `ThemeService` مع `AppToast` و `AppConfirmDialog` و `RouterOutlet`.
