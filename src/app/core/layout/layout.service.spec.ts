import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { AuthService, SESSION_HINT_COOKIE, DEMO_PASSWORD, provideMockAuthApi } from '@core/auth';
import { DEFAULT_GUEST_LAYOUT, LayoutService, ROLE_LAYOUT_MODE } from './layout.service';

describe('LayoutService', () => {
  let layout: LayoutService;
  let auth: AuthService;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideMockAuthApi()],
    });

    layout = TestBed.inject(LayoutService);
    layout.clearOverride();
    auth = TestBed.inject(AuthService);
    doc = TestBed.inject(DOCUMENT);
    doc.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; Path=/`;
  });

  afterEach(() => {
    doc.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; Path=/`;
    TestBed.resetTestingModule();
  });

  it('defaults to guest layout mode when unauthenticated', () => {
    expect(layout.mode()).toBe(DEFAULT_GUEST_LAYOUT);
    expect(layout.showLinksInNavbar()).toBe(true);
    expect(layout.hasSidebar()).toBe(false);
  });

  it('switches layout automatically according to signed-in role', async () => {
    await auth.login('student', {
      identifier: 'student@mozakrety.test',
      password: DEMO_PASSWORD,
    });
    expect(layout.mode()).toBe(ROLE_LAYOUT_MODE.student);
    expect(layout.showLinksInNavbar()).toBe(true);
    expect(layout.hasSidebar()).toBe(false);

    await auth.logout();
    TestBed.tick();

    await auth.login('teacher', {
      identifier: 'TCH-1042',
      password: DEMO_PASSWORD,
    });
    expect(layout.mode()).toBe(ROLE_LAYOUT_MODE.teacher);
    expect(layout.hasSidebar()).toBe(true);
    expect(layout.showLinksInNavbar()).toBe(false);
  });

  it('allows manual mode override, toggleMode(), and clearOverride()', async () => {
    await auth.login('student', {
      identifier: 'student@mozakrety.test',
      password: DEMO_PASSWORD,
    });
    expect(layout.mode()).toBe('navbar');

    layout.setMode('sidebar');
    expect(layout.mode()).toBe('sidebar');
    expect(layout.hasSidebar()).toBe(true);

    layout.toggleMode();
    expect(layout.mode()).toBe('navbar');
    expect(layout.showLinksInNavbar()).toBe(true);

    layout.setMode('sidebar');
    layout.clearOverride();
    expect(layout.mode()).toBe(ROLE_LAYOUT_MODE.student);
  });

  it('resets manual override and mobile drawer state on logout()', async () => {
    await auth.login('teacher', {
      identifier: 'TCH-1042',
      password: DEMO_PASSWORD,
    });
    layout.openMobileDrawer();
    layout.setMode('navbar');
    expect(layout.mode()).toBe('navbar');

    await auth.logout();
    TestBed.tick();

    expect(layout.mode()).toBe(DEFAULT_GUEST_LAYOUT);
    expect(layout.mobileDrawerOpen()).toBe(false);
  });

  it('toggles desktop sidebar collapse state', () => {
    expect(layout.sidebarCollapsed()).toBe(false);
    layout.toggleSidebarCollapse();
    expect(layout.sidebarCollapsed()).toBe(true);
    layout.toggleSidebarCollapse();
    expect(layout.sidebarCollapsed()).toBe(false);
  });
});
