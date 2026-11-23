import { DOCUMENT, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, of, switchMap } from 'rxjs';
import { APP_ASSETS } from '@core/assets';
import { AuthService } from '@core/auth';
import { LocaleService } from '@core/i18n';
import { LayoutService } from '@core/layout';
import { NavItem, NavService } from '@core/navigation';
import { APP_ROUTES } from '@core/routes';
import { ThemeService } from '@core/theme';
import { HAS_DEV_ROUTES } from '../dev/dev.routes';
import { AppConfirmDialog, UiNavItem, AppNavbar, AppSidebar, AppToast } from '@shared/ui';

/**
 * غلاف التطبيق الرئيسي (App Shell):
 * يربط بين خدمات النواة (`NavService`, `LayoutService`, `AuthService`, `LocaleService`, `ThemeService`)
 * ومكونات الواجهة (`AppNavbar`, `AppSidebar`, `AppToast`, `AppConfirmDialog`) مع احترام حدود Sheriff.
 */
@Component({
  selector: 'app-shell',
  imports: [
    NgOptimizedImage,
    RouterLink,
    RouterOutlet,
    TranslatePipe,
    AppNavbar,
    AppSidebar,
    AppToast,
    AppConfirmDialog,
  ],
  template: `
    <div class="min-h-screen flex flex-col overflow-x-clip bg-surface-50 text-surface-900">
      <a
        href="#moz-main-content"
        class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:inset-s-2 focus:z-50 focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-on-primary">
        {{ 'shell.layout.skip_to_content' | translate }}
      </a>

      <app-navbar
        [items]="navItems()"
        [showLinks]="layout.showLinksInNavbar()"
        [showSidebarToggle]="layout.hasSidebar()"
        [dir]="locale.dir()"
        [menuAriaLabel]="toggleSidebarLabel() ?? ''"
        (sidebarToggle)="onSidebarToggle()">
        <a
          brand
          [routerLink]="routes.root.full"
          class="flex items-center gap-2 font-bold text-base sm:text-lg text-surface-900 no-underline whitespace-nowrap shrink-0">
          <img
            [ngSrc]="brandLogo"
            width="32"
            height="32"
            priority
            alt=""
            class="h-8 w-8 shrink-0 rounded-lg object-contain" />
          <span>{{ 'common.app_name' | translate }}</span>
        </a>

        <div actions class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            class="inline-flex h-9 items-center gap-1 rounded-xl border border-surface-200 bg-surface-0 px-2.5 text-xs font-semibold text-surface-700 whitespace-nowrap transition-colors hover:bg-surface-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            [attr.aria-label]="switchLangLabel() ?? ''"
            (click)="locale.setLang(locale.lang() === 'ar' ? 'en' : 'ar')">
            <i class="pi pi-globe text-xs" aria-hidden="true"></i>
            <span>{{ locale.lang() === 'ar' ? 'EN' : 'AR' }}</span>
          </button>

          @if (auth.isAuthenticated()) {
            <button
              type="button"
              class="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary-600 px-2.5 sm:px-3 text-xs font-semibold text-on-primary whitespace-nowrap transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 shadow-2xs"
              [attr.aria-label]="signOutLabel() ?? ''"
              (click)="onSignOut()">
              <i class="pi pi-sign-out text-xs" aria-hidden="true"></i>
              <span class="hidden sm:inline">{{ 'shell.actions.sign_out' | translate }}</span>
            </button>
          } @else {
            <a
              [routerLink]="routes.auth.login.full"
              class="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary-600 px-2.5 sm:px-3 text-xs font-semibold text-on-primary no-underline whitespace-nowrap transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 shadow-2xs">
              <i class="pi pi-sign-in text-xs" aria-hidden="true"></i>
              <span>{{ 'shell.actions.sign_in' | translate }}</span>
            </a>
          }
        </div>
      </app-navbar>

      <div class="flex flex-1 min-h-0 pt-14">
        @defer (when layout.hasSidebar()) {
          @if (layout.hasSidebar()) {
            <app-sidebar
              [items]="navItems()"
              [collapsed]="layout.sidebarCollapsed()"
              [mobileOpen]="layout.mobileDrawerOpen()"
              (mobileOpenChange)="layout.setMobileDrawerOpen($event)"
              [dir]="locale.dir()"
              [ariaLabel]="sidebarAriaLabel() ?? ''">
              @if (auth.user(); as currentUser) {
                <div sidebarHeader class="flex items-center gap-2.5">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-xs font-bold text-on-primary shadow-2xs">
                    {{ currentUser.displayName.slice(0, 1) }}
                  </span>
                  @if (!layout.sidebarCollapsed()) {
                    <div class="min-w-0">
                      <p class="truncate text-xs font-bold text-surface-900">
                        {{ currentUser.displayName }}
                      </p>
                      <p class="truncate text-[11px] text-surface-500">
                        {{ currentUser.role }}
                      </p>
                    </div>
                  }
                </div>
              } @else if (hasDevRoutes && layout.hasSidebar()) {
                <div sidebarHeader class="flex items-center gap-2.5">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-xs font-bold text-on-primary shadow-2xs">
                    <i class="pi pi-user text-xs" aria-hidden="true"></i>
                  </span>
                  @if (!layout.sidebarCollapsed()) {
                    <div class="min-w-0">
                      <p class="truncate text-xs font-bold text-surface-900">
                        {{ 'common.roles.' + theme.role() | translate }}
                      </p>
                      <p class="truncate text-[11px] text-primary-600 font-medium">
                        {{ 'common.app_name' | translate }}
                      </p>
                    </div>
                  }
                </div>
              }
              <button
                sidebarFooter
                type="button"
                class="flex w-full items-center justify-center gap-2 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                [attr.aria-label]="
                  (layout.sidebarCollapsed() ? expandSidebarLabel() : collapseSidebarLabel()) ?? ''
                "
                (click)="layout.toggleSidebarCollapse()">
                <i
                  [class]="
                    layout.sidebarCollapsed()
                      ? 'pi pi-angle-double-right text-sm rtl:rotate-180'
                      : 'pi pi-angle-double-left text-sm rtl:rotate-180'
                  "
                  aria-hidden="true"></i>
                @if (!layout.sidebarCollapsed()) {
                  <span>{{ 'shell.actions.collapse_sidebar' | translate }}</span>
                }
              </button>
            </app-sidebar>
          }
        }

        <main id="moz-main-content" class="flex-1 min-w-0 p-4 md:p-6">
          <router-outlet />
        </main>
      </div>

      <app-toast />
      <app-confirm-dialog />
    </div>
  `,
})
export class AppShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly nav = inject(NavService);
  protected readonly layout = inject(LayoutService);
  protected readonly locale = inject(LocaleService);
  protected readonly theme = inject(ThemeService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  protected readonly routes = APP_ROUTES;
  protected readonly brandLogo = APP_ASSETS.logos.brand;
  protected readonly hasDevRoutes = HAS_DEV_ROUTES;

  protected readonly toggleSidebarLabel = toSignal(
    this.translate.stream('shell.actions.toggle_sidebar'),
    { initialValue: '' },
  );
  protected readonly collapseSidebarLabel = toSignal(
    this.translate.stream('shell.actions.collapse_sidebar'),
    { initialValue: '' },
  );
  protected readonly expandSidebarLabel = toSignal(
    this.translate.stream('shell.actions.expand_sidebar'),
    { initialValue: '' },
  );
  protected readonly switchLangLabel = toSignal(
    this.translate.stream('shell.actions.switch_language'),
    { initialValue: '' },
  );
  protected readonly signOutLabel = toSignal(this.translate.stream('shell.actions.sign_out'), {
    initialValue: '',
  });
  protected readonly sidebarAriaLabel = toSignal(
    this.translate.stream('shell.layout.sidebar_label'),
    { initialValue: '' },
  );

  private readonly devGuestPreviewItems: readonly NavItem[] = HAS_DEV_ROUTES
    ? [
        {
          id: 'mock-students',
          labelKey: 'mock.students.nav_title',
          route: '/mock/students',
          icon: 'pi pi-users',
          order: 0,
        },
        {
          id: 'overview',
          labelKey: 'dev.menu.overview',
          route: '/dev/foundation',
          icon: 'pi pi-home',
          order: 1,
        },
        {
          id: 'courses',
          labelKey: 'dev.menu.courses',
          route: '/dev/foundation',
          icon: 'pi pi-book',
          order: 2,
        },
        {
          id: 'lessons',
          labelKey: 'dev.menu.lessons',
          route: '/dev/foundation',
          icon: 'pi pi-video',
          order: 3,
        },
        {
          id: 'exams',
          labelKey: 'dev.menu.exams',
          route: '/dev/foundation',
          icon: 'pi pi-file-edit',
          order: 4,
        },
        {
          id: 'messages',
          labelKey: 'dev.menu.messages',
          route: '/dev/foundation',
          icon: 'pi pi-envelope',
          order: 6,
        },
        {
          id: 'support',
          labelKey: 'dev.menu.support',
          route: '/dev/foundation',
          icon: 'pi pi-life-ring',
          order: 7,
        },
      ]
    : [];

  private readonly activeRawItems = computed<readonly NavItem[]>(() => {
    const items = this.nav.items();
    if (items.length > 0) {
      return items;
    }
    return !this.auth.isAuthenticated() ? this.devGuestPreviewItems : [];
  });

  protected readonly navItems = toSignal(
    toObservable(computed(() => ({ items: this.activeRawItems(), lang: this.locale.lang() }))).pipe(
      switchMap(({ items }) => {
        if (items.length === 0) {
          return of<readonly UiNavItem[]>([]);
        }
        return this.translate.get(items.map((item) => item.labelKey)).pipe(
          map((translations: Record<string, string>) =>
            items.map((item) => ({
              id: item.id,
              label: translations[item.labelKey] || item.labelKey,
              route: item.route,
              icon: item.icon,
            })),
          ),
        );
      }),
    ),
    { initialValue: [] as readonly UiNavItem[] },
  );

  protected onSidebarToggle(): void {
    const width = isPlatformBrowser(this.platformId)
      ? (this.document.defaultView?.innerWidth ?? 1024)
      : 1024;
    if (width < 1024) {
      this.layout.openMobileDrawer();
      return;
    }
    this.layout.toggleSidebarCollapse();
  }

  protected async onSignOut(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate([APP_ROUTES.auth.login.full]);
  }
}
