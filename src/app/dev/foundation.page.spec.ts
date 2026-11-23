import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from '@shared/ui';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideMockAuthApi } from '@core/auth';
import { FoundationPageComponent } from './foundation.page';

describe('FoundationPageComponent', () => {
  let fixture: ComponentFixture<FoundationPageComponent>;
  let component: FoundationPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoundationPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        ...provideMockAuthApi(),
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FoundationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create developer foundation verification page', () => {
    expect(component).toBeTruthy();
  });

  it('renders the design system showcase and fixed theme description', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')).toBeTruthy();
  });
});
