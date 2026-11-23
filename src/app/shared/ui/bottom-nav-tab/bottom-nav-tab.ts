import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-bottom-nav-tab',
  imports: [TranslatePipe],
  templateUrl: './bottom-nav-tab.html',
})
export class AppBottomNavTab {
  readonly active = input<boolean>(false);
  readonly label = input.required<string>();
  readonly icon = input<string | undefined>(undefined);
  readonly badge = input<string | number | undefined>(undefined);
  readonly onClick = output<void>();
}

export { AppBottomNavTab as BottomNavTab };
