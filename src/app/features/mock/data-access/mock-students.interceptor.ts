import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { IMetaModel, IResponse, IResponseList, MESSAGE_TYPES } from '@core/http';
import { MockCreateStudentDto, MockStudent, MockUpdateStudentDto } from '../models/student.model';

const INITIAL_STUDENTS: MockStudent[] = [
  {
    id: 'std-1',
    name: 'أحمد محمود علي',
    email: 'ahmed.ali@example.com',
    phone: '01012345671',
    grade: 'first_sec',
    enrollmentDate: '2024-09-15',
    gpa: 3.85,
    status: 'active',
    enrolledCoursesCount: 6,
  },
  {
    id: 'std-2',
    name: 'سارة حسن إبراهيم',
    email: 'sara.hassan@example.com',
    phone: '01123456782',
    grade: 'third_sec',
    enrollmentDate: '2022-09-20',
    gpa: 3.95,
    status: 'active',
    enrolledCoursesCount: 8,
  },
  {
    id: 'std-3',
    name: 'عمر خالد الشريف',
    email: 'omar.khaled@example.com',
    phone: '01234567893',
    grade: 'second_sec',
    enrollmentDate: '2023-09-18',
    gpa: 3.4,
    status: 'active',
    enrolledCoursesCount: 7,
  },
  {
    id: 'std-4',
    name: 'مريم يوسف عبد الرحمن',
    email: 'mariam.youssef@example.com',
    phone: '01545678904',
    grade: 'first_sec',
    enrollmentDate: '2024-09-15',
    gpa: 3.7,
    status: 'inactive',
    enrolledCoursesCount: 5,
  },
  {
    id: 'std-5',
    name: 'كريم عبد العزيز مصطفى',
    email: 'karim.mostafa@example.com',
    phone: '01098765435',
    grade: 'third_sec',
    enrollmentDate: '2022-09-20',
    gpa: 3.6,
    status: 'active',
    enrolledCoursesCount: 8,
  },
  {
    id: 'std-6',
    name: 'فاطمة طارق النجار',
    email: 'fatma.tareq@example.com',
    phone: '01187654326',
    grade: 'second_sec',
    enrollmentDate: '2023-09-18',
    gpa: 3.9,
    status: 'active',
    enrolledCoursesCount: 7,
  },
  {
    id: 'std-7',
    name: 'يوسف إيهاب زهران',
    email: 'youssef.zahran@example.com',
    phone: '01276543217',
    grade: 'first_sec',
    enrollmentDate: '2024-09-15',
    gpa: 2.95,
    status: 'active',
    enrolledCoursesCount: 6,
  },
  {
    id: 'std-8',
    name: 'نور الدين سمير رضوان',
    email: 'nour.radwan@example.com',
    phone: '01565432108',
    grade: 'third_sec',
    enrollmentDate: '2022-09-20',
    gpa: 3.25,
    status: 'inactive',
    enrolledCoursesCount: 7,
  },
  {
    id: 'std-9',
    name: 'هنا عمرو الجندي',
    email: 'hana.elgendy@example.com',
    phone: '01054321099',
    grade: 'second_sec',
    enrollmentDate: '2023-09-18',
    gpa: 3.98,
    status: 'active',
    enrolledCoursesCount: 8,
  },
  {
    id: 'std-10',
    name: 'زياد شريف العوضي',
    email: 'ziad.elawady@example.com',
    phone: '01143210980',
    grade: 'first_sec',
    enrollmentDate: '2024-09-15',
    gpa: 3.15,
    status: 'active',
    enrolledCoursesCount: 6,
  },
];

let studentsDatabase: MockStudent[] = [...INITIAL_STUDENTS];

function wrapResponse<T>(data: T, status = 200): HttpResponse<IResponse<T>> {
  const envelope: IResponse<T> = {
    message: {
      messageType: MESSAGE_TYPES.Success,
      messageTypeName: 'Success',
      messages: [{ code: status, message: 'Operation completed successfully.' }],
    },
    data,
  };
  return new HttpResponse({ status, body: envelope });
}

