import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { disabled, form, required } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight } from '@primeicons/angular/arrow-right';
import { AuthService, DEMO_PASSWORD } from '@core/auth';
import { isAppError } from '@core/errors';
import { FileService } from '@core/file';
import { SupportedLang, LocaleService } from '@core/i18n';
import { LayoutService } from '@core/layout';
import { LoadingService } from '@core/loading';
import {
  AppBanner,
  AppBottomNavTab,
  AppButton,
  AppCard,
  AppCheckboxCard,
  AppChipSelect,
  AppChoiceCard,
  AppDialog,
  AppDividerOr,
  AppFieldPhone,
  AppFieldUpload,
  AppHelperError,
  AppIconButton,
  AppInput,
  AppLink,
  AppProgressSteps,
  AppSelect,
  AppSkeleton,
  AppSocialButton,
  AppTag,
  ConfirmService,
  DialogService,
  DynamicDialogRef,
  ImgFallbackDirective,
  type StepItem,
  ToastService,
} from '@shared/ui';

interface SampleOption {
  readonly value: string;
  readonly labelKey: string;
}

@Component({
  imports: [TranslatePipe, AppButton],
  templateUrl: './sample-dynamic-modal.html',
})
export class SampleDynamicModalComponent {
  private readonly ref = inject(DynamicDialogRef, { optional: true });

  confirm(): void {
    this.ref?.close({ confirmed: true });
  }

  cancel(): void {
    this.ref?.close(null);
  }
}

@Component({
  selector: 'app-foundation-page',
  imports: [
    TranslatePipe,
    ArrowRight,
    AppButton,
    AppCard,
    AppDialog,
    AppInput,
    AppSelect,
    ImgFallbackDirective,
    AppTag,
    AppBanner,
    AppChoiceCard,
    AppCheckboxCard,
    AppChipSelect,
    AppProgressSteps,
    AppSkeleton,
    AppLink,
    AppHelperError,
    AppIconButton,
    AppDividerOr,
    AppSocialButton,
    AppBottomNavTab,
    AppFieldPhone,
    AppFieldUpload,
  ],
  templateUrl: './foundation.page.html',
})
export class FoundationPageComponent {
  protected readonly localeService = inject(LocaleService);
  protected readonly toastService = inject(ToastService);
  protected readonly confirmService = inject(ConfirmService);
  protected readonly dialogService = inject(DialogService);
  protected readonly loadingService = inject(LoadingService);
  protected readonly fileService = inject(FileService);
  protected readonly authService = inject(AuthService);
  protected readonly layoutService = inject(LayoutService);

  readonly removableMarker = 'DEV_FOUNDATION_VERIFICATION_PAGE_REMOVABLE';

  // Phase 1.5 Showcase State
  protected readonly selectedContainerWidth = signal<string>('100%');
  protected readonly containerWidthOptions = [
    { label: '320px (Mobile S)', value: '320px' },
    { label: '390px (Mobile L / Figma)', value: '390px' },
    { label: '768px (Tablet)', value: '768px' },
    { label: '1280px (Desktop)', value: '1280px' },
    { label: 'Fluid (100%)', value: '100%' },
  ];
  protected readonly selectedPlan = signal<'standard' | 'premium'>('standard');
  protected readonly checkboxCard1 = signal<boolean>(true);
  protected readonly checkboxCard2 = signal<boolean>(false);
  protected readonly chip1 = signal<boolean>(true);
  protected readonly chip2 = signal<boolean>(false);
  protected readonly chip3 = signal<boolean>(true);
  protected readonly phoneValue = signal<string>('01012345678');
  protected readonly steps: readonly StepItem[] = [
    { id: '1', label: 'dev.foundation.figma_section.step_personal', status: 'completed' },
    { id: '2', label: 'dev.foundation.figma_section.step_stage', status: 'active' },
    { id: '3', label: 'dev.foundation.figma_section.step_confirm', status: 'upcoming' },
  ];
  protected readonly uploadProgress = signal<number | null>(null);
  protected readonly uploadMaxBytes = 5 * 1024 * 1024;
  protected readonly uploadDirections = ['ltr', 'rtl'] as const;
  protected readonly sampleFileName = 'sample-document.pdf';
  protected readonly sampleFileSize = 1_258_291;
  private uploadTimer: ReturnType<typeof setInterval> | null = null;
  private readonly cleanupUploadTimer = inject(DestroyRef).onDestroy(() => this.clearUploadTimer());

  /** Dev-only: fakes upload progress so the uploading → uploaded flow can be tried. */
  protected simulateUpload(): void {
    this.clearUploadTimer();
    this.uploadProgress.set(0);
    this.uploadTimer = setInterval(() => {
      const next = (this.uploadProgress() ?? 0) + 10;
      this.uploadProgress.set(Math.min(next, 100));
      if (next >= 100) {
        this.clearUploadTimer();
      }
    }, 250);
  }

  protected resetUpload(): void {
    this.clearUploadTimer();
    this.uploadProgress.set(null);
  }

