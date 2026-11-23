import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideMockAuthApi } from '@core/auth';
import { LayoutService } from '@core/layout';
import { NavItem, NavService } from '@core/navigation';
import { provideMozPrimeNG } from '@core/providers';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  let fixture: ComponentFixture<AppShellComponent>;
  let layout: LayoutService;
  const navItemsSignal = signal<readonly NavItem[]>([
    { id: 'home', labelKey: 'common.app_name', route: '/student', order: 1 },
  ]);

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
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        ...provideMockAuthApi(),
        ...provideMozPrimeNG(),
        {
          provide: NavService,
          useValue: {
            items: navItemsSignal.asReadonly(),
            isLoading: signal(false),
            reload: () => false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShellComponent);
    layout = TestBed.inject(LayoutService);
    layout.clearOverride();
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders navbar without sidebar in navbar mode and mounts sidebar when switched', async () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-navbar')).not.toBeNull();
    expect(el.querySelector('app-sidebar')).toBeNull();
    expect(el.querySelector('app-toast')).not.toBeNull();
    expect(el.querySelector('app-confirm-dialog')).not.toBeNull();

    layout.setMode('sidebar');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('app-sidebar')).not.toBeNull();
  });

  it('toggles between navbar and sidebar modes via layout toggle button', () => {
    expect(layout.mode()).toBe('navbar');
    layout.toggleMode();
    fixture.detectChanges();
    expect(layout.mode()).toBe('sidebar');
  });
});
