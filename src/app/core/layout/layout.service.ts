import { computed, Service, signal } from '@angular/core';

/** أوضاع عرض روابط التنقل الرئيسية في الغلاف (Shell). */
export type NavLayoutMode = 'navbar' | 'sidebar';

/** Default shell layout; consumers can choose another mode for their product. */
export const DEFAULT_LAYOUT_MODE: NavLayoutMode = 'navbar';

/**
 * خدمة تخطيط الواجهة — تحدد هل تظهر روابط التنقل في `Navbar` أم في `Sidebar`
 * مع إمكانية التبديل اليدوي بين الشريط العلوي والقائمة الجانبية.
 */
@Service()
export class LayoutService {
  private readonly _manualOverride = signal<NavLayoutMode | null>(null);
  private readonly _sidebarCollapsed = signal(false);
  private readonly _mobileDrawerOpen = signal(false);

  /** الوضع الفعلي الحالي (`'navbar'` أو `'sidebar'`). */
  readonly mode = computed<NavLayoutMode>(() => this._manualOverride() ?? DEFAULT_LAYOUT_MODE);

  /** هل القائمة الجانبية مفعّلة في الوضع الحالي. */
  readonly hasSidebar = computed(() => this.mode() === 'sidebar');

  /** هل تظهر الروابط داخل الشريط العلوي (Navbar المدمج مع الهيدر). */
  readonly showLinksInNavbar = computed(() => this.mode() === 'navbar');

  /** حالة طي القائمة الجانبية على الشاشات الكبيرة. */
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();

  /** حالة فتح القائمة الجانبية (Drawer) على الجوال. */
  readonly mobileDrawerOpen = this._mobileDrawerOpen.asReadonly();

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

  /** Reset to the configured default layout. */
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
