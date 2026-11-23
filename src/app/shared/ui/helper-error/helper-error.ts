import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-helper-error',
  imports: [TranslatePipe],
  templateUrl: './helper-error.html',
})
export class AppHelperError {
  readonly error = input<string | null>(null);
  readonly helper = input<string | null>(null);
  readonly count = input<number | null>(null);
  readonly maxCount = input<number | null>(null);
}

export { AppHelperError as HelperError };
