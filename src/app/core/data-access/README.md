# دليل استخدام `BaseRepository` (`src/app/core/data-access/`)

يوفر `BaseRepository<TEntity, TId, TCreateDto, TUpdateDto>` كل عمليات الـ CRUD مع فك تلقائي لغلاف الريسبونس الموحد (`IResponse` و `IResponseList`) ودعم كامل لـ `httpResource`.

---

## 1. المسارات الافتراضية (`DEFAULT_REPOSITORY_ENDPOINTS`)

عند تحديد `protected readonly endpoint = '/students'`، يبني المستودع الروابط تلقائياً كالتالي:

| الدالة | نوع الطلب | الرابط الناتج افتراضياً | ما تعيده |
|---|---|---|---|
| `getAll(options?)` | `GET` | `/students/GetAll` | `Observable<TEntity[]>` (بعد فك `res.data`) |
| `getPaginated(options?)` | `GET` | `/students/GetList` | `Observable<PaginatedResult<TEntity[]>>` (`{ data, meta }`) |
| `getById(id, options?)` | `GET` | `/students/GetById/:id` | `Observable<TEntity>` |
| `create(dto, options?)` | `POST` | `/students/Create` | `Observable<TEntity>` |
| `update(id, dto, options?)` | `PUT` | `/students/Edit/:id` | `Observable<TEntity>` |
| `update(dto, options?)` | `PUT` | `/students/Edit` | `Observable<TEntity>` |
| `patch(id, dto, options?)` | `PATCH` | `/students/Patch/:id` | `Observable<TEntity>` |
| `patch(dto, options?)` | `PATCH` | `/students/Patch` | `Observable<TEntity>` |
| `delete(id, options?)` | `DELETE` | `/students/Delete/:id` | `Observable<void>` |
| `delete(options?)` | `DELETE` | `/students/Delete` | `Observable<void>` |
| `resourceAll()` | `GET` | `/students/GetAll` | `HttpResourceRef<TEntity[] \| undefined>` |
| `resourceById(() => id)` | `GET` | `/students/GetById/:id` | `HttpResourceRef<TEntity \| undefined>` |

### إشارات التحميل الجاهزة داخل كل مستودع
لا تحتاج كتابة `signal(false)` أو `try..finally` لسبينر الأزرار؛ فكل مستودع يرث من `BaseRepository` يمتلك هذه الإشارات تلقائياً:
- `repo.isLoading()`: تصبح `true` تلقائياً أثناء `getAll` / `getPaginated` / `getById`.
- `repo.isSaving()`: تصبح `true` تلقائياً أثناء `create` / `update` / `patch` — اربطها مباشرة بزرار الحفظ:
  ```html
  <app-button [loading]="studentRepo.isSaving()" label="common.actions.submit" (onClick)="save()" />
  ```
- `repo.isDeleting()`: تصبح `true` تلقائياً أثناء `delete`.

---

## 2. حالات الاستخدام في الميزات (Features)

### الحالة 1: الخدمة مطابقة للافتراضي (`GetAll`, `GetList`, `Create`, `Edit`, `Delete`)
لا تحتاج كتابة أي شيء سوى `endpoint`:

```typescript
@Service()
export class StudentRepository extends BaseRepository<Student> {
  protected readonly endpoint = '/students';
}
```

### الحالة 2: تغيير اسم عملية واحدة أو أكثر (`override readonly endpoints`)
اكتب فقط العمليات التي يختلف اسمها في الـ Backend، وباقي العمليات تستمر على الافتراضي:

```typescript
@Service()
export class TeacherRepository extends BaseRepository<Teacher> {
  protected readonly endpoint = '/teachers';

  protected override readonly endpoints: Partial<RepositoryEndpoints> = {
    getAll: 'GetAllActiveTeachers', // -> GET /teachers/GetAllActiveTeachers
    create: 'AddTeacher',           // -> POST /teachers/AddTeacher
  };
}
```

### الحالة 3: إزالة اللاحقة (REST قياسي بدون Action name)
ضع نصاً فارغاً `''` للعملية المطلوبة:

```typescript
@Service()
export class CourseRepository extends BaseRepository<Course> {
  protected readonly endpoint = '/courses';

  protected override readonly endpoints: Partial<RepositoryEndpoints> = {
    getAll: '', // -> GET /courses
    create: '', // -> POST /courses
  };
}
```

### الحالة 4: طرق استدعاء `update` و `delete` الثلاث
يدعم `BaseRepository` كل الأنماط الشائعة في الـ Backend تلقائياً:

```typescript
// 1. المعرّف في الرابط (Path): PUT /students/Edit/std-101
this.studentRepo.update('std-101', dto);
this.studentRepo.delete('std-101');

// 2. المعرّف داخل جسم الطلب (Body): PUT /students/Edit
this.studentRepo.update({ id: 'std-101', ...dto });

// 3. المعرّف ضمن Query Params في الـ options: PUT /students/Edit?id=std-101
this.studentRepo.update(dto, { params: { id: 'std-101' } });
this.studentRepo.delete({ params: { id: 'std-101' } });
```

### الحالة 5: إضافة دوال مخصصة (Custom Endpoints)
عند الحاجة لطلب خاص غير موجود في الـ CRUD، استخدم `this.api` (التي تفك `IResponse` تلقائياً) مع `trackLoading` أو `trackSaving`:

```typescript
@Service()
export class StudentRepository extends BaseRepository<Student> {
  protected readonly endpoint = '/students';

  getTopStudents(): Observable<Student[]> {
    return this.trackLoading(this.api.get<Student[]>(`${this.endpoint}/GetTop`));
  }

  promoteStudent(id: string): Observable<void> {
    return this.trackSaving(this.api.post<void>(`${this.endpoint}/Promote`, { id }));
  }
}
```

---

## 3. الفرق بين `resourceById` و `getById`

| المقارنة | `resourceById(() => this.id())` | `getById(id)` |
|---|---|---|
| **النوع المُرجَع** | `HttpResourceRef<T \| undefined>` | `Observable<T>` |
| **آلية التشغيل** | تفاعلية (Reactive): تراقب الإشارة وتعيد الجلب تلقائياً عند تغيرها، وتلغي الطلب القديم عند الخروج بدون `subscribe` أو `takeUntilDestroyed` | يدوية (Imperative): تُستدعى عند الحاجة بـ `subscribe` أو `firstValueFrom` |
| **حالة التحميل** | توفر `.isLoading()` تلقائياً لعرض الـ Skeleton في القالب | تُدار يدوياً (مثل `signal(false)` لسبينر زر) |
| **متى تستخدم؟** | لعرض البيانات والـ Skeleton في الشاشات وداخل `SignalStore` (`withProps`) | عند تنفيذ إجراء بزر (مثل جلب صف للتعديل قبل فتح Dialog) |
