import { computed, effect, inject, Service, signal } from '@angular/core';
import { AuthService } from '@core/auth';
import { Role } from '@core/theme';

/** أوضاع عرض روابط التنقل الرئيسية في الغلاف (Shell). */
export type NavLayoutMode = 'navbar' | 'sidebar';

/**
 * خريطة تحديد وضع التخطيط الافتراضي لكل دور بعد تسجيل الدخول:
 * - أدوار `navbar`: تظهر روابطها في الشريط العلوي المدمج مع الهيدر بدون قائمة جانبية.
 * - أدوار `sidebar`: تظهر روابطها في القائمة الجانبية مع هيدر علوي مضغوط.
 */
export const ROLE_LAYOUT_MODE: Record<Role, NavLayoutMode> = {
  student: 'navbar',
  parent: 'navbar',
  teacher: 'sidebar',
  school: 'sidebar',
  partner: 'sidebar',
  admin: 'sidebar',
};

/** الوضع الافتراضي للزائر غير المسجّل. */
export const DEFAULT_GUEST_LAYOUT: NavLayoutMode = 'navbar';

/**
 * خدمة تخطيط الواجهة — تحدد هل تظهر روابط التنقل في `Navbar` أم في `Sidebar`
 * تلقائياً حسب دور المستخدم بعد تسجيل الدخول، مع إمكانية التبديل اليدوي في أي وقت.
 */
@Service()
export class LayoutService {
  private readonly auth = inject(AuthService);

  private readonly _manualOverride = signal<NavLayoutMode | null>(null);
  private readonly _sidebarCollapsed = signal(false);
  private readonly _mobileDrawerOpen = signal(false);

  /** الوضع الفعلي الحالي (`'navbar'` أو `'sidebar'`). */
  readonly mode = computed<NavLayoutMode>(() => {
    const manual = this._manualOverride();
    if (manual !== null) {
      return manual;
    }
    const role = this.auth.role();
    return role ? (ROLE_LAYOUT_MODE[role] ?? DEFAULT_GUEST_LAYOUT) : DEFAULT_GUEST_LAYOUT;
  });

  /** هل القائمة الجانبية مفعّلة في الوضع الحالي. */
  readonly hasSidebar = computed(() => this.mode() === 'sidebar');

  /** هل تظهر الروابط داخل الشريط العلوي (Navbar المدمج مع الهيدر). */
  readonly showLinksInNavbar = computed(() => this.mode() === 'navbar');

  /** حالة طي القائمة الجانبية على الشاشات الكبيرة. */
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();

  /** حالة فتح القائمة الجانبية (Drawer) على الجوال. */
  readonly mobileDrawerOpen = this._mobileDrawerOpen.asReadonly();

  constructor() {
    // إعادة ضبط التجاوز اليدوي وحالة الدرج عند تسجيل الخروج حتى لا تتسرب لجلسة أخرى
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        this._manualOverride.set(null);
        this._mobileDrawerOpen.set(false);
      }
    });
  }

  /** تعيين وضع العرض يدوياً (`'navbar'` أو `'sidebar'`). */
  setMode(mode: NavLayoutMode): void {
    this._manualOverride.set(mode);
    if (mode === 'navbar') {
      this._mobileDrawerOpen.set(false);
    }
  }

  /** التبديل بين وضع الشريط العلوي والقائمة الجانبية. */
  toggleMode(): void {
    this.setMode(this.mode() === 'sidebar' ? 'navbar' : 'sidebar');
  }

  /** إلغاء التجاوز اليدوي والعودة للاختيار التلقائي حسب الدور. */
  clearOverride(): void {
    this._manualOverride.set(null);
  }

  /** تبديل طي القائمة الجانبية على سطح المكتب. */
  toggleSidebarCollapse(): void {
    this._sidebarCollapsed.update((collapsed) => !collapsed);
  }

  /** فتح درج القائمة الجانبية على الجوال. */
  openMobileDrawer(): void {
    this._mobileDrawerOpen.set(true);
  }

  /** إغلاق درج القائمة الجانبية على الجوال. */
  closeMobileDrawer(): void {
    this._mobileDrawerOpen.set(false);
  }

  /** تحديث حالة درج الجوال (متوافق مع ربط `model()`). */
  setMobileDrawerOpen(open: boolean): void {
    this._mobileDrawerOpen.set(open);
  }
}
