import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppCheckboxCard } from './checkbox-card';

describe('AppCheckboxCard', () => {
  let fixture: ComponentFixture<AppCheckboxCard<unknown>>;
  let component: AppCheckboxCard<unknown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCheckboxCard],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppCheckboxCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'common.item');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders unchecked by default', () => {
    expect(component).toBeTruthy();
    const card = fixture.nativeElement.querySelector('[role="checkbox"]');
    expect(card.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles checked on click and emits onToggle', async () => {
    let emittedVal: boolean | null = null;
    component.onToggle.subscribe((val) => {
      emittedVal = val;
    });

    const card = fixture.nativeElement.querySelector('[role="checkbox"]');
    card.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.checked()).toBe(true);
    expect(emittedVal).toBe(true);
    expect(card.getAttribute('aria-checked')).toBe('true');
  });
});
