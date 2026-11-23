import { LoginForm, LoginRequest, LoginRole } from './auth.models';

// PROVISIONAL patterns: confirm the final formats with the backend team.
const EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const EGYPTIAN_MOBILE = /^01[0125]\d{8}$/;
const TEACHER_ID = /^[A-Z0-9][A-Z0-9-]{3,19}$/i;
const SCHOOL_CODE = /^[A-Z0-9][A-Z0-9-]{3,15}$/i;

const toLower = (value: string): string => value.trim().toLowerCase();
const toUpper = (value: string): string => value.trim().toUpperCase();
const removeSpacesAndDashes = (value: string): string => value.replace(/[\s-]+/g, '');

/** How one role signs in: which field it uses and how that field is validated. */
export interface LoginMethod {
  readonly field: string;
  readonly inputType: 'email' | 'tel' | 'text';
  readonly autocomplete: string;
  readonly labelKey: string;
  readonly placeholderKey: string;
  readonly errorKey: string;
  readonly pattern: RegExp;
  readonly normalize: (value: string) => string;
}

/**
 * One row per role. To support a new login role, add one row here.
 */
export const LOGIN_METHODS: Readonly<Record<LoginRole, LoginMethod>> = {
  student: {
    field: 'email',
    inputType: 'email',
    autocomplete: 'email',
    labelKey: 'auth.fields.email.label',
    placeholderKey: 'auth.fields.email.placeholder',
    errorKey: 'auth.fields.email.error',
    pattern: EMAIL,
    normalize: toLower,
  },
  parent: {
    field: 'mobileNumber',
    inputType: 'tel',
    autocomplete: 'tel-national',
    labelKey: 'auth.fields.mobile_number.label',
    placeholderKey: 'auth.fields.mobile_number.placeholder',
    errorKey: 'auth.fields.mobile_number.error',
    pattern: EGYPTIAN_MOBILE,
    normalize: removeSpacesAndDashes,
  },
  teacher: {
    field: 'teacherId',
    inputType: 'text',
    autocomplete: 'username',
    labelKey: 'auth.fields.teacher_id.label',
    placeholderKey: 'auth.fields.teacher_id.placeholder',
    errorKey: 'auth.fields.teacher_id.error',
    pattern: TEACHER_ID,
    normalize: toUpper,
  },
  school: {
    field: 'schoolCode',
    inputType: 'text',
    autocomplete: 'organization',
    labelKey: 'auth.fields.school_code.label',
    placeholderKey: 'auth.fields.school_code.placeholder',
    errorKey: 'auth.fields.school_code.error',
    pattern: SCHOOL_CODE,
    normalize: toUpper,
  },
  partner: {
    field: 'businessEmail',
    inputType: 'email',
    autocomplete: 'email',
    labelKey: 'auth.fields.business_email.label',
    placeholderKey: 'auth.fields.business_email.placeholder',
    errorKey: 'auth.fields.business_email.error',
    pattern: EMAIL,
    normalize: toLower,
  },
};

export function isValidIdentifier(role: LoginRole, value: string): boolean {
  const method = LOGIN_METHODS[role];
  return method.pattern.test(method.normalize(value));
}

export function buildLoginRequest(role: LoginRole, form: LoginForm): LoginRequest {
  const method = LOGIN_METHODS[role];
  return {
    role,
    identifier: method.normalize(form.identifier),
    identifierType: method.field,
    password: form.password,
  };
}
