import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type Field, FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { ToggleButton } from 'primeng/togglebutton';

@Component({
  selector: 'app-chip-select',
  imports: [ToggleButton, FormField, FormsModule, TranslatePipe],
  templateUrl: './chip-select.html',
})
export class AppChipSelect {
  /** Optional Signal Forms field. */
  readonly field = input<Field<boolean | null | undefined> | undefined>(undefined);

  readonly active = model<boolean>(false);
  readonly label = input.required<string>();
  readonly icon = input<string | undefined>(undefined);
  readonly count = input<number | undefined>(undefined);
  readonly disabled = input<boolean>(false);

  readonly isSelected = computed(() => {
    const f = this.field();
    if (f) {
      const state = f();
      return state ? Boolean(state.value()) : false;
    }
    return this.active();
  });

  protected readonly chipClasses = computed(() => {
    const active = this.isSelected();
    const dis = this.disabled();
    if (dis) {
      return '!opacity-50 !cursor-not-allowed !bg-surface-100 !text-surface-400 !border-surface-200';
    }
    if (active) {
      return '!bg-primary-600 !text-white !border-primary-600 !font-semibold shadow-xs';
    }
    return '!bg-surface-0/90 !text-surface-800 !border-[#c9d4ea] hover:!border-primary-400 hover:!bg-surface-50 !font-medium';
  });

  onToggle(val: boolean): void {
    this.active.set(val);
  }
}

export { AppChipSelect as ChipSelect };
