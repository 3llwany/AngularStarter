import { Component, input, model, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AppButton, AppDialog } from '../../../shared/ui';
import { MockStudent } from '../models/student.model';

@Component({
  selector: 'app-student-details-dialog',
  imports: [TranslatePipe, AppDialog, AppButton],
  templateUrl: './student-details-dialog.component.html',
})
export class StudentDetailsDialogComponent {
  readonly visible = model<boolean>(false);
  readonly student = input<MockStudent | null>(null);
  readonly edit = output<MockStudent>();
  readonly delete = output<MockStudent>();
}
