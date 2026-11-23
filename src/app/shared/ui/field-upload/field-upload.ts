import { Component, computed, inject, input, output, signal } from '@angular/core';
import { type Field, type ValidationError } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { ValidationMessageService } from '../foundation/validation-message.service';
import { createUniqueId } from '../foundation/utils';

/** Visual state of the upload field (mirrors the Figma `State` variants). */
export type FieldUploadState = 'default' | 'uploading' | 'uploaded' | 'error';

/** Reason a picked file was rejected by the built-in checks. */
export type FieldUploadRejection = 'size' | 'type';

export interface FieldUploadInvalidEvent {
  readonly file: File;
  readonly reason: FieldUploadRejection;
}

/** Formats a byte count as a short human-readable size (e.g. `1.2 MB`). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${String(Math.round(kb))} KB`;
  const mb = kb / 1024;
  return `${String(Math.round(mb * 10) / 10)} MB`;
}

/** Returns true when `file` matches an `accept` list such as `.pdf,.docx,image/*`. */
export function matchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .filter((r) => r.length > 0);
  if (rules.length === 0 || rules.includes('*') || rules.includes('*/*')) return true;

  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return mime.startsWith(rule.slice(0, -1));
    return mime === rule;
  });
}

/**
 * File upload field (Figma `Field / Upload`).
 *
 * States: default → uploading (progress) → uploaded (name, size, remove) and
 * error (red surface + helper message). Supports click, keyboard and drag & drop,
 * optional Signal Forms binding (`Field<File | null>`), built-in type/size checks,
 * and works in RTL/LTR through logical layout only.
 *
 * ```html
 * <app-field-upload
 *   label="FORM.CV"
 *   title="FORM.CV_TITLE"
 *   hint="FORM.CV_HINT"
 *   accept=".pdf,.docx"
 *   [maxSizeBytes]="5 * 1024 * 1024"
 *   [progress]="progress()"
 *   (fileSelected)="upload($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-field-upload',
  host: { class: 'block w-full' },
  imports: [TranslatePipe],
  templateUrl: './field-upload.html',
})
export class AppFieldUpload {
  private readonly validationService = inject(ValidationMessageService);
  private readonly uid = createUniqueId('field-upload');

  // ── Inputs ──
  /** Optional Signal Forms field holding the picked file. */
  readonly field = input<Field<File | null> | undefined>(undefined);
  /** Translation key for the label above the drop zone. */
  readonly label = input('');
  /** Translation key for the call-to-action title (e.g. "Upload your CV"). */
  readonly title = input('common.upload.title');
  /** Translation key for the hint (e.g. "PDF or DOCX · Max 5 MB"). */
  readonly hint = input('');
  /** Native `accept` list; also used for the built-in type check. */
  readonly accept = input('*');
  /** Maximum size in bytes; `null` disables the size check. */
  readonly maxSizeBytes = input<number | null>(null);
  readonly disabled = input(false);
  /** Upload progress 0–100. While between 0 and 99 the field shows the uploading state. */
  readonly progress = input<number | null>(null);
  /** Controlled file name (e.g. an already uploaded file from the server). */
  readonly fileName = input<string | null>(null);
  /** Controlled file size in bytes. */
  readonly fileSize = input<number | null>(null);
  /** External error translation key (e.g. a failed upload). Takes priority over other errors. */
  readonly error = input<string | null>(null);
  /** Whether the uploaded state shows a remove button. */
  readonly removable = input(true);
  /** Translation key for the size error; receives `{ max }`. */
  readonly sizeErrorKey = input('common.upload.errors.size');
  /** Translation key for the type error. */
  readonly typeErrorKey = input('common.upload.errors.type');
  /** Translation key for the remove button aria-label. */
  readonly removeLabelKey = input('common.upload.remove');

  // ── Outputs ──
  readonly fileSelected = output<File>();
  readonly fileInvalid = output<FieldUploadInvalidEvent>();
  readonly removed = output<void>();

  // ── Ids ──
  readonly inputId = `${this.uid}_input`;
  readonly labelId = `${this.uid}_label`;
  readonly titleId = `${this.uid}_title`;
  readonly hintId = `${this.uid}_hint`;
  readonly errorId = `${this.uid}_error`;

  // ── Local state ──
  private readonly pickedFile = signal<File | null>(null);
  private readonly rejection = signal<FieldUploadRejection | null>(null);
  protected readonly dragOver = signal(false);

  private readonly fieldState = computed(() => this.field()?.());

  private readonly currentFile = computed<File | null>(
    () => this.fieldState()?.value() ?? this.pickedFile(),
  );

  readonly isDisabled = computed(() => this.disabled() || (this.fieldState()?.disabled() ?? false));

  readonly displayName = computed(() => this.fileName() ?? this.currentFile()?.name ?? null);

  readonly sizeLabel = computed(() => {
    const bytes = this.fileSize() ?? this.currentFile()?.size ?? null;
    return bytes === null ? null : formatFileSize(bytes);
  });

  readonly maxSizeLabel = computed(() => {
    const max = this.maxSizeBytes();
    return max === null ? '' : formatFileSize(max);
  });

  /** Translation key of the message to show under the field, or null. */
  readonly errorMessage = computed<string | null>(() => {
    const external = this.error();
    if (external) return external;

    const reason = this.rejection();
    if (reason === 'size') return this.sizeErrorKey();
    if (reason === 'type') return this.typeErrorKey();

    const state = this.fieldState();
    if (state?.touched() && state.invalid()) {
      const errors: readonly ValidationError.WithOptionalFieldTree[] = state.errors();
      return this.validationService.getFirstMessage(errors);
    }
    return null;
  });

  readonly state = computed<FieldUploadState>(() => {
    if (this.errorMessage()) return 'error';
    if (!this.displayName()) return 'default';
    const p = this.progress();
    return p !== null && p < 100 ? 'uploading' : 'uploaded';
  });

  readonly progressValue = computed(() => Math.min(100, Math.max(0, Math.round(this.progress() ?? 0))));

  readonly hasHint = computed(
    () => this.state() === 'uploading' || this.state() === 'uploaded' || this.hint().length > 0,
  );

  readonly describedBy = computed<string | null>(() => {
    const ids: string[] = [];
    if (this.hasHint()) ids.push(this.hintId);
    if (this.errorMessage()) ids.push(this.errorId);
    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly zoneClasses = computed(() => {
    const classes: string[] = [
      'relative flex w-full items-center gap-3.5 rounded-[18px] px-4 py-3.5',
      'backdrop-blur-[var(--glass-blur)] transition-colors duration-200',
      'has-[.upload-trigger:focus-visible]:outline-2',
      'has-[.upload-trigger:focus-visible]:outline-offset-2',
      'has-[.upload-trigger:focus-visible]:outline-primary-600',
    ];

    if (this.state() === 'error') {
      classes.push(
        'border-[1.5px] border-dashed border-semantic-error-border bg-semantic-error-bg',
      );
    } else if (this.dragOver()) {
      classes.push('border-[1.5px] border-dashed border-primary-500 bg-primary-50/80');
    } else if (this.state() === 'uploaded') {
      classes.push(
        'border border-solid border-ink/7 bg-white/45 supports-[not_(backdrop-filter:blur(1px))]:bg-white/95',
      );
    } else {
      classes.push(
        'border-[1.5px] border-dashed border-primary-500/45 bg-white/45 supports-[not_(backdrop-filter:blur(1px))]:bg-white/95',
      );
      if (!this.isDisabled()) {
        classes.push('hover:border-primary-500/70 hover:bg-white/70');
      }
    }

    if (this.isDisabled()) {
      classes.push('opacity-50');
    }

    return classes.join(' ');
  });

  protected readonly tileClasses = computed(() =>
    [
      'flex size-11 shrink-0 items-center justify-center rounded-[14px] text-primary-600',
      this.state() === 'error' ? 'bg-white' : 'bg-primary-50',
    ].join(' '),
  );

  protected readonly titleClasses = computed(() =>
    [
      'truncate text-[15px] font-semibold leading-[1.3]',
      this.state() === 'uploading' || this.state() === 'uploaded' ? 'text-ink' : 'text-primary-600',
    ].join(' '),
  );

  protected readonly hintClasses = computed(() =>
    [
      'truncate text-xs leading-[1.3] tabular-nums',
      this.state() === 'error' ? 'text-ink-subtle' : 'text-subdued',
    ].join(' '),
  );

  // ── Handlers ──
  protected openPicker(input: HTMLInputElement): void {
    if (this.isDisabled()) return;
    input.click();
  }

  protected onFileChange(event: Event): void {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    if (file) this.handleFile(file);
    el.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.isDisabled()) this.dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as Node | null;
    if (target && related && target.contains(related)) return;
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.isDisabled()) return;
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  protected remove(): void {
    this.pickedFile.set(null);
    this.rejection.set(null);
    this.fieldState()?.value.set(null);
    this.removed.emit();
  }

  private handleFile(file: File): void {
    this.fieldState()?.markAsTouched();

    const max = this.maxSizeBytes();
    const reason: FieldUploadRejection | null = !matchesAccept(file, this.accept())
      ? 'type'
      : max !== null && file.size > max
        ? 'size'
        : null;

    this.rejection.set(reason);
    if (reason) {
      this.pickedFile.set(null);
      this.fieldState()?.value.set(null);
      this.fileInvalid.emit({ file, reason });
      return;
    }

    this.pickedFile.set(file);
    this.fieldState()?.value.set(file);
    this.fileSelected.emit(file);
  }
}

export { AppFieldUpload as FieldUpload };
