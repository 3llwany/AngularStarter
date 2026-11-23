import { DOCUMENT, inject, Service, signal, Signal } from '@angular/core';
import { CookieService } from '../platform/cookie';
import { DEFAULT_ROLE, isRole, Role, ROLE_COOKIE_NAME } from './role';

@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly cookies = inject(CookieService);
  private readonly roleSignal = signal<Role>(DEFAULT_ROLE);

  readonly currentRole: Signal<Role> = this.roleSignal.asReadonly();
  readonly role: Signal<Role> = this.currentRole;

  constructor() {
    const initial = this.resolveInitialRole();
    this.applyRole(initial, false);
  }

  setRole(role: unknown): void {
    const validated: Role = isRole(role) ? role : DEFAULT_ROLE;
    this.applyRole(validated, true);
  }

  private resolveInitialRole(): Role {
    const fromCookie = this.cookies.get(ROLE_COOKIE_NAME);
    if (isRole(fromCookie)) {
      return fromCookie;
    }
    const fromAttr = this.document.documentElement?.getAttribute('data-role');
    if (isRole(fromAttr)) {
      return fromAttr;
    }
    return DEFAULT_ROLE;
  }

  private applyRole(role: Role, persist: boolean): void {
    this.roleSignal.set(role);
    this.document.documentElement?.setAttribute('data-role', role);
    if (persist) {
      this.cookies.set(ROLE_COOKIE_NAME, role);
    }
  }
}
