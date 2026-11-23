import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Divider } from 'primeng/divider';

@Component({
  selector: 'app-divider-or',
  imports: [Divider, TranslatePipe],
  templateUrl: './divider-or.html',
})
export class AppDividerOr {
  readonly labelKey = input('common.labels.or');
  readonly textKey = this.labelKey;
}

export { AppDividerOr as DividerOr };
