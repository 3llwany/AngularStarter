import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type SocialProvider = 'google' | 'facebook';

@Component({
  selector: 'app-social-button',
  imports: [TranslatePipe],
  templateUrl: './social-button.html',
})
export class AppSocialButton {
  readonly provider = input.required<SocialProvider>();
  readonly fullWidth = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  readonly onClick = output<MouseEvent>();

  protected readonly containerClasses = computed(() => {
    const p = this.provider();
    const w = this.fullWidth() ? 'w-full' : 'w-auto';

    if (p === 'facebook') {
      return `${w} bg-[#1877f2] hover:bg-[#166fe5] text-white border-transparent`;
    }
    return `${w} bg-surface-0 hover:bg-surface-50 text-surface-800 border-surface-200/90 shadow-2xs`;
  });

  private readonly googleLabelKey = 'common.auth.continue_with_google';
  private readonly facebookLabelKey = 'common.auth.continue_with_facebook';

  protected readonly labelKey = computed(() => {
    return this.provider() === 'facebook'
      ? this.facebookLabelKey
      : this.googleLabelKey;
  });
}

export { AppSocialButton as SocialButton };
