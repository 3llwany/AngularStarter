# AppNavbar

Generic top navigation bar / application header wrapping PrimeNG `Menubar`.

## Usage

```html
<app-navbar
  [items]="navItems()"
  [showLinks]="showLinksInNavbar()"
  [showSidebarToggle]="hasSidebar()"
  [menuAriaLabel]="toggleLabel()"
  (sidebarToggle)="onToggleSidebar()"
>
  <a brand routerLink="/">Your App</a>
  <div actions>
    <!-- language / auth actions -->
  </div>
</app-navbar>
```
