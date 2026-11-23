import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppBottomNavTab } from './bottom-nav-tab';

describe('AppBottomNavTab', () => {
  let fixture: ComponentFixture<AppBottomNavTab>;
  let component: AppBottomNavTab;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBottomNavTab],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppBottomNavTab);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'common.nav.home');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders inactive tab by default', () => {
    expect(component).toBeTruthy();
    const btn = fixture.nativeElement.querySelector('[role="tab"]');
    expect(btn.getAttribute('aria-selected')).toBe('false');
  });

  it('renders active pill styles when active is true', async () => {
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('[role="tab"]');
    expect(btn.getAttribute('aria-selected')).toBe('true');
    expect(btn.classList.contains('text-primary-700')).toBe(true);
  });
});
