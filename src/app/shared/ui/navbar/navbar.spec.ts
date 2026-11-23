import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UiNavItem } from '../foundation/ui-nav-item';
import { AppNavbar } from './navbar';

const MOCK_ITEMS: readonly UiNavItem[] = [
  { id: 'home', label: 'Home', route: '/home', icon: 'pi pi-home' },
  { id: 'courses', label: 'Courses', route: '/courses', icon: 'pi pi-book' },
];

@Component({
  imports: [AppNavbar],
  template: `
    <app-navbar
      [items]="items"
      [showLinks]="showLinks()"
      [showSidebarToggle]="showToggle()"
      (sidebarToggle)="toggled = toggled + 1"
    >
      <span brand>{{ brandLabel }}</span>
      <button actions type="button">{{ actionLabel }}</button>
    </app-navbar>
  `,
})
class HostNavbarComponent {
  readonly brandLabel = 'BrandSlot';
  readonly actionLabel = 'ActionSlot';
  items = MOCK_ITEMS;
  readonly showLinks = signal(true);
  readonly showToggle = signal(false);
  toggled = 0;
}

describe('AppNavbar', () => {
  let fixture: ComponentFixture<HostNavbarComponent>;
  let host: HostNavbarComponent;

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    await TestBed.configureTestingModule({
      imports: [HostNavbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HostNavbarComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders projected brand and actions slots along with navigation links', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('BrandSlot');
    expect(text).toContain('ActionSlot');
    expect(text).toContain('Home');
    expect(text).toContain('Courses');
  });

  it('hides navigation links when showLinks is false (header-only mode)', () => {
    host.showLinks.set(false);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('BrandSlot');
    expect(text).not.toContain('Home');
    expect(text).not.toContain('Courses');
  });

  it('renders sidebar toggle button and emits sidebarToggle when clicked', () => {
    host.showToggle.set(true);
    fixture.detectChanges();

    const toggleBtn = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Toggle menu"]',
    ) as HTMLButtonElement | null;
    expect(toggleBtn).not.toBeNull();

    toggleBtn?.click();
    expect(host.toggled).toBe(1);
  });
});
