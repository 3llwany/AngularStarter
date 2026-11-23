import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppLink } from './link';

describe('AppLink', () => {
  let fixture: ComponentFixture<AppLink>;
  let component: AppLink;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLink],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLink);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'common.actions.learn_more');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders primary link by default', () => {
    expect(component).toBeTruthy();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('text-primary-600')).toBe(true);
  });

  it('renders anchor tag when routerLink is provided', async () => {
    fixture.componentRef.setInput('routerLink', '/test');
    fixture.detectChanges();
    await fixture.whenStable();

    const a = fixture.nativeElement.querySelector('a');
    expect(a).toBeTruthy();
  });
});
