import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockStudentsInterceptor } from './data-access/mock-students.interceptor';
import { StudentRepository } from './data-access/student.repository';
import { StudentStore } from './data-access/student.store';
import { CreateStudentDto } from './models/student.model';

describe('Mock Student Feature (Angular 22 Showcase)', () => {
  let store: InstanceType<typeof StudentStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockStudentsInterceptor])),
        StudentRepository,
        StudentStore,
      ],
    });

    store = TestBed.inject(StudentStore);
  });

  it('should initialize with default state', () => {
    expect(store.students()).toEqual([]);
    expect(store.isLoading()).toBe(false);
    expect(store.filter.grade()).toBe('all');
    expect(store.filter.status()).toBe('all');
    expect(store.filter.searchQuery()).toBe('');
  });

  it('should load all students via repository and mock interceptor', async () => {
    await store.loadAll();

    expect(store.students().length).toBeGreaterThanOrEqual(10);
    expect(store.totalCount()).toBe(store.students().length);
    expect(store.isLoading()).toBe(false);
    expect(store.averageGpa()).toBeGreaterThan(0);
    expect(store.activeCount()).toBeGreaterThan(0);
  });

  it('should filter students by search query, grade, and status', async () => {
    await store.loadAll();

    store.setFilter({ searchQuery: 'أحمد' });
    expect(store.filteredStudents().every((s) => s.name.includes('أحمد'))).toBe(true);

    store.setFilter({ searchQuery: '', grade: 'first_sec' });
    expect(store.filteredStudents().every((s) => s.grade === 'first_sec')).toBe(true);

    store.setFilter({ status: 'active' });
    expect(store.filteredStudents().every((s) => s.status === 'active')).toBe(true);
  });

  it('should create a new student and prepend to store', async () => {
    await store.loadAll();
    const initialCount = store.students().length;

    const newStudentDto: CreateStudentDto = {
      name: 'محمود سامي البارودي',
      email: 'mahmoud.baroudi@example.com',
      phone: '01099887766',
      grade: 'third_sec',
      enrollmentDate: '2024-10-01',
      gpa: 3.92,
      status: 'active',
    };

    const created = await store.createStudent(newStudentDto);

    expect(created.id).toBeDefined();
    expect(created.name).toBe(newStudentDto.name);
    expect(store.students().length).toBe(initialCount + 1);
    expect(store.students()[0]?.id).toBe(created.id);
  });

  it('should update an existing student in store', async () => {
    await store.loadAll();
    const target = store.students()[0];
    expect(target).toBeDefined();
    if (!target) return;

    const updated = await store.updateStudent(target.id, {
      id: target.id,
      name: 'اسم محدث للتجربة',
      gpa: 4.0,
    });

    expect(updated.name).toBe('اسم محدث للتجربة');
    expect(updated.gpa).toBe(4.0);
    expect(store.students().find((s) => s.id === target.id)?.name).toBe('اسم محدث للتجربة');
  });

  it('should delete a student from store', async () => {
    await store.loadAll();
    const initialCount = store.students().length;
    const target = store.students()[0];
    expect(target).toBeDefined();
    if (!target) return;

    await store.deleteStudent(target.id);

    expect(store.students().length).toBe(initialCount - 1);
    expect(store.students().some((s) => s.id === target.id)).toBe(false);
  });

  it('should handle pagination correctly', async () => {
    await store.loadAll();
    store.setPage(0, 5);

    expect(store.pagedStudents().length).toBe(5);

    store.setPage(1, 5);
    expect(store.pagedStudents().length).toBe(5);
  });
});
