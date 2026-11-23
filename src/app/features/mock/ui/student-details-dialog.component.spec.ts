import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { MockStudent } from '../models/student.model';
import { StudentDetailsDialogComponent } from './student-details-dialog.component';

describe('StudentDetailsDialogComponent', () => {
  let fixture: ComponentFixture<StudentDetailsDialogComponent>;
  let component: StudentDetailsDialogComponent;

  const sampleStudent: MockStudent = {
    id: 'std-test-1',
    name: 'طالب تجريبي',
    email: 'test@example.com',
    phone: '01011112222',
    grade: 'first_sec',
    enrollmentDate: '2024-09-01',
    gpa: 3.85,
    status: 'active',
    enrolledCoursesCount: 5,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetailsDialogComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('student', sampleStudent);
    component.visible.set(true);
    await fixture.whenStable();
  });

  it('should render student details when student is set', () => {
    fixture.detectChanges();
    const nameEl = fixture.nativeElement.textContent;
    expect(nameEl).toContain('طالب تجريبي');
    expect(component).toBeTruthy();
  });
});
