import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Service, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiClient } from '../http/api-client';
import { BaseRepository, RepositoryEndpoints } from './base-repository';

interface StudentEntity {
  readonly id: string;
  readonly name: string;
}

interface CreateStudentDto {
  readonly name: string;
}

interface UpdateStudentDto {
  readonly id?: string;
  readonly name: string;
}

@Service()
class StudentRepositoryTest extends BaseRepository<
  StudentEntity,
  string,
  CreateStudentDto,
  UpdateStudentDto
> {
  protected readonly endpoint = '/students';
}

@Service()
class CustomTeacherRepositoryTest extends BaseRepository<StudentEntity> {
  protected readonly endpoint = '/teachers';
  protected override readonly endpoints: Partial<RepositoryEndpoints> = {
    getAll: 'GetAllActive',
    create: '',
  };
}

describe('BaseRepository', () => {
  let repository: StudentRepositoryTest;
  let customRepository: CustomTeacherRepositoryTest;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentRepositoryTest,
        CustomTeacherRepositoryTest,
        ApiClient,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    repository = TestBed.inject(StudentRepositoryTest);
    customRepository = TestBed.inject(CustomTeacherRepositoryTest);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    TestBed.resetTestingModule();
  });

  it('performs getAll() request against default GetAll endpoint', () => {
    let result: StudentEntity[] | undefined;
    repository.getAll().subscribe((data) => {
      result = data;
    });

    const req = httpTesting.expectOne('/students/GetAll');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1', name: 'Ahmed' }]);

    expect(result).toEqual([{ id: '1', name: 'Ahmed' }]);
  });

  it('performs getById() request against default GetById/:id endpoint', () => {
    let result: StudentEntity | undefined;
    repository.getById('std-123').subscribe((data) => {
      result = data;
    });

    const req = httpTesting.expectOne('/students/GetById/std-123');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'std-123', name: 'Sayed' });

    expect(result).toEqual({ id: 'std-123', name: 'Sayed' });
  });

  it('performs create() request against default Create endpoint', () => {
    let result: StudentEntity | undefined;
    repository.create({ name: 'Ali' }).subscribe((data) => {
      result = data;
    });

    const req = httpTesting.expectOne('/students/Create');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Ali' });
    req.flush({ id: 'new-1', name: 'Ali' });

    expect(result).toEqual({ id: 'new-1', name: 'Ali' });
  });

  it('supports update() with path ID, body ID, or query params', () => {
    let pathResult: StudentEntity | undefined;
    repository.update('std-123', { name: 'Sayed Updated' }).subscribe((data) => {
      pathResult = data;
    });
    const pathReq = httpTesting.expectOne('/students/Edit/std-123');
    expect(pathReq.request.method).toBe('PUT');
    expect(pathReq.request.body).toEqual({ name: 'Sayed Updated' });
    pathReq.flush({ id: 'std-123', name: 'Sayed Updated' });
    expect(pathResult).toEqual({ id: 'std-123', name: 'Sayed Updated' });

    let bodyResult: StudentEntity | undefined;
    repository.update({ id: 'std-456', name: 'Body Updated' }).subscribe((data) => {
      bodyResult = data;
    });
    const bodyReq = httpTesting.expectOne('/students/Edit');
    expect(bodyReq.request.method).toBe('PUT');
    expect(bodyReq.request.body).toEqual({ id: 'std-456', name: 'Body Updated' });
    bodyReq.flush({ id: 'std-456', name: 'Body Updated' });
    expect(bodyResult).toEqual({ id: 'std-456', name: 'Body Updated' });

    repository.update({ name: 'Param Updated' }, { params: { id: 'std-789' } }).subscribe();
    const paramReq = httpTesting.expectOne(
      (r) => r.url === '/students/Edit' && r.params.get('id') === 'std-789',
    );
    expect(paramReq.request.method).toBe('PUT');
    paramReq.flush({ id: 'std-789', name: 'Param Updated' });
  });

  it('performs patch() and delete() with path ID or query params', () => {
    let patched: StudentEntity | undefined;
    repository.patch('std-123', { name: 'Sayed Patched' }).subscribe((data) => {
      patched = data;
    });
    const patchReq = httpTesting.expectOne('/students/Patch/std-123');
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({ id: 'std-123', name: 'Sayed Patched' });
    expect(patched).toEqual({ id: 'std-123', name: 'Sayed Patched' });

    let deletedPath = false;
    repository.delete('std-123').subscribe(() => {
      deletedPath = true;
    });
    const deletePathReq = httpTesting.expectOne('/students/Delete/std-123');
    expect(deletePathReq.request.method).toBe('DELETE');
    deletePathReq.flush(null);
    expect(deletedPath).toBe(true);

    let deletedParam = false;
    repository.delete({ params: { id: 'std-123' } }).subscribe(() => {
      deletedParam = true;
    });
    const deleteParamReq = httpTesting.expectOne(
      (r) => r.url === '/students/Delete' && r.params.get('id') === 'std-123',
    );
    expect(deleteParamReq.request.method).toBe('DELETE');
    deleteParamReq.flush(null);
    expect(deletedParam).toBe(true);
  });

  it('supports overriding individual action endpoints per repository', () => {
    customRepository.getAll().subscribe();
    expect(httpTesting.expectOne('/teachers/GetAllActive').request.method).toBe('GET');

    customRepository.create({ name: 'Nour' }).subscribe();
    expect(httpTesting.expectOne('/teachers').request.method).toBe('POST');

    customRepository.delete('t-1').subscribe();
    expect(httpTesting.expectOne('/teachers/Delete/t-1').request.method).toBe('DELETE');
  });

  it('provides reactive resourceById() signal resource and unwraps IResponse envelopes', async () => {
    const selectedId = signal<string | undefined>('std-999');
    const res = repository.resourceById(() => selectedId());

    TestBed.flushEffects();

    const req = httpTesting.expectOne('/students/GetById/std-999');
    expect(req.request.method).toBe('GET');
    req.flush({
      message: { messageType: 1, messageTypeName: 'Success', messages: [] },
      data: { id: 'std-999', name: 'Reactive Student' },
    });

    await Promise.resolve();
    TestBed.flushEffects();

    expect(res.value()).toEqual({ id: 'std-999', name: 'Reactive Student' });
  });

  it('automatically unwraps IResponse envelopes in CRUD methods', () => {
    const successMeta = { messageType: 1, messageTypeName: 'Success', messages: [] };

    let listResult: StudentEntity[] | undefined;
    repository.getAll().subscribe((data) => {
      listResult = data;
    });
    httpTesting.expectOne('/students/GetAll').flush({
      message: successMeta,
      data: [{ id: '1', name: 'Sara' }],
    });
    expect(listResult).toEqual([{ id: '1', name: 'Sara' }]);
  });

  it('returns data and meta via getPaginated() against GetList for IResponseList responses', () => {
    const meta = {
      pageCount: 3,
      totalItemCount: 25,
      pageNumber: 1,
      pageSize: 10,
      hasPreviousPage: false,
      hasNextPage: true,
      isFirstPage: true,
      isLastPage: false,
      firstItemOnPage: 1,
      lastItemOnPage: 10,
    };

    let result: { data: StudentEntity[]; meta?: typeof meta } | undefined;
    repository.getPaginated().subscribe((res) => {
      result = res;
    });

    httpTesting.expectOne('/students/GetList').flush({
      message: { messageType: 1, messageTypeName: 'Success', messages: [] },
      data: [{ id: '1', name: 'Nour' }],
      meta,
    });

    expect(result).toEqual({
      data: [{ id: '1', name: 'Nour' }],
      meta,
    });
  });

  it('tracks isLoading, isSaving, and isDeleting signals automatically during requests', () => {
    expect(repository.isLoading()).toBe(false);
    expect(repository.isSaving()).toBe(false);
    expect(repository.isDeleting()).toBe(false);

    repository.getAll().subscribe();
    expect(repository.isLoading()).toBe(true);
    httpTesting.expectOne('/students/GetAll').flush([]);
    expect(repository.isLoading()).toBe(false);

    repository.create({ name: 'Omar' }).subscribe();
    expect(repository.isSaving()).toBe(true);
    httpTesting.expectOne('/students/Create').flush({ id: '1', name: 'Omar' });
    expect(repository.isSaving()).toBe(false);

    repository.update({ id: '1', name: 'Omar 2' }).subscribe();
    expect(repository.isSaving()).toBe(true);
    httpTesting.expectOne('/students/Edit').flush({ id: '1', name: 'Omar 2' });
    expect(repository.isSaving()).toBe(false);

    repository.delete('1').subscribe();
    expect(repository.isDeleting()).toBe(true);
    httpTesting.expectOne('/students/Delete/1').flush(null);
    expect(repository.isDeleting()).toBe(false);
  });
});
