import { ApplicationConfig } from '@angular/core';
import { routes } from './app.routes';
import { provideCore } from './core/providers/core.providers';
import { devMenuInterceptor } from './dev/dev-menu.interceptor';
import { HAS_DEV_ROUTES } from './dev/dev.routes';
import { mockStudentsInterceptor } from './features/mock/data-access/mock-students.interceptor';
import { ToastService } from './shared/ui/toast/toast.service';

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideCore(
      routes,
      ToastService,
      undefined,
      HAS_DEV_ROUTES ? [devMenuInterceptor, mockStudentsInterceptor] : [mockStudentsInterceptor],
    ),
  ],
};
