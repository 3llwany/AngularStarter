import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppDividerOr } from './divider-or';

describe('AppDividerOr', () => {
  let fixture: ComponentFixture<AppDividerOr>;
  let component: AppDividerOr;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDividerOr],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppDividerOr);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders separator with default textKey', () => {
    expect(component).toBeTruthy();
    const sep = fixture.nativeElement.querySelector('[role="separator"]');
    expect(sep).toBeTruthy();
  });
});
