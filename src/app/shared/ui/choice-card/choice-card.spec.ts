import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppChoiceCard } from './choice-card';

describe('AppChoiceCard', () => {
  let fixture: ComponentFixture<AppChoiceCard>;
  let component: AppChoiceCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppChoiceCard],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppChoiceCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'common.plan.title');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders unselected by default', () => {
    expect(component).toBeTruthy();
    const card = fixture.nativeElement.querySelector('[role="radio"]');
    expect(card.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles to selected on click and emits onSelect', async () => {
    let emitted = false;
    component.onSelect.subscribe((val) => {
      emitted = val;
    });

    const card = fixture.nativeElement.querySelector('[role="radio"]');
    card.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.selected()).toBe(true);
    expect(emitted).toBe(true);
    expect(card.getAttribute('aria-checked')).toBe('true');
  });
});
