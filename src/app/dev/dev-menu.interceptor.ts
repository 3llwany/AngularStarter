import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { IResponse, MESSAGE_TYPES } from '@core/http';
import { NavItem, USER_MENU_ENDPOINT } from '@core/navigation';

const DEV_MENU: readonly NavItem[] = [
  { id: 'overview', labelKey: 'dev.menu.overview', route: '/dev/foundation', order: 1 },
  { id: 'components', labelKey: 'dev.menu.components', route: '/dev/foundation', order: 2 },
  { id: 'settings', labelKey: 'dev.menu.settings', route: '/dev/foundation', order: 3 },
];

/** Supplies a generic sample navigation response while the showcase runs without a backend. */
export const devMenuInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || !req.url.endsWith(USER_MENU_ENDPOINT)) {
    return next(req);
  }

  const body: IResponse<readonly NavItem[]> = {
    message: { messageType: MESSAGE_TYPES.Success, messageTypeName: 'Success', messages: [] },
    data: DEV_MENU,
  };
  return of(new HttpResponse({ status: 200, body }));
};
