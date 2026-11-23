import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, required } from '@angular/forms/signals';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFieldUpload, formatFileSize, matchesAccept } from './field-upload';

function pick(fixture: ComponentFixture<AppFieldUpload>, file: File): void {
  const inputEl = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(inputEl, 'files', { value: [file], configurable: true });
  inputEl.dispatchEvent(new Event('change'));
  fixture.detectChanges();
}

describe('AppFieldUpload', () => {
  let fixture: ComponentFixture<AppFieldUpload>;
  let component: AppFieldUpload;
  const zone = (): HTMLElement => fixture.nativeElement.querySelector('[data-state]');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFieldUpload],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFieldUpload);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'form.cv');
    fixture.componentRef.setInput('hint', 'form.cv_hint');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the default state: label, dashed 18px zone, title and hint, no browse button', () => {
    expect(zone().dataset['state']).toBe('default');
    expect(zone().classList.contains('rounded-[18px]')).toBe(true);
    expect(zone().classList.contains('border-dashed')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('form.cv');
    expect(fixture.nativeElement.textContent).toContain('form.cv_hint');
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(1);
  });

  it('shows the uploading state with an accessible progress bar', () => {
    fixture.componentRef.setInput('fileName', 'cv.pdf');
    fixture.componentRef.setInput('progress', 60);
    fixture.detectChanges();

    expect(zone().dataset['state']).toBe('uploading');
    const bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('60');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('60%');
    expect(fixture.nativeElement.textContent).toContain('cv.pdf');
  });

  it('shows the uploaded state with file size and a remove button', () => {
    const removed = vi.fn();
    component.removed.subscribe(removed);
    fixture.componentRef.setInput('fileName', 'cv.pdf');
    fixture.componentRef.setInput('fileSize', 1_258_291);
    fixture.detectChanges();

    expect(zone().dataset['state']).toBe('uploaded');
    expect(zone().classList.contains('border-solid')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('1.2 MB');
    const removeBtn = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    removeBtn.click();
    expect(removed).toHaveBeenCalled();
  });

  it('emits fileSelected for a valid pick and shows its name', () => {
    const spy = vi.fn();
    component.fileSelected.subscribe(spy);
    const file = new File(['x'], 'test.pdf', { type: 'application/pdf' });
    fixture.componentRef.setInput('accept', '.pdf,.docx');
    pick(fixture, file);

    expect(spy).toHaveBeenCalledWith(file);
    expect(zone().dataset['state']).toBe('uploaded');
  });

  it('rejects an oversized file: error surface, alert linked via aria-describedby', () => {
    const invalid = vi.fn();
    component.fileInvalid.subscribe(invalid);
    fixture.componentRef.setInput('maxSizeBytes', 4);
    pick(fixture, new File(['too large'], 'big.pdf', { type: 'application/pdf' }));

    expect(invalid).toHaveBeenCalledWith(expect.objectContaining({ reason: 'size' }));
    expect(zone().dataset['state']).toBe('error');
    expect(zone().classList.contains('border-semantic-error-border')).toBe(true);
    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    expect(alert.textContent).toContain('common.upload.errors.size');
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-describedby')).toContain(alert.id);
  });

  it('rejects a file whose type is not accepted', () => {
    fixture.componentRef.setInput('accept', '.pdf');
    pick(fixture, new File(['x'], 'photo.png', { type: 'image/png' }));
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'common.upload.errors.type',
    );
  });

  it('omits aria-describedby when no hint or error is present', () => {
    fixture.componentRef.setInput('hint', '');
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-describedby')).toBeNull();
  });

  it('uses high-contrast ink-subtle hint text on error surface', () => {
    fixture.componentRef.setInput('error', 'common.upload.errors.size');
    fixture.detectChanges();
    const hint = fixture.nativeElement.querySelector(`#${component.hintId}`) as HTMLElement;
    expect(hint.classList.contains('text-ink-subtle')).toBe(true);
  });
});

@Component({
  imports: [AppFieldUpload],
  template: `<app-field-upload [field]="uploadForm.cv" label="form.cv" />`,
})
class SignalFormUploadHost {
  readonly model = signal<{ cv: File | null }>({ cv: null });
  readonly uploadForm = form(this.model, (schema) => {
    required(schema.cv);
  });
}

describe('AppFieldUpload Signal Forms integration', () => {
  it('syncs picked and removed files with Signal Forms field and displays validation error', async () => {
    await TestBed.configureTestingModule({
      imports: [SignalFormUploadHost],
      providers: [provideTranslateService()],
    }).compileComponents();

    const hostFixture = TestBed.createComponent(SignalFormUploadHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const inputEl = hostFixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['cv'], 'resume.pdf', { type: 'application/pdf' });
    Object.defineProperty(inputEl, 'files', { value: [file], configurable: true });
    inputEl.dispatchEvent(new Event('change'));
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.model().cv).toBe(file);
    expect(hostFixture.nativeElement.querySelector('[data-state]').dataset['state']).toBe('uploaded');

    const removeBtn = hostFixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    removeBtn.click();
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.model().cv).toBeNull();
    expect(hostFixture.nativeElement.querySelector('[data-state]').dataset['state']).toBe('error');
    expect(hostFixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'VALIDATION.REQUIRED',
    );
  });
});

describe('field-upload helpers', () => {
  it('formats sizes', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('matches accept rules by extension, wildcard mime and exact mime', () => {
    const pdf = new File([''], 'a.PDF', { type: 'application/pdf' });
    const png = new File([''], 'a.png', { type: 'image/png' });
    expect(matchesAccept(pdf, '.pdf,.docx')).toBe(true);
    expect(matchesAccept(png, 'image/*')).toBe(true);
    expect(matchesAccept(png, 'application/pdf')).toBe(false);
    expect(matchesAccept(png, '*')).toBe(true);
  });
});
