import type { MenuItem } from 'primeng/api';

/**
 * Generic navigation item contract for reusable UI navigation components (`AppNavbar`, `AppSidebar`).
 * Keeps `shared/ui` completely decoupled from Mozakrety domain roles, APIs, or translation keys.
 */
export interface UiNavItem {
  readonly id: string;
  readonly label: string;
  readonly route?: string;
  readonly icon?: string;
  readonly badge?: string;
  readonly items?: readonly UiNavItem[];
}

/**
 * Maps generic `UiNavItem[]` into PrimeNG `MenuItem[]` while forwarding item selection callbacks.
 */
export function mapUiNavToMenuItems(
  items: readonly UiNavItem[],
  onSelect: (item: UiNavItem) => void,
): MenuItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    badge: item.badge,
    routerLink: item.route ? [item.route] : undefined,
    command: () => onSelect(item),
    items: item.items?.length ? mapUiNavToMenuItems(item.items, onSelect) : undefined,
  }));
}
