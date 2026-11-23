import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UiNavItem } from '../foundation';
import { AppSidebar } from './sidebar';

const MOCK_ITEMS: readonly UiNavItem[] = [
  { id: 'overview', label: 'Overview', route: '/overview', icon: 'pi pi-home' },
  { id: 'settings', label: 'Settings', route: '/settings', icon: 'pi pi-cog' },
];

describe('AppSidebar', () => {
  let fixture: ComponentFixture<AppSidebar>;
  let component: AppSidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSidebar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', MOCK_ITEMS);
    fixture.detectChanges();
  });

  it('renders desktop PanelMenu items when expanded', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Overview');
    expect(text).toContain('Settings');
  });

  it('switches to compact icon rail when collapsed is true', () => {
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    const railLinks = (fixture.nativeElement as HTMLElement).querySelectorAll('aside nav ul li a');
    expect(railLinks).toHaveLength(2);
    expect(railLinks[0]?.getAttribute('aria-label')).toBe('Overview');
  });

  it('computes RTL/LTR drawer position and supports mobileOpen model', () => {
    expect((component as unknown as { drawerPosition: () => string }).drawerPosition()).toBe('right');

    fixture.componentRef.setInput('dir', 'ltr');
    fixture.detectChanges();
    expect((component as unknown as { drawerPosition: () => string }).drawerPosition()).toBe('left');

    component.mobileOpen.set(true);
    fixture.detectChanges();
    expect(component.mobileOpen()).toBe(true);
  });
});
