# العقود البرمجية للواجهة الأساسية: المرحلة الثانية (`002-core-infrastructure`)

**الفرع**: `002-core-infrastructure` | **التاريخ**: 2026-11-15 | **المواصفة**: [spec.md](spec.md)

التواقيع البرمجية المعتمدة في TypeScript داخل `src/app/core/**` مع الالتزام التام بعدم استيراد `primeng/*` نهائياً.

---

## 1. عقود المصادقة والاستراتيجيات (`src/app/core/auth/`)

```ts
export abstract class AuthApi {
  abstract login(payload: AuthLoginPayload): Promise<AuthUser>;
  abstract logout(): Promise<void>;
  abstract me(): Promise<AuthUser | null>;
}

export const AUTH_API = new InjectionToken<AuthApi>('AUTH_API');

export interface AuthStrategy {
  readonly role: Role;
  readonly identifierField: AuthIdentifierFieldDef;
  validateIdentifier(value: string): AuthValidationResult;
  toLoginPayload(credentials: RoleCredentialsInput): AuthLoginPayload;
}

export const AUTH_STRATEGIES = new InjectionToken<readonly AuthStrategy[]>('AUTH_STRATEGIES');
export function provideAuthStrategy(strategy: AuthStrategy): Provider;

@Service()
export class AuthStrategyFactory {
  getStrategy(role: Role): AuthStrategy;
  hasStrategy(role: Role): boolean;
  getSupportedRoles(): readonly Role[];
}

export const SESSION_HINT_COOKIE = 'moz_session_hint';
export function shouldAttemptSessionRestore(
  platformId: object,
  cookies: CookieService,
  locationPath: string,
): boolean;

@Service()
export class AuthService {
  readonly user: Signal<AuthUser | null>;
  readonly status: Signal<AuthStatus>;
  readonly role: Signal<Role | null>;
  readonly isAuthenticated: Signal<boolean>;
  login(role: Role, credentials: RoleCredentialsInput): Promise<AuthUser>;
  logout(): Promise<void>;
  restoreSession(): Promise<AuthUser | null>;
  ensureSessionResolved(): Promise<AuthStatus>;
  markAnonymous(): void;
  handleUnauthorized(): void;
}
```

---

## 2. حراس المسارات (`src/app/core/auth/guards/`)

```ts
export function roleGuard(expectedRole: Role): CanMatchFn;
export const roleRedirectGuard: CanActivateFn;
export const guestGuard: CanMatchFn;
```

---

## 3. الـ HTTP Interceptors ومحوّل الأخطاء (`src/app/core/http/` و `src/app/core/errors/`)

```ts
export const SKIP_BASE_URL = new HttpContextToken<boolean>(() => false);
export const SKIP_COMMON_PARAMS = new HttpContextToken<boolean>(() => false);
export const SKIP_CREDENTIALS = new HttpContextToken<boolean>(() => false);
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export const credentialsInterceptor: HttpInterceptorFn;
export const localeHeaderInterceptor: HttpInterceptorFn;
export const errorMappingInterceptor: HttpInterceptorFn;

export function mapHttpErrorToAppError(error: unknown, notified?: boolean): AppError;
export function isAppError(value: unknown): value is AppError;
```

---

## 4. خدمة الـ SEO ومولّدات `JSON-LD` (`src/app/core/seo/`)

```ts
@Service()
export class SeoService {
  setPage(config: PageSeoConfig): void;
  setTitle(title: string, rawTitle?: boolean): void;
  setStatus(status: number): void;
  setNotFound(title: string, description?: string): void;
  setJsonLd(schema: JsonLdSchema | readonly JsonLdSchema[]): void;
  clearJsonLd(): void;
}
```

---

## 5. سجل التنقل وناقل الأحداث ومنفذ التوست (`navigation/`, `events/`, `errors/`)

```ts
export const NAV_ITEMS = new InjectionToken<readonly (readonly NavItem[])[]>('NAV_ITEMS');
export function provideNavItems(items: readonly NavItem[]): Provider;

@Service()
export class EventBusService {
  readonly lastEvent: Signal<DomainEvent | null>;
  emit<TEvent extends DomainEvent>(event: NewDomainEvent<TEvent>): void;
  on<TEvent extends DomainEvent>(type: TEvent['type']): Observable<TEvent>;
  all(): Observable<DomainEvent>;
}

export const TOAST_PORT = new InjectionToken<ToastPort>('TOAST_PORT');
```
