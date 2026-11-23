import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Step, StepList, Stepper } from 'primeng/stepper';

export interface StepItem {
  readonly id: string;
  readonly label: string;
  readonly status: 'completed' | 'active' | 'upcoming';
}

@Component({
  selector: 'app-progress-steps',
  imports: [Stepper, StepList, Step, TranslatePipe],
  templateUrl: './progress-steps.html',
})
export class AppProgressSteps {
  readonly steps = input.required<readonly StepItem[]>();
  readonly currentStepIndex = input<number>(0);

  readonly activeValue = computed<number>(() => {
    const list = this.steps();
    const activeIdx = list.findIndex((s) => s.status === 'active');
    return activeIdx >= 0 ? activeIdx + 1 : this.currentStepIndex() + 1;
  });
}

export { AppProgressSteps as ProgressSteps };
