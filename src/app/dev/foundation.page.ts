import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { disabled, form, required } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight } from '@primeicons/angular/arrow-right';
import { LoginRole, AuthService, LOGIN_METHODS, DEMO_PASSWORD } from '@core/auth';
import { isAppError } from '@core/errors';
import { FileService } from '@core/file';
import { SupportedLang, LocaleService } from '@core/i18n';
import { LayoutService, ROLE_LAYOUT_MODE } from '@core/layout';
import { LoadingService } from '@core/loading';
import { Role, ThemeService } from '@core/theme';
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

interface GradeOption {
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
  protected readonly themeService = inject(ThemeService);
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
  protected readonly sampleFileName = 'CV_Sarah_Ahmed.pdf';
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
  protected readonly studentNameLength = computed(() => this.formModel().studentName.length);

  readonly fallbackImgDataUri =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  readonly validImgDataUri =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%2310b981"><circle cx="12" cy="12" r="10"/><path fill="white" d="M9 12l2 2 4-4"/></svg>';

  private readonly formModel = signal({
    studentName: '',
    selectedGrade: 'primary',
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

  protected readonly selectedLoginRole = signal<LoginRole>('student');
  protected readonly activeLoginMethod = computed(() => LOGIN_METHODS[this.selectedLoginRole()]);
  protected readonly activeIdentifierInputType = computed<'text' | 'email'>(() =>
    this.activeLoginMethod().inputType === 'email' ? 'email' : 'text',
  );
  private readonly authFormModel = signal({
    identifier: 'student@mozakrety.test',
    password: DEMO_PASSWORD,
  });
  protected readonly authDemoForm = form(this.authFormModel);
  protected readonly authErrorKey = signal<string | null>(null);

  protected readonly authUserDisplay = computed(() => {
    const current = this.authService.user();
    return current ? `${current.displayName} (${current.role}) — ${current.identifier}` : 'null';
  });

  protected readonly loginRoleOptions: readonly {
    readonly role: LoginRole;
    readonly labelKey: string;
    readonly demoIdentifier: string;
  }[] = [
    { role: 'student', labelKey: 'common.roles.student', demoIdentifier: 'student@mozakrety.test' },
    { role: 'parent', labelKey: 'common.roles.parent', demoIdentifier: '01012345678' },
    { role: 'teacher', labelKey: 'common.roles.teacher', demoIdentifier: 'TCH-1001' },
    { role: 'school', labelKey: 'common.roles.school', demoIdentifier: 'SCH-2026' },
    { role: 'partner', labelKey: 'common.roles.partner', demoIdentifier: 'partner@mozakrety.test' },
  ];

  protected readonly roleOptions: readonly { readonly role: Role; readonly labelKey: string }[] = [
    { role: 'student', labelKey: 'common.roles.student' },
    { role: 'parent', labelKey: 'common.roles.parent' },
    { role: 'teacher', labelKey: 'common.roles.teacher' },
    { role: 'school', labelKey: 'common.roles.school' },
    { role: 'partner', labelKey: 'common.roles.partner' },
    { role: 'admin', labelKey: 'common.roles.admin' },
  ];

  protected readonly languageOptions: readonly {
    readonly lang: SupportedLang;
    readonly labelKey: string;
  }[] = [
    { lang: 'ar', labelKey: 'common.language.ar' },
    { lang: 'en', labelKey: 'common.language.en' },
  ];

  protected readonly gradeOptions: GradeOption[] = [
    { value: 'primary', labelKey: 'dev.foundation.inputs_section.grade_options.primary' },
    { value: 'preparatory', labelKey: 'dev.foundation.inputs_section.grade_options.preparatory' },
    { value: 'secondary', labelKey: 'dev.foundation.inputs_section.grade_options.secondary' },
  ];

  protected readonly activeRoleKey = computed(() => {
    const active = this.themeService.role();
    const match = this.roleOptions.find((item) => item.role === active);
    return match?.labelKey ?? 'common.roles.student';
  });

  constructor() {
    this.demoForm.invalidSample().markAsTouched();
  }

  protected selectRole(role: Role): void {
    this.themeService.setRole(role);
    if (!this.authService.isAuthenticated()) {
      this.layoutService.setMode(ROLE_LAYOUT_MODE[role] ?? 'navbar');
    }
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
      ['Mozakrety Design System & Core Utilities Test File\nGenerated dynamically.'],
      { type: 'text/plain' },
    );
    this.fileService.downloadFile(blob, 'mozakrety-demo.txt');
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (file) {
      const result = await this.fileService.fileToBase64(file);
      this.fileBase64Info.set(`${file.name} (${String(result.base64.length)} chars)`);
    }
  }

  protected selectLoginRole(role: LoginRole): void {
    this.selectedLoginRole.set(role);
    this.fillDemoCredentials();
  }

  protected fillDemoCredentials(): void {
    const match = this.loginRoleOptions.find((item) => item.role === this.selectedLoginRole());
    this.authFormModel.set({
      identifier: match?.demoIdentifier ?? '',
      password: DEMO_PASSWORD,
    });
    this.authErrorKey.set(null);
  }

  protected async submitDemoLogin(): Promise<void> {
    this.authErrorKey.set(null);
    await this.loadingService.withLoadingAsync(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      try {
        await this.authService.login(this.selectedLoginRole(), this.authFormModel());
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