  private clearUploadTimer(): void {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer);
      this.uploadTimer = null;
    }
  }
  protected readonly sampleNameLength = computed(() => this.formModel().sampleName.length);

  readonly fallbackImgDataUri =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  readonly validImgDataUri =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%2310b981"><circle cx="12" cy="12" r="10"/><path fill="white" d="M9 12l2 2 4-4"/></svg>';

  private readonly formModel = signal({
    sampleName: '',
    selectedOption: 'option_a',
    invalidSample: '',
    disabledSample: '',
  });

  protected readonly demoForm = form(this.formModel, (schema) => {
    required(schema.invalidSample, {
      message: 'dev.foundation.inputs_section.invalid_error',
    });
    disabled(schema.disabledSample);
  });

  protected readonly dialogVisible = signal(false);
  protected readonly confirmResult = signal<string>('—');
  protected readonly dynamicDialogResult = signal<string>('—');
  protected readonly fileBase64Info = signal<string>('—');

  private readonly authFormModel = signal({
    identifier: 'demo@example.test',
    password: DEMO_PASSWORD,
  });
  protected readonly authDemoForm = form(this.authFormModel);
  protected readonly authErrorKey = signal<string | null>(null);

  protected readonly authUserDisplay = computed(() => {
    const current = this.authService.user();
    return current ? `${current.displayName} — ${current.identifier}` : 'null';
  });

  protected readonly languageOptions: readonly {
    readonly lang: SupportedLang;
    readonly labelKey: string;
  }[] = [
    { lang: 'ar', labelKey: 'common.language.ar' },
    { lang: 'en', labelKey: 'common.language.en' },
  ];

  protected readonly sampleOptions: SampleOption[] = [
    { value: 'option_a', labelKey: 'dev.foundation.inputs_section.options.option_a' },
    { value: 'option_b', labelKey: 'dev.foundation.inputs_section.options.option_b' },
    { value: 'option_c', labelKey: 'dev.foundation.inputs_section.options.option_c' },
  ];

  constructor() {
    this.demoForm.invalidSample().markAsTouched();
  }

  protected selectLanguage(lang: SupportedLang): void {
    this.localeService.setLang(lang);
  }

  protected openDialog(): void {
    this.dialogVisible.set(true);
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
  }

  protected showToast(severity: 'success' | 'error' | 'warn' | 'info'): void {
    if (severity === 'success') {
      this.toastService.success('common.toast.success');
    } else if (severity === 'error') {
      this.toastService.error('common.toast.error');
    } else if (severity === 'warn') {
      this.toastService.warn('common.toast.warning');
    } else {
      this.toastService.info('common.toast.info');
    }
  }

  protected async triggerConfirm(): Promise<void> {
    const ok = await this.confirmService.confirm({
      message: 'common.confirm.delete_entity_msg',
    });
    this.confirmResult.set(ok ? 'Confirmed (true)' : 'Canceled (false)');
  }

  protected async triggerDeleteConfirm(): Promise<void> {
    const ok = await this.confirmService.delete();
    this.confirmResult.set(ok ? 'Deleted (true)' : 'Canceled (false)');
  }

  protected async openDynamicDialog(): Promise<void> {
    const result = await this.dialogService.openAsync<
      SampleDynamicModalComponent,
      unknown,
      { confirmed: boolean }
    >(SampleDynamicModalComponent, {
      header: 'dev.foundation.utilities_section.dialog_header',
    });
    this.dynamicDialogResult.set(result ? JSON.stringify(result) : 'Dismissed / Canceled');
  }

  protected async simulateLoading(): Promise<void> {
    await this.loadingService.withLoadingAsync(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    });
  }

  protected downloadSampleFile(): void {
    const blob = new Blob(
      ['Angular Starter design system showcase file.'],
      { type: 'text/plain' },
    );
    this.fileService.downloadFile(blob, 'starter-demo.txt');
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (file) {
      const result = await this.fileService.fileToBase64(file);
      this.fileBase64Info.set(`${file.name} (${String(result.base64.length)} chars)`);
    }
  }

  protected fillDemoCredentials(): void {
    this.authFormModel.set({
      identifier: 'demo@example.test',
      password: DEMO_PASSWORD,
    });
    this.authErrorKey.set(null);
  }

  protected async submitDemoLogin(): Promise<void> {
    this.authErrorKey.set(null);
    await this.loadingService.withLoadingAsync(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      try {
        await this.authService.login(this.authFormModel());
        await this.toastService.success('common.toast.success');
      } catch (error: unknown) {
        const errorKey = isAppError(error) ? error.translationKey : 'errors.unexpected';
        this.authErrorKey.set(errorKey);
        await this.toastService.error(errorKey);
      }
    });
  }

  protected async triggerDemoLogout(): Promise<void> {
    this.authErrorKey.set(null);
    await this.authService.logout();
  }

  protected triggerDemoExpire(): void {
    this.authErrorKey.set(null);
    this.authService.handleUnauthorized();
  }
}
