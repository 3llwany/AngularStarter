import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppChipSelect } from './chip-select';

describe('AppChipSelect', () => {
  let fixture: ComponentFixture<AppChipSelect>;
  let component: AppChipSelect;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppChipSelect],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppChipSelect);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'common.grades.first_sec');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders with 44px min-height and pill radius', () => {
    expect(component).toBeTruthy();
    const btn =
      fixture.nativeElement.querySelector('p-togglebutton') ??
      fixture.nativeElement.querySelector('[role="button"]') ??
      fixture.nativeElement.firstElementChild;
    expect(btn.classList.contains('min-h-[44px]')).toBe(true);
    expect(btn.classList.contains('rounded-full')).toBe(true);
  });

  it('toggles active state on click', async () => {
    const btn =
      fixture.nativeElement.querySelector('p-togglebutton') ??
      fixture.nativeElement.querySelector('[role="button"]') ??
      fixture.nativeElement.firstElementChild;
    btn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.active()).toBe(true);
  });
});
