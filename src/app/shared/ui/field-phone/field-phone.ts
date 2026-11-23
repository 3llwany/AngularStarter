import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type Field, FormField, type ValidationError } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { AppFieldError, createUniqueId, ValidationMessageService } from '../foundation';

export interface CountryDialCode {
  readonly code: string;
  readonly country: string;
  readonly flag: string;
}

@Component({
  selector: 'app-field-phone',
  imports: [FormsModule, FormField, TranslatePipe, AppFieldError],
  templateUrl: './field-phone.html',
})
export class AppFieldPhone {
  /** Optional Signal Forms field. */
  readonly field = input<Field<string> | undefined>(undefined);

  readonly value = model<string>('');
  readonly countryCode = model<string>('+20');
  readonly label = input<string>('');
  readonly placeholder = input<string>('01012345678');
  readonly disabled = input<boolean>(false);
  readonly error = input<string | null>(null);

  protected readonly inputId = createUniqueId('field-phone');
  private readonly validationService = inject(ValidationMessageService);

  readonly fieldState = computed(() => {
    const f = this.field();
    return f ? f() : null;
  });

  readonly errorId = computed(() => `${this.inputId}_error`);

  readonly showError = computed(() => {
    const state = this.fieldState();
    if (state) {
      return state.touched() && state.invalid();
    }
    return !!this.error();
  });

  readonly errorMessage = computed<string | null>(() => {
    if (this.error()) return this.error();
    const state = this.fieldState();
    if (!state || !this.showError()) return null;
    const errors: readonly ValidationError.WithOptionalFieldTree[] = state.errors();
    return this.validationService.getFirstMessage(errors);
  });

  protected readonly dialCodes: readonly CountryDialCode[] = [
    { code: '+20', country: 'EG', flag: '🇪🇬' },
    { code: '+966', country: 'SA', flag: '🇸🇦' },
    { code: '+971', country: 'AE', flag: '🇦🇪' },
    { code: '+965', country: 'KW', flag: '🇰🇼' },
  ];

  protected onInput(val: string): void {
    this.value.set(val);
  }

  protected readonly containerClasses = computed(() => {
    if (this.disabled()) {
      return 'opacity-50 cursor-not-allowed bg-surface-50 border-surface-200';
    }
    if (this.showError()) {
      return 'border-[#ef5a4a] bg-[#fde4e1]/20';
    }
    return 'border-surface-200/90 bg-surface-0 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-600/20';
  });
}

export { AppFieldPhone as FieldPhone };
