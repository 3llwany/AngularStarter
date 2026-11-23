import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppHelperError } from './helper-error';

describe('AppHelperError', () => {
  let fixture: ComponentFixture<AppHelperError>;
  let component: AppHelperError;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHelperError],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHelperError);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders helper text when provided without error', async () => {
    fixture.componentRef.setInput('helper', 'common.helpers.password_hint');
    fixture.detectChanges();
    await fixture.whenStable();

    const span = fixture.nativeElement.querySelector('.text-surface-500');
    expect(span).toBeTruthy();
  });

  it('renders error role="alert" when error is provided', async () => {
    fixture.componentRef.setInput('error', 'common.errors.required');
    fixture.detectChanges();
    await fixture.whenStable();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert.classList.contains('text-[#b42318]')).toBe(true);
  });

  it('renders character count counter when maxCount is provided', async () => {
    fixture.componentRef.setInput('count', 5);
    fixture.componentRef.setInput('maxCount', 50);
    fixture.detectChanges();
    await fixture.whenStable();

    const counter = fixture.nativeElement.querySelector('.font-mono');
    expect(counter).toBeTruthy();
    expect(counter.textContent).toContain('5 / 50');
  });
});
