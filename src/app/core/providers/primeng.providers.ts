import { EnvironmentProviders, Provider } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { MozAuraPreset } from '@core/theme';

export function provideMozPrimeNG(): (Provider | EnvironmentProviders)[] {
  return [
    providePrimeNG({
      theme: {
        preset: MozAuraPreset,
        options: {
          darkModeSelector: false,
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, tailwind-base, primeng, components, utilities, tailwind-utilities',
          },
        },
      },
    }),
    MessageService,
    ConfirmationService,
  ];
}
