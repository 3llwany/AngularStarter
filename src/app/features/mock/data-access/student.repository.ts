import { Service } from '@angular/core';
import { BaseRepository } from '../../../core/data-access/base-repository';
import { MockCreateStudentDto, MockStudent, MockUpdateStudentDto } from '../models/student.model';

/**
 * مستودع بيانات الطلاب (StudentRepository):
 * يرث من `BaseRepository` ويوفر وصولاً موحداً لعمليات الـ CRUD والموارد التفاعلية (`httpResource`).
 */
@Service()
export class StudentRepository extends BaseRepository<
  MockStudent,
  string,
  MockCreateStudentDto,
  MockUpdateStudentDto
> {
  protected override readonly endpoint = 'mock/students';
}
