/** المراحل الدراسية للطلاب في البيئة التجريبية. */
export type MockStudentGrade = 'first_sec' | 'second_sec' | 'third_sec';

/** حالة حساب الطالب. */
export type MockStudentStatus = 'active' | 'inactive';

/** كيان الطالب في نطاق العمل. */
export interface MockStudent {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly grade: MockStudentGrade;
  readonly enrollmentDate: string;
  readonly gpa: number;
  readonly status: MockStudentStatus;
  readonly avatar?: string;
  readonly enrolledCoursesCount: number;
}

/** نموذج بيانات إضافة طالب جديد. */
export interface MockCreateStudentDto {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly grade: MockStudentGrade;
  readonly enrollmentDate: string;
  readonly gpa: number;
  readonly status: MockStudentStatus;
}

/** نموذج بيانات تعديل طالب قائم. */
export interface MockUpdateStudentDto {
  readonly id: string;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly grade?: MockStudentGrade;
  readonly enrollmentDate?: string;
  readonly gpa?: number;
  readonly status?: MockStudentStatus;
}

/** معايير تصفية قائمة الطلاب. */
export interface MockStudentFilter {
  readonly searchQuery: string;
  readonly grade: MockStudentGrade | 'all';
  readonly status: MockStudentStatus | 'all';
}

export type StudentGrade = MockStudentGrade;
export type StudentStatus = MockStudentStatus;
export type Student = MockStudent;
export type CreateStudentDto = MockCreateStudentDto;
export type UpdateStudentDto = MockUpdateStudentDto;
export type StudentFilter = MockStudentFilter;
