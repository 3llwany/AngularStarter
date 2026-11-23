import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppBanner } from './banner';

describe('AppBanner', () => {
  let fixture: ComponentFixture<AppBanner>;
  let component: AppBanner;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBanner],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppBanner);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'common.info');
    fixture.componentRef.setInput('description', 'common.description');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders with info tone by default', () => {
    expect(component).toBeTruthy();
    const banner = fixture.nativeElement.querySelector('[role="region"]');
    expect(banner.classList.contains('bg-primary-50')).toBe(true);
  });

  it('renders dismiss button when dismissible is true', async () => {
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();
  });
});
