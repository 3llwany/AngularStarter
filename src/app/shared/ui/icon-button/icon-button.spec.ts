import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppIconButton } from './icon-button';

describe('AppIconButton', () => {
  let fixture: ComponentFixture<AppIconButton>;
  let component: AppIconButton;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppIconButton],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppIconButton);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('ariaLabel', 'common.actions.close');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders circle shape and medium 44px size by default', () => {
    expect(component).toBeTruthy();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('rounded-full')).toBe(true);
    expect(btn.classList.contains('h-11')).toBe(true);
    expect(btn.classList.contains('w-11')).toBe(true);
  });

  it('supports square shape and small size with touch target expansion', async () => {
    fixture.componentRef.setInput('shape', 'square');
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('rounded-xl')).toBe(true);
    expect(btn.classList.contains('h-9')).toBe(true);
    expect(btn.classList.contains('w-9')).toBe(true);

    const hitArea = fixture.nativeElement.querySelector('span[aria-hidden="true"]');
    expect(hitArea).toBeTruthy();
  });
});
