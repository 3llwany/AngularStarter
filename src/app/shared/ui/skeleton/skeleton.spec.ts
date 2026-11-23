import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppSkeleton } from './skeleton';

describe('AppSkeleton', () => {
  let fixture: ComponentFixture<AppSkeleton>;
  let component: AppSkeleton;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSkeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSkeleton);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders a line skeleton with pulse animation by default', () => {
    expect(component).toBeTruthy();
    const item = fixture.nativeElement.querySelector('.animate-pulse') ?? fixture.nativeElement.querySelector('.p-skeleton');
    expect(item).toBeTruthy();
    expect(item.classList.contains('rounded-md')).toBe(true);
  });

  it('renders multiple skeleton items when count > 1', async () => {
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();
    await fixture.whenStable();

    const items = fixture.nativeElement.querySelectorAll('.p-skeleton');
    expect(items.length).toBe(3);
  });
});
