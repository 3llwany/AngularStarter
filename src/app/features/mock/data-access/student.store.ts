import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { MockCreateStudentDto, MockStudent, MockStudentFilter, MockUpdateStudentDto } from '../models/student.model';
import { StudentRepository } from './student.repository';

export interface StudentState {
  readonly students: readonly MockStudent[];
  readonly selectedStudent: MockStudent | null;
  readonly filter: MockStudentFilter;
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly error: string | null;
}

const initialState: StudentState = {
  students: [],
  selectedStudent: null,
  filter: {
    searchQuery: '',
    grade: 'all',
    status: 'all',
  },
  pageIndex: 0,
  pageSize: 10,
  isLoading: false,
  isSaving: false,
  error: null,
};

/**
 * مخزن إدارة حالة الطلاب (StudentStore):
 * يعتمد على `@ngrx/signals` (SignalStore) لإدارة الحالة بشكل تفاعلي غير متزامن.
 */
export const StudentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ students, filter, pageIndex, pageSize }) => {
    const filteredStudents = computed(() => {
      const all = students();
      const query = filter.searchQuery().trim().toLowerCase();
      const grade = filter.grade();
      const status = filter.status();

      return all.filter((s) => {
        const matchesQuery =
          !query ||
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.phone.includes(query);
        const matchesGrade = grade === 'all' || s.grade === grade;
        const matchesStatus = status === 'all' || s.status === status;
        return matchesQuery && matchesGrade && matchesStatus;
      });
    });

    const activeCount = computed(() => students().filter((s) => s.status === 'active').length);
    const inactiveCount = computed(() => students().filter((s) => s.status === 'inactive').length);
    const averageGpa = computed(() => {
      const list = students();
      if (list.length === 0) return 0;
      const sum = list.reduce((acc, s) => acc + s.gpa, 0);
      return Number((sum / list.length).toFixed(2));
    });

    const pagedStudents = computed(() => {
      const list = filteredStudents();
      const start = pageIndex() * pageSize();
      return list.slice(start, start + pageSize());
    });

    return {
      filteredStudents,
      pagedStudents,
      totalCount: computed(() => students().length),
      filteredTotal: computed(() => filteredStudents().length),
      activeCount,
      inactiveCount,
      averageGpa,
    };
  }),
  withMethods((store, repo = inject(StudentRepository)) => ({
    async loadAll(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const students = await firstValueFrom(repo.getAll());
        patchState(store, { students, isLoading: false });
      } catch (err) {
        patchState(store, {
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load students',
        });
      }
    },

    async createStudent(dto: MockCreateStudentDto): Promise<MockStudent> {
      patchState(store, { isSaving: true, error: null });
      try {
        const created = await firstValueFrom(repo.create(dto));
        patchState(store, (state) => ({
          students: [created, ...state.students],
          isSaving: false,
        }));
        return created;
      } catch (err) {
        patchState(store, {
          isSaving: false,
          error: err instanceof Error ? err.message : 'Failed to create student',
        });
        throw err;
      }
    },

    async updateStudent(id: string, dto: MockUpdateStudentDto): Promise<MockStudent> {
      patchState(store, { isSaving: true, error: null });
      try {
        const updated = await firstValueFrom(repo.update(id, dto));
        patchState(store, (state) => ({
          students: state.students.map((s) => (s.id === id ? updated : s)),
          selectedStudent: state.selectedStudent?.id === id ? updated : state.selectedStudent,
          isSaving: false,
        }));
        return updated;
      } catch (err) {
        patchState(store, {
          isSaving: false,
          error: err instanceof Error ? err.message : 'Failed to update student',
        });
        throw err;
      }
    },

    async deleteStudent(id: string): Promise<void> {
      patchState(store, { isSaving: true, error: null });
      try {
        await firstValueFrom(repo.delete(id));
        patchState(store, (state) => ({
          students: state.students.filter((s) => s.id !== id),
          selectedStudent: state.selectedStudent?.id === id ? null : state.selectedStudent,
          isSaving: false,
        }));
      } catch (err) {
        patchState(store, {
          isSaving: false,
          error: err instanceof Error ? err.message : 'Failed to delete student',
        });
        throw err;
      }
    },

    selectStudent(student: MockStudent | null): void {
      patchState(store, { selectedStudent: student });
    },

    setFilter(filter: Partial<MockStudentFilter>): void {
      patchState(store, (state) => ({
        filter: { ...state.filter, ...filter },
        pageIndex: 0,
      }));
    },

    setPage(pageIndex: number, pageSize: number): void {
      patchState(store, { pageIndex, pageSize });
    },
  })),
);
