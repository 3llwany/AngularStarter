import { ApplicationConfig } from '@angular/core';
import { routes } from './app.routes';
import { provideCore } from '@core/providers';
import { devMenuInterceptor } from './dev/dev-menu.interceptor';
import { HAS_DEV_ROUTES } from './dev/dev.routes';
import { mockStudentsInterceptor } from './features/mock/data-access/mock-students.interceptor';
// Direct service import avoids pulling the entire @shared/ui component barrel into the initial bundle.
// eslint-disable-next-line @softarc/sheriff/encapsulation
import { ToastService } from '@shared/ui/toast/toast.service';

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
