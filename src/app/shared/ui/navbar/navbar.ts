import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Drawer } from 'primeng/drawer';
import { mapUiNavToMenuItems, UiNavItem } from '../foundation/ui-nav-item';

/**
 * Reusable responsive top navigation bar / application header.
 * Renders spaced horizontal links on desktop and a smooth styled `Drawer`
 * on mobile when `showLinks` is true, or acts as a compact header bar alongside `AppSidebar`.
 */
@Component({
  selector: 'app-navbar',
  imports: [Drawer, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class AppNavbar {
  /** Navigation items to render when `showLinks()` is true. */
  readonly items = input<readonly UiNavItem[]>([]);

  /** Controls whether navigation links appear inside the top navbar. */
  readonly showLinks = input<boolean>(true);

  /** Shows a toggle button for controlling an external sidebar/drawer. */
  readonly showSidebarToggle = input<boolean>(false);

  /** Active reading direction used to place the mobile drawer on the start edge. */
  readonly dir = input<'rtl' | 'ltr'>('rtl');

  /** Accessible ARIA label for navigation and toggle button. */
  readonly menuAriaLabel = input<string>('Toggle menu');

  /** Emitted when the external sidebar toggle button is clicked. */
  readonly sidebarToggle = output<void>();

  /** Emitted when a navigation item is activated. */
  readonly itemSelect = output<UiNavItem>();

  protected readonly mobileMenuOpen = signal(false);

  protected readonly drawerPosition = computed<'right' | 'left'>(() =>
    this.dir() === 'rtl' ? 'right' : 'left',
  );

  protected readonly menuItems = computed(() =>
    mapUiNavToMenuItems(this.items(), (item) => {
      this.mobileMenuOpen.set(false);
      this.itemSelect.emit(item);
    }),
  );

  protected onToggleClick(): void {
    if (this.showSidebarToggle()) {
      this.sidebarToggle.emit();
      return;
    }
    this.mobileMenuOpen.update((open) => !open);
  }
}

export { AppNavbar as Navbar };
