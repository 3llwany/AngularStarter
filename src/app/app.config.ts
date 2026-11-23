import { ApplicationConfig } from '@angular/core';
import { routes } from './app.routes';
import { provideCore } from '@core/providers';
import { devMenuInterceptor } from './dev/dev-menu.interceptor';
import { HAS_DEV_ROUTES } from './dev/dev.routes';
import { ToastService } from '@shared/ui/toast';

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideCore(
      routes,
      ToastService,
      undefined,
      HAS_DEV_ROUTES ? [devMenuInterceptor] : [],
    ),
  ],
};
