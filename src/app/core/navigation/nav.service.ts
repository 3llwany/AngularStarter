import { Service, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ApiClient } from '../http/api-client';

/** عنصر قائمة تنقل يُرجعه الباك إند للمستخدم الحالي. */
export interface NavItem {
  readonly id: string;
  readonly labelKey: string;
  readonly route: string;
  readonly icon?: string;
  readonly order?: number;
  readonly group?: string;
}

/** نقطة نهاية جلب قائمة المستخدم من الباك إند. */
export const USER_MENU_ENDPOINT = 'auth/menu';

/**
 * خدمة التنقل — تجلب قائمة المستخدم الحالي من الباك إند عبر `httpResource`
 * بمجرد المصادقة، وتحتفظ بها في الذاكرة حتى تسجيل الخروج أو طلب التحديث.
 */
@Service()
export class NavService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiClient);

  private readonly menuResource = this.api.resource<readonly NavItem[]>(() =>
    this.auth.isAuthenticated() ? USER_MENU_ENDPOINT : undefined,
  );

  /** هل طلب القائمة قيد التحميل حالياً. */
  readonly isLoading = this.menuResource.isLoading;

  /** عناصر القائمة المرتبة للمستخدم الحالي، أو مصفوفة فارغة قبل تسجيل الدخول. */
  readonly items = computed<readonly NavItem[]>(() => {
    if (!this.auth.isAuthenticated() || !this.menuResource.hasValue()) {
      return [];
    }
    const list = this.menuResource.value() ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  /** إعادة جلب القائمة من الباك إند عند الحاجة. */
  reload(): boolean {
    return this.menuResource.reload();
  }
}
