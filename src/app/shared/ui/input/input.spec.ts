import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, required } from '@angular/forms/signals';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppInput } from './input';

interface TestModel {
  name: string;
}

@Component({
  imports: [AppInput],
  template: `
    <app-input
      [field]="testForm.name"
      label="common.fields.name"
      placeholder="common.actions.search"
    />
  `,
})
class TestHostComponent {
  readonly model = signal<TestModel>({ name: '' });
  readonly testForm = form(this.model, (f) => {
    required(f.name);
  });
}

describe('AppInput', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders input with 54px min-height and radius 18px classes', () => {
    const inputEl = fixture.nativeElement.querySelector('input');
    expect(inputEl).toBeTruthy();
    expect(inputEl.classList.contains('min-h-[54px]')).toBe(true);
    expect(inputEl.classList.contains('rounded-[18px]')).toBe(true);
    expect(inputEl.classList.contains('ps-[18px]')).toBe(true);
  });

  it('renders floating label correctly', () => {
    const labelEl = fixture.nativeElement.querySelector('label');
    expect(labelEl).toBeTruthy();
  });

  it('shows error message and invalid styling when field is touched and invalid', async () => {
    // Touch field and invalidate
    host.testForm.name().markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();

    const inputEl = fixture.nativeElement.querySelector('input');
    expect(inputEl.getAttribute('aria-invalid')).toBe('true');

    const alertEl = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alertEl).toBeTruthy();
  });
});
