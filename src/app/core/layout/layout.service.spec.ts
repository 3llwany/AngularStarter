import { TestBed } from '@angular/core/testing';
import { DEFAULT_LAYOUT_MODE, LayoutService } from './layout.service';

describe('LayoutService', () => {
  let layout: LayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    layout = TestBed.inject(LayoutService);
  });

  it('starts in the configured default layout', () => {
    expect(layout.mode()).toBe(DEFAULT_LAYOUT_MODE);
    expect(layout.showLinksInNavbar()).toBe(true);
    expect(layout.hasSidebar()).toBe(false);
  });

  it('supports manual layout changes and resetting to default', () => {
    layout.setMode('sidebar');
    expect(layout.hasSidebar()).toBe(true);

    layout.toggleMode();
    expect(layout.mode()).toBe('navbar');

    layout.setMode('sidebar');
    layout.clearOverride();
    expect(layout.mode()).toBe(DEFAULT_LAYOUT_MODE);
  });

  it('controls mobile drawer and desktop collapse state', () => {
    layout.openMobileDrawer();
    expect(layout.mobileDrawerOpen()).toBe(true);
    layout.setMobileDrawerOpen(false);
    expect(layout.mobileDrawerOpen()).toBe(false);

    layout.toggleSidebarCollapse();
    expect(layout.sidebarCollapsed()).toBe(true);
    layout.toggleSidebarCollapse();
    expect(layout.sidebarCollapsed()).toBe(false);
  });
});
