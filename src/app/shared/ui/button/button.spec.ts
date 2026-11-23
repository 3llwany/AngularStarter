import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppButton } from './button';

@Component({
  imports: [AppButton],
  template: `
    <app-button
      [label]="label()"
      [variant]="variant()"
      [size]="size()"
      [fullWidth]="fullWidth()"
      [loading]="loading()"
      [loadingTrailing]="loadingTrailing()"
    >
      <span leadingIcon id="test-leading">★</span>
      <span trailingIcon id="test-trailing">→</span>
    </app-button>
  `,
})
class TestHostComponent {
  readonly label = signal('common.actions.confirm');
  readonly variant = signal<'primary' | 'glass' | 'tinted' | 'outlined'>('primary');
  readonly size = signal<'large' | 'medium' | 'small'>('large');
  readonly fullWidth = signal(false);
  readonly loading = signal(false);
  readonly loadingTrailing = signal(false);
}

describe('AppButton', () => {
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

  it('renders with pill radius and large size by default', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn.classList.contains('rounded-full')).toBe(true);
    expect(btn.classList.contains('min-h-[56px]')).toBe(true);
    expect(btn.classList.contains('shadow-glow-lg')).toBe(true);
  });

  it('switches to medium and small sizes correctly', async () => {
    host.size.set('medium');
    fixture.detectChanges();
    await fixture.whenStable();
    let btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('min-h-[44px]')).toBe(true);

    host.size.set('small');
    fixture.detectChanges();
    await fixture.whenStable();
    btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('min-h-[36px]')).toBe(true);
  });

  it('applies glass and tinted variant classes', async () => {
    host.variant.set('glass');
    fixture.detectChanges();
    await fixture.whenStable();
    let btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('glass-surface')).toBe(true);

    host.variant.set('tinted');
    fixture.detectChanges();
    await fixture.whenStable();
    btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('bg-primary-tint')).toBe(true);
  });

  it('respects fullWidth setting', async () => {
    let btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('w-fit')).toBe(true);

    host.fullWidth.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('w-full')).toBe(true);
  });

  it('projects leading and trailing icon slots', () => {
    const leading = fixture.nativeElement.querySelector('#test-leading');
    const trailing = fixture.nativeElement.querySelector('#test-trailing');
    expect(leading).toBeTruthy();
    expect(trailing).toBeTruthy();
  });

  it('renders loading spinner before label by default when loading=true', async () => {
    host.loading.set(true);
    host.loadingTrailing.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    const spinnerStart = fixture.nativeElement.querySelector('[data-testid="loading-spinner-start"]');
    const spinnerEnd = fixture.nativeElement.querySelector('[data-testid="loading-spinner-end"]');
    expect(spinnerStart).toBeTruthy();
    expect(spinnerEnd).toBeNull();
  });

  it('renders loading spinner after label when loadingTrailing=true', async () => {
    host.loading.set(true);
    host.loadingTrailing.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const spinnerStart = fixture.nativeElement.querySelector('[data-testid="loading-spinner-start"]');
    const spinnerEnd = fixture.nativeElement.querySelector('[data-testid="loading-spinner-end"]');
    expect(spinnerStart).toBeNull();
    expect(spinnerEnd).toBeTruthy();
  });
});
