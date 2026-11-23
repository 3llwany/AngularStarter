import { Component, computed, input, linkedSignal, model, output } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { AppButton, AppDatepicker, AppDialog, AppInput, AppSelect, AppSwitch } from '@shared/ui';
import {
  MockCreateStudentDto,
  MockStudent,
  MockStudentGrade,
  MockUpdateStudentDto,
} from '../models/student.model';

interface GradeOption {
  readonly label: string;
  readonly value: MockStudentGrade;
}

@Component({
  selector: 'app-student-form-dialog',
  imports: [TranslatePipe, AppDialog, AppInput, AppSelect, AppDatepicker, AppSwitch, AppButton],
  templateUrl: './student-form-dialog.component.html',
})
export class StudentFormDialogComponent {
  readonly visible = model<boolean>(false);
  readonly student = input<MockStudent | null>(null);
  readonly saving = input<boolean>(false);
  readonly save = output<MockCreateStudentDto | MockUpdateStudentDto>();

  private readonly addTitleKey = 'mock.students.form.add_title';
  private readonly editTitleKey = 'mock.students.form.edit_title';
  protected readonly headerKey = computed(() =>
    this.student() ? this.editTitleKey : this.addTitleKey,
  );

  protected readonly gradeOptions: GradeOption[] = [
    { label: 'mock.students.grades.first_sec', value: 'first_sec' },
    { label: 'mock.students.grades.second_sec', value: 'second_sec' },
    { label: 'mock.students.grades.third_sec', value: 'third_sec' },
  ];

  protected readonly formModel = linkedSignal(() => {
    const s = this.student();
    if (s) {
      return {
        name: s.name,
        email: s.email,
        phone: s.phone,
        grade: s.grade,
        enrollmentDate: new Date(s.enrollmentDate),
        gpa: String(s.gpa),
        status: s.status === 'active',
      };
    }
    return {
      name: '',
      email: '',
      phone: '',
      grade: 'first_sec' as MockStudentGrade,
      enrollmentDate: new Date(),
      gpa: '3.50',
      status: true,
    };
  });

  protected readonly studentForm = form(this.formModel, (f) => {
    required(f.name);
    required(f.email);
    required(f.phone);
    required(f.grade);
    required(f.gpa);
  });

  protected onSubmit(): void {
    const raw = this.formModel();
    const isEdit = !!this.student();
    const dateStr =
      raw.enrollmentDate instanceof Date
        ? raw.enrollmentDate.toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

    const parsedGpa = parseFloat(raw.gpa);
    const finalGpa = !isNaN(parsedGpa) ? parsedGpa : 3.0;

    if (isEdit && this.student()) {
      this.save.emit({
        id: this.student()!.id,
        name: raw.name.trim(),
        email: raw.email.trim(),
        phone: raw.phone.trim(),
        grade: raw.grade,
        enrollmentDate: dateStr,
        gpa: finalGpa,
        status: raw.status ? 'active' : 'inactive',
      });
    } else {
      this.save.emit({
        name: raw.name.trim(),
        email: raw.email.trim(),
        phone: raw.phone.trim(),
        grade: raw.grade,
        enrollmentDate: dateStr,
        gpa: finalGpa,
        status: raw.status ? 'active' : 'inactive',
      });
    }
  }
}
