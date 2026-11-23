# دليل التحقق السريع: `003-app-shell`

## 1. الاختبارات الآلية وبوابات الجودة
بعد تنفيذ المهام، يجب أن تنجح البوابات الأربع التالية دون أخطاء:
```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## 2. سيناريوهات التحقق المستهدفة
1. **`APP_ASSETS` و `app-routes.ts`**:
   - التحقق عبر اختبار وحدة (`app-routes.spec.ts`) من بناء المسارات البسيطة والمتداخلة المعقدة (`courses/:courseId/units/:unitId/lessons/:lessonId` + `queryParams`) دون أخطاء.
2. **`loadingInterceptor` الاختياري**:
   - التحقق عبر `loading.interceptor.spec.ts` من تفعيل وإطفاء `LoadingService`، وتجاهل طلبات `SKIP_LOADING` والأصول الثابتة.
   - التأكد من أن `provideMozHttp()` لا يفعّله تلقائياً ما لم يُطلب صراحةً.
3. **`LayoutService` (`core/layout/layout.service.spec.ts`)**:
   - التحقق من الوضع الافتراضي لكل دور (`student`/`parent` -> `'navbar'`، و `teacher`/`school`/`partner`/`admin` -> `'sidebar'`).
   - التحقق من التبديل التلقائي فور تغيير الدور، ومن أولوية `setMode()` / `toggleMode()` وإعادة التصفير عند تسجيل الخروج.
4. **مكونات الواجهة `AppNavbar` و `AppSidebar` و `AppShellComponent`**:
   - نجاح اختبارات `navbar.spec.ts` و `sidebar.spec.ts` و `app-shell.component.spec.ts`.
   - التحقق في المعاينة الحية (`npm start`) من تبديل RTL/LTR (انقلاب موضع `Drawer` بين اليمين واليسار)، وتبديل الوضع بين `Navbar` و `Sidebar` بسلاسة، واستمرار عمل `AppToast` و `NgOptimizedImage`.
   - مراقبة حجم الحزمة الابتدائية في `npm run build` للتأكد من عدم تجاوز حد الفشل (`500 kB`).
