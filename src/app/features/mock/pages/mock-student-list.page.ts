import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  AppButton,
  AppCard,
  AppTable,
  AppTableColDirective,
  ConfirmService,
  TableColumn,
  ToastService,
} from '../../../shared/ui';
import { StudentStore } from '../data-access/student.store';
import {
  MockCreateStudentDto,
  MockStudent,
  MockStudentGrade,
  MockStudentStatus,
  MockUpdateStudentDto,
} from '../models/student.model';
import { StudentDetailsDialogComponent } from '../ui/student-details-dialog.component';
import { StudentFormDialogComponent } from '../ui/student-form-dialog.component';

@Component({
  selector: 'app-mock-student-list-page',
  imports: [
    FormsModule,
    TranslatePipe,
    AppCard,
    AppButton,
    AppTable,
    AppTableColDirective,
    StudentFormDialogComponent,
    StudentDetailsDialogComponent,
  ],
  templateUrl: './mock-student-list.page.html',
})
export class MockStudentListPageComponent implements OnInit {
  protected readonly store = inject(StudentStore);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);

  protected readonly formDialogOpen = signal(false);
  protected readonly editingStudent = signal<MockStudent | null>(null);

  protected readonly detailsDialogOpen = signal(false);
  protected readonly selectedStudentForDetails = signal<MockStudent | null>(null);

  protected readonly columns: TableColumn[] = [
    {
      header: 'mock.students.table.name',
      prop: 'name',
      isDynamic: true,
      sortable: true,
      headerStyleClass: 'w-64 min-w-56',
      styleClass: 'w-64 min-w-56',
    },
    {
      header: 'mock.students.table.contact',
      prop: 'phone',
      sortable: false,
      headerStyleClass: 'w-40 min-w-36',
      styleClass: 'w-40 min-w-36 font-mono text-xs text-surface-600',
    },
    {
      header: 'mock.students.table.grade',
      prop: 'grade',
      isDynamic: true,
      sortable: true,
      headerStyleClass: 'w-36 min-w-32',
      styleClass: 'w-36 min-w-32',
    },
    {
      header: 'mock.students.table.gpa',
      prop: 'gpa',
      isDynamic: true,
      sortable: true,
      headerStyleClass: 'w-24 text-center',
      styleClass: 'w-24 text-center',
    },
    {
      header: 'mock.students.table.enrollment_date',
      prop: 'enrollmentDate',
      sortable: true,
      headerStyleClass: 'w-32 min-w-28 text-center',
      styleClass: 'w-32 min-w-28 text-center text-surface-500 font-medium',
    },
    {
      header: 'mock.students.table.status',
      prop: 'status',
      isDynamic: true,
      sortable: true,
      headerStyleClass: 'w-28 text-center',
      styleClass: 'w-28 text-center',
    },
    {
      header: 'mock.students.table.actions',
      prop: 'actions',
      isDynamic: true,
      sortable: false,
      headerStyleClass: 'w-32 text-end',
      styleClass: 'w-32 text-end',
    },
  ];

  ngOnInit(): void {
    void this.store.loadAll();
  }

  protected openCreate(): void {
    this.editingStudent.set(null);
    this.formDialogOpen.set(true);
  }

  protected openEdit(student: MockStudent): void {
    this.editingStudent.set(student);
    this.formDialogOpen.set(true);
  }

  protected openDetails(student: MockStudent): void {
    this.selectedStudentForDetails.set(student);
    this.detailsDialogOpen.set(true);
  }

  protected onGradeFilterChange(value: string): void {
    this.store.setFilter({ grade: value as MockStudentGrade | 'all' });
  }

  protected onStatusFilterChange(value: string): void {
    this.store.setFilter({ status: value as MockStudentStatus | 'all' });
  }

  protected async onSaveStudent(dto: MockCreateStudentDto | MockUpdateStudentDto): Promise<void> {
    if ('id' in dto && dto.id) {
      await this.store.updateStudent(dto.id, dto);
      await this.toastService.success('mock.students.toast.update_success');
    } else {
      await this.store.createStudent(dto as MockCreateStudentDto);
      await this.toastService.success('mock.students.toast.create_success');
    }
    this.formDialogOpen.set(false);
  }

  protected async confirmDelete(student: MockStudent): Promise<void> {
    const confirmed = await this.confirmService.delete(student.name, {
      message: 'mock.students.delete_confirm.message',
      header: 'mock.students.delete_confirm.title',
    });
    if (confirmed) {
      await this.store.deleteStudent(student.id);
      await this.toastService.success('mock.students.toast.delete_success');
    }
  }
}
