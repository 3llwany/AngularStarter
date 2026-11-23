import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppSelect } from './select';

describe('AppSelect', () => {
  let component: AppSelect<{ label: string; value: string }>;
  let fixture: ComponentFixture<AppSelect<{ label: string; value: string }>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSelect],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSelect<{ label: string; value: string }>);
    fixture.componentRef.setInput('options', [
      { label: 'Option A', value: 'option_a' },
      { label: 'Option B', value: 'option_b' },
    ]);
    fixture.componentRef.setInput('optionLabel', 'label');
    fixture.componentRef.setInput('optionValue', 'value');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create and render with 54px min-height and radius 18px', () => {
    expect(component).toBeTruthy();
    const selectEl = fixture.nativeElement.querySelector('p-select');
    expect(selectEl).toBeTruthy();
    expect(selectEl.classList.contains('min-h-[54px]')).toBe(true);
    expect(selectEl.classList.contains('rounded-[18px]')).toBe(true);
  });
});
