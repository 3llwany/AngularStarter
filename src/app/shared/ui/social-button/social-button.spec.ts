import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppSocialButton } from './social-button';

describe('AppSocialButton', () => {
  let fixture: ComponentFixture<AppSocialButton>;
  let component: AppSocialButton;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSocialButton],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSocialButton);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('provider', 'google');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders google button with 56px min-height and pill radius', () => {
    expect(component).toBeTruthy();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('min-h-[56px]')).toBe(true);
    expect(btn.classList.contains('rounded-full')).toBe(true);
  });

  it('switches to facebook provider styles', async () => {
    fixture.componentRef.setInput('provider', 'facebook');
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('bg-[#1877f2]')).toBe(true);
  });
});
