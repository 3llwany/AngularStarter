import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppTag } from './tag';

describe('AppTag', () => {
  let fixture: ComponentFixture<AppTag>;
  let component: AppTag;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTag],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppTag);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'common.status.active');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create and render with regular size by default', () => {
    expect(component).toBeTruthy();
    const tagEl = fixture.nativeElement.querySelector('.p-tag') ?? fixture.nativeElement.querySelector('span');
    expect(tagEl).toBeTruthy();
    expect(tagEl.classList.contains('rounded-full')).toBe(true);
    expect(tagEl.classList.contains('text-xs')).toBe(true);
  });

  it('renders with dot indicator when showDot is true', async () => {
    fixture.componentRef.setInput('showDot', true);
    fixture.componentRef.setInput('tone', 'success');
    fixture.detectChanges();
    await fixture.whenStable();

    const dot = fixture.nativeElement.querySelector('.w-1\\.5');
    expect(dot).toBeTruthy();
    expect(dot.classList.contains('bg-[#13795b]')).toBe(true);
  });
});
