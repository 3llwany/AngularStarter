import { Role } from './role';

export type ShadeKey =
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950';

export type PaletteScale = Readonly<Record<ShadeKey, string>>;

export interface RolePalette {
  readonly role: Role;
  readonly labelKey: string;
  readonly base: string;
  readonly scale: PaletteScale;
  /** Accessible text color on top of base `scale['500']` (>= 4.5:1 WCAG AA). */
  readonly primaryContrast: string;
  /** Primary button gradient token. */
  readonly primaryGradient: string;
  /** Accessible foreground color on top of `scale['500']` (>= 4.5:1 WCAG AA). */
  readonly onPrimary500: string;
  /** Accessible foreground color on top of `scale['600']` filled controls (>= 4.5:1 WCAG AA). */
  readonly onPrimary: string;
}

export const ROLE_PALETTES: Readonly<Record<Role, RolePalette>> = {
  student: {
    role: 'student',
    labelKey: 'common.roles.student',
    base: '#2A6EEE',
    primaryContrast: '#FFFFFF',
    primaryGradient: 'linear-gradient(135deg, #6E9BF2 0%, #2A6EEE 100%)',
    onPrimary500: '#FFFFFF',
    onPrimary: '#FFFFFF',
    scale: {
      '50': '#E6EEFF',
      '100': '#D4E3FF',
      '200': '#B3CEFE',
      '300': '#8EB4FC',
      '400': '#6E9BF2',
      '500': '#2A6EEE',
      '600': '#1F59CC',
      '700': '#1745A3',
      '800': '#13367D',
      '900': '#0F2757',
      '950': '#08152E',
    },
  },
  parent: {
    role: 'parent',
    labelKey: 'common.roles.parent',
    base: '#10B981',
    primaryContrast: '#052E16',
    primaryGradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    onPrimary500: '#052E16',
    onPrimary: '#FFFFFF',
    scale: {
      '50': '#ECFDF5',
      '100': '#D1FAE5',
      '200': '#A7F3D0',
      '300': '#6EE7B7',
      '400': '#34D399',
      '500': '#10B981',
      '600': '#047857',
      '700': '#065F46',
      '800': '#064E3B',
      '900': '#022C22',
      '950': '#011C16',
    },
  },
  teacher: {
    role: 'teacher',
    labelKey: 'common.roles.teacher',
    base: '#8B5CF6',
    primaryContrast: '#090414',
    primaryGradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    onPrimary500: '#090414',
    onPrimary: '#FFFFFF',
    scale: {
      '50': '#F5F3FF',
      '100': '#EDE9FE',
      '200': '#DDD6FE',
      '300': '#C4B5FD',
      '400': '#A78BFA',
      '500': '#8B5CF6',
      '600': '#6D28D9',
      '700': '#5B21B6',
      '800': '#4C1D95',
      '900': '#2E1065',
      '950': '#1E0942',
    },
  },
  school: {
    role: 'school',
    labelKey: 'common.roles.school',
    base: '#EF4444',
    primaryContrast: '#1F0404',
    primaryGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    onPrimary500: '#1F0404',
    onPrimary: '#FFFFFF',
    scale: {
      '50': '#FEF2F2',
      '100': '#FEE2E2',
      '200': '#FECACA',
      '300': '#FCA5A5',
      '400': '#F87171',
      '500': '#EF4444',
      '600': '#DC2626',
      '700': '#B91C1C',
      '800': '#991B1B',
      '900': '#7F1D1D',
      '950': '#450A0A',
    },
  },
  partner: {
    role: 'partner',
    labelKey: 'common.roles.partner',
    base: '#F59E0B',
    primaryContrast: '#1C1002',
    primaryGradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
    onPrimary500: '#1C1002',
    onPrimary: '#FFFFFF',
    scale: {
      '50': '#FFFBEB',
      '100': '#FEF3C7',
      '200': '#FDE68A',
      '300': '#FCD34D',
      '400': '#FBBF24',
      '500': '#F59E0B',
      '600': '#B45309',
      '700': '#92400E',
      '800': '#78350F',
      '900': '#451A03',
      '950': '#270E01',
    },
  },
  admin: {
    role: 'admin',
    labelKey: 'common.roles.admin',
    base: '#4F46E5',
    primaryContrast: '#FFFFFF',
    primaryGradient: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
    onPrimary500: '#FFFFFF',
    onPrimary: '#FFFFFF',
    scale: {
      '50': '#EEF2FF',
      '100': '#E0E7FF',
      '200': '#C7D2FE',
      '300': '#A5B4FC',
      '400': '#818CF8',
      '500': '#4F46E5',
      '600': '#4338CA',
      '700': '#3730A3',
      '800': '#312E81',
      '900': '#1E1B4B',
      '950': '#0F0D2E',
    },
  },
};

export function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const toLinear = (channel: number): number =>
    channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const brightest = Math.max(lumA, lumB);
  const darkest = Math.min(lumA, lumB);
  return (brightest + 0.05) / (darkest + 0.05);
}
