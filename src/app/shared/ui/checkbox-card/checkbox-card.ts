import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type Field, FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { Checkbox } from 'primeng/checkbox';
import { createUniqueId } from '../foundation/utils';

@Component({
  selector: 'app-checkbox-card',
  imports: [Checkbox, FormField, FormsModule, TranslatePipe],
  templateUrl: './checkbox-card.html',
})
export class AppCheckboxCard<T = boolean> {
  /** Optional Signal Forms field. */
  readonly field = input<Field<T | null | undefined> | undefined>(undefined);

  readonly checked = model<boolean>(false);
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly binary = input(true);
  readonly value = input<T | undefined>(undefined);

  readonly onToggle = output<boolean>();

  private readonly uid = createUniqueId('chk-card');
  readonly inputId = computed(() => this.uid);

  readonly isChecked = computed(() => {
    const f = this.field();
    if (f) {
      const state = f();
      return state ? Boolean(state.value()) : false;
    }
    return this.checked();
  });

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.isChecked();
    this.checked.set(next);
    this.onToggle.emit(next);
  }

  protected readonly containerClasses = computed(() => {
    if (this.disabled()) {
      return 'opacity-50 cursor-not-allowed bg-surface-50 border-surface-200';
    }
    if (this.isChecked()) {
      return 'border-2 border-primary-600 bg-surface-0/90 shadow-sm';
    }
    return 'border border-surface-200/80 bg-surface-0/60 hover:border-primary-300 hover:bg-surface-50/50 shadow-2xs';
  });
}

export { AppCheckboxCard as CheckboxCard };
