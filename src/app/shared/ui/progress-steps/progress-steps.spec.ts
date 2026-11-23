import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProgressSteps, StepItem } from './progress-steps';

describe('AppProgressSteps', () => {
  let fixture: ComponentFixture<AppProgressSteps>;
  let component: AppProgressSteps;

  const mockSteps: StepItem[] = [
    { id: '1', label: 'common.steps.step1', status: 'completed' },
    { id: '2', label: 'common.steps.step2', status: 'active' },
    { id: '3', label: 'common.steps.step3', status: 'upcoming' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppProgressSteps],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppProgressSteps);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('steps', mockSteps);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders all step items', () => {
    expect(component).toBeTruthy();
    const steps = fixture.nativeElement.querySelectorAll('p-step');
    expect(steps.length).toBe(3);
  });

  it('marks active step with aria-current="step"', () => {
    const activeItem = fixture.nativeElement.querySelector('[aria-current="step"]');
    expect(activeItem).toBeTruthy();
    expect(activeItem.textContent).toContain('common.steps.step2');
  });

  it('calculates activeValue correctly', () => {
    expect(component.activeValue()).toBe(2);
  });
});
