import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppFieldPhone } from './field-phone';

describe('AppFieldPhone', () => {
  let fixture: ComponentFixture<AppFieldPhone>;
  let component: AppFieldPhone;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFieldPhone],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFieldPhone);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'common.fields.phone');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders with 54px min-height and radius 18px', () => {
    expect(component).toBeTruthy();
    const container = fixture.nativeElement.querySelector('.min-h-\\[54px\\]');
    expect(container).toBeTruthy();
    expect(container.classList.contains('rounded-[18px]')).toBe(true);
  });

  it('binds country dial code correctly', () => {
    const select = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe('+20');
  });
});
