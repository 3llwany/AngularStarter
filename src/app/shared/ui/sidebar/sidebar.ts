import { Component, computed, input, model, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Drawer } from 'primeng/drawer';
import { mapUiNavToMenuItems, UiNavItem } from '../foundation/ui-nav-item';

/**
 * Reusable responsive sidebar with full-height scrollable navigation on desktop
 * (with optional compact icon rail) and a beautifully styled `Drawer` on mobile.
 */
@Component({
  selector: 'app-sidebar',
  imports: [Drawer, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  host: { class: 'flex shrink-0' },
})
export class AppSidebar {
  /** Navigation items rendered inside the sidebar. */
  readonly items = input<readonly UiNavItem[]>([]);

  /** Collapses the desktop sidebar to a compact icon rail when true. */
  readonly collapsed = input<boolean>(false);

  /** Two-way bound visibility state for the mobile `Drawer`. */
  readonly mobileOpen = model<boolean>(false);

  /** Active reading direction used to place the mobile drawer on the start edge. */
  readonly dir = input<'rtl' | 'ltr'>('rtl');

  /** Accessible navigation landmark label. */
  readonly ariaLabel = input<string>('Sidebar navigation');

  /** Emitted when a navigation item is selected. */
  readonly itemSelect = output<UiNavItem>();

  protected readonly drawerPosition = computed<'right' | 'left'>(() =>
    this.dir() === 'rtl' ? 'right' : 'left',
  );

  protected readonly menuItems = computed(() =>
    mapUiNavToMenuItems(this.items(), (item) => {
      this.mobileOpen.set(false);
      this.itemSelect.emit(item);
    }),
  );

  protected onRailSelect(item: UiNavItem): void {
    this.itemSelect.emit(item);
  }
}

export { AppSidebar as Sidebar };
