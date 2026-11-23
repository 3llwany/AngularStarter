import { DOCUMENT } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService, SESSION_HINT_COOKIE } from '../auth/auth.service';
import { DEMO_PASSWORD, provideMockAuthApi } from '../auth/mock-auth-api';
import { IResponse, MESSAGE_TYPES } from '../http/api-response';
import { NavItem, NavService, USER_MENU_ENDPOINT } from './nav.service';

const MOCK_MENU: readonly NavItem[] = [
  { id: 'courses', labelKey: 'nav.courses', route: '/student/courses', order: 20, icon: 'pi pi-book' },
  { id: 'home', labelKey: 'nav.home', route: '/student', order: 10, icon: 'pi pi-home' },
  { id: 'passport', labelKey: 'nav.passport', route: '/student/passport' },
];

function wrapEnvelope<T>(data: T): IResponse<T> {
  return {
    message: {
      messageType: MESSAGE_TYPES.Success,
      messageTypeName: 'Success',
      messages: [],
    },
    data,
  };
}

/** يفرّغ مهام Microtasks ثم تأثيرات httpResource داخل TestBed. */
async function settle(): Promise<void> {
  await Promise.resolve();
  TestBed.tick();
}

describe('NavService', () => {
  let nav: NavService;
  let auth: AuthService;
  let httpTesting: HttpTestingController;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ...provideMockAuthApi()],
    });

    nav = TestBed.inject(NavService);
    auth = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    doc = TestBed.inject(DOCUMENT);
    doc.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; Path=/`;
  });

  afterEach(() => {
    httpTesting.verify();
    doc.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; Path=/`;
    TestBed.resetTestingModule();
  });

  it('returns empty items with no HTTP request while unauthenticated', () => {
    TestBed.tick();

    expect(nav.items()).toEqual([]);
    expect(nav.isLoading()).toBe(false);
    httpTesting.expectNone(USER_MENU_ENDPOINT);
  });

  it('fetches, unwraps IResponse, toggles isLoading, and sorts menu items after login', async () => {
    await auth.login('student', {
      identifier: 'student@mozakrety.test',
      password: DEMO_PASSWORD,
    });
    TestBed.tick();

    expect(nav.isLoading()).toBe(true);
    const req = httpTesting.expectOne(USER_MENU_ENDPOINT);
    expect(req.request.method).toBe('GET');

    req.flush(wrapEnvelope(MOCK_MENU));
    await settle();

    expect(nav.isLoading()).toBe(false);
    expect(nav.items().map((item) => item.id)).toEqual(['passport', 'home', 'courses']);
  });

  it('caches menu items across reads and only refetches on reload()', async () => {
    await auth.login('student', {
      identifier: 'student@mozakrety.test',
      password: DEMO_PASSWORD,
    });
    TestBed.tick();

    const firstReq = httpTesting.expectOne(USER_MENU_ENDPOINT);
    firstReq.flush(wrapEnvelope([MOCK_MENU[1]]));
    await settle();

    expect(nav.items()).toHaveLength(1);
    // القراءة المتكررة لا ترسل طلب HTTP جديداً
    expect(nav.items()[0]?.id).toBe('home');
    httpTesting.expectNone(USER_MENU_ENDPOINT);

    expect(nav.reload()).toBe(true);
    TestBed.tick();

    const reloadReq = httpTesting.expectOne(USER_MENU_ENDPOINT);
    reloadReq.flush(wrapEnvelope(MOCK_MENU));
    await settle();

    expect(nav.items().map((item) => item.id)).toEqual(['passport', 'home', 'courses']);
  });

  it('resets items to empty on logout()', async () => {
    await auth.login('student', {
      identifier: 'student@mozakrety.test',
      password: DEMO_PASSWORD,
    });
    TestBed.tick();

    const req = httpTesting.expectOne(USER_MENU_ENDPOINT);
    req.flush(wrapEnvelope(MOCK_MENU));
    await settle();
    expect(nav.items()).toHaveLength(3);

    await auth.logout();
    await settle();

    expect(nav.items()).toEqual([]);
    expect(nav.isLoading()).toBe(false);
  });
});