function wrapListResponse<T>(
  data: T,
  meta: IMetaModel,
  status = 200,
): HttpResponse<IResponseList<T>> {
  const envelope: IResponseList<T> = {
    message: {
      messageType: MESSAGE_TYPES.Success,
      messageTypeName: 'Success',
      messages: [{ code: status, message: 'Operation completed successfully.' }],
    },
    data,
    meta,
  };
  return new HttpResponse({ status, body: envelope });
}

/**
 * Interceptor يعترض طلبات `mock/students` ويعيد بيانات واقعية في الذاكرة
 * متوافقة تماماً مع غلاف `IResponse` و `BaseRepository`.
 */
export const mockStudentsInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const url = req.url;

  if (!url.includes('mock/students')) {
    return next(req);
  }

  // 1. GET ALL
  if (req.method === 'GET' && url.endsWith('mock/students/GetAll')) {
    return of(wrapResponse([...studentsDatabase])).pipe(delay(150));
  }

  // 2. GET PAGINATED
  if (req.method === 'GET' && url.includes('mock/students/GetList')) {
    const pageIndex = Number(req.params.get('pageIndex') ?? '0');
    const pageSize = Number(req.params.get('pageSize') ?? '10');
    const start = pageIndex * pageSize;
    const items = studentsDatabase.slice(start, start + pageSize);

    const meta: IMetaModel = {
      pageCount: Math.ceil(studentsDatabase.length / pageSize),
      totalItemCount: studentsDatabase.length,
      pageNumber: pageIndex + 1,
      pageSize,
      hasPreviousPage: pageIndex > 0,
      hasNextPage: start + pageSize < studentsDatabase.length,
      isFirstPage: pageIndex === 0,
      isLastPage: start + pageSize >= studentsDatabase.length,
      firstItemOnPage: start + 1,
      lastItemOnPage: Math.min(start + pageSize, studentsDatabase.length),
    };

    return of(wrapListResponse(items, meta)).pipe(delay(150));
  }

  // 3. GET BY ID
  if (req.method === 'GET' && url.includes('mock/students/GetById/')) {
    const id = url.split('/').pop() ?? '';
    const student = studentsDatabase.find((s) => s.id === id);
    if (!student) {
      return of(new HttpResponse({ status: 404, body: null })).pipe(delay(100));
    }
    return of(wrapResponse({ ...student })).pipe(delay(120));
  }

  // 4. CREATE
  if (req.method === 'POST' && url.endsWith('mock/students/Create')) {
    const dto = req.body as MockCreateStudentDto;
    const newStudent: MockStudent = {
      id: `std-${Date.now()}`,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      grade: dto.grade,
      enrollmentDate: dto.enrollmentDate,
      gpa: dto.gpa,
      status: dto.status,
      enrolledCoursesCount: 6,
    };
    studentsDatabase = [newStudent, ...studentsDatabase];
    return of(wrapResponse(newStudent, 201)).pipe(delay(200));
  }

  // 5. UPDATE / EDIT
  if (req.method === 'PUT' && url.includes('mock/students/Edit')) {
    const parts = url.split('/');
    const pathId = parts[parts.length - 1];
    const dto = req.body as MockUpdateStudentDto;
    const targetId = pathId !== 'Edit' ? pathId : dto.id;

    const index = studentsDatabase.findIndex((s) => s.id === targetId);
    if (index === -1) {
      return of(new HttpResponse({ status: 404, body: null })).pipe(delay(100));
    }

    const updated: MockStudent = {
      ...studentsDatabase[index]!,
      ...dto,
    };
    studentsDatabase[index] = updated;
    return of(wrapResponse(updated)).pipe(delay(200));
  }

  // 6. DELETE
  if (req.method === 'DELETE' && url.includes('mock/students/Delete/')) {
    const id = url.split('/').pop() ?? '';
    studentsDatabase = studentsDatabase.filter((s) => s.id !== id);
    return of(wrapResponse(null)).pipe(delay(180));
  }

  return next(req);
};
