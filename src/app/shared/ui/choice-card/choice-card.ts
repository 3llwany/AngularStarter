import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type Field, FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { RadioButton } from 'primeng/radiobutton';
import { createUniqueId } from '../foundation';

@Component({
  selector: 'app-choice-card',
  imports: [RadioButton, FormField, FormsModule, TranslatePipe],
  templateUrl: './choice-card.html',
})
export class AppChoiceCard<T = unknown> {
  /** Optional Signal Forms field. */
  readonly field = input<Field<T | null | undefined> | undefined>(undefined);

  /** Value represented by this option. */
  readonly value = input<T | undefined>(undefined);

  /** Direct boolean selected state (when used standalone without a group). */
  readonly selected = model<boolean>(false);

  /** Group value binding for standard radio groups. */
  readonly groupValue = model<T | null | undefined>(undefined);

  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly badge = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly name = input<string>('');

  readonly onSelect = output<boolean>();

  private readonly uid = createUniqueId('choice-card');
  readonly inputId = computed(() => this.uid);

  readonly isChecked = computed(() => {
    const f = this.field();
    if (f) {
      const state = f();
      return state ? state.value() === this.value() : false;
    }
    if (this.groupValue() !== undefined) {
      return this.groupValue() === this.value();
    }
    return this.selected();
  });

  select(): void {
    if (this.disabled()) return;
    this.selected.set(true);
    if (this.value() !== undefined) {
      this.groupValue.set(this.value());
    }
    this.onSelect.emit(true);
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

export { AppChoiceCard as ChoiceCard };
