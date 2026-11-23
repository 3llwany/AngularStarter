# AppSidebar

Generic responsive sidebar wrapping PrimeNG `PanelMenu` (desktop) and `Drawer` (mobile/tablet).

## Usage

```html
<app-sidebar
  [items]="navItems()"
  [collapsed]="sidebarCollapsed()"
  [(mobileOpen)]="mobileDrawerOpen"
  [dir]="dir()"
  [ariaLabel]="sidebarLabel()"
>
  <div sidebarHeader>Brand / User</div>
  <div sidebarFooter>Collapse control</div>
</app-sidebar>
```
