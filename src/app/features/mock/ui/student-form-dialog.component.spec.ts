import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { StudentFormDialogComponent } from './student-form-dialog.component';

describe('StudentFormDialogComponent', () => {
  let fixture: ComponentFixture<StudentFormDialogComponent>;
  let component: StudentFormDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFormDialogComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentFormDialogComponent);
    component = fixture.componentInstance;
    component.visible.set(true);
    await fixture.whenStable();
  });

  it('should render form and fields', () => {
    fixture.detectChanges();
    const formEl = fixture.nativeElement.querySelector('form');
    expect(formEl).toBeTruthy();
    expect(component).toBeTruthy();
  });
});
