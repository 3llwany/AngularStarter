import { describe, expect, it } from 'vitest';
import { ROLES } from './role';
import { contrastRatio, ROLE_PALETTES } from './role-palettes';

describe('ROLE_PALETTES WCAG AA contrast', () => {
  it('defines all 6 roles with exact brand base colors at shade 500', () => {
    expect(ROLE_PALETTES.student.scale['500']).toBe('#2A6EEE');
    expect(ROLE_PALETTES.parent.scale['500']).toBe('#10B981');
    expect(ROLE_PALETTES.teacher.scale['500']).toBe('#8B5CF6');
    expect(ROLE_PALETTES.school.scale['500']).toBe('#EF4444');
    expect(ROLE_PALETTES.partner.scale['500']).toBe('#F59E0B');
    expect(ROLE_PALETTES.admin.scale['500']).toBe('#4F46E5');
  });

  for (const role of ROLES) {
    it(`meets WCAG AA (>= 4.5:1) for filled interactive controls (shade 600, 700, 800) with onPrimary in role "${role}"`, () => {
      const palette = ROLE_PALETTES[role];
      const ratio600 = contrastRatio(palette.scale['600'], palette.onPrimary);
      const ratio700 = contrastRatio(palette.scale['700'], palette.onPrimary);
      const ratio800 = contrastRatio(palette.scale['800'], palette.onPrimary);

      expect(ratio600).toBeGreaterThanOrEqual(4.5);
      expect(ratio700).toBeGreaterThanOrEqual(4.5);
      expect(ratio800).toBeGreaterThanOrEqual(4.5);
    });

    it(`meets WCAG AA (>= 4.5:1) for base shade 500 paired with onPrimary500 and primaryContrast in role "${role}"`, () => {
      const palette = ROLE_PALETTES[role];
      const ratio500 = contrastRatio(palette.scale['500'], palette.onPrimary500);
      const ratioContrast = contrastRatio(palette.scale['500'], palette.primaryContrast);
      expect(ratio500).toBeGreaterThanOrEqual(4.5);
      expect(ratioContrast).toBeGreaterThanOrEqual(4.5);
      expect(palette.primaryGradient).toContain('linear-gradient');
    });

    it(`meets WCAG AA UI boundary contrast (>= 3.0:1) for shade 600 against white surface in role "${role}"`, () => {
      const palette = ROLE_PALETTES[role];
      const uiBoundaryRatio = contrastRatio(palette.scale['600'], '#FFFFFF');
      expect(uiBoundaryRatio).toBeGreaterThanOrEqual(3.0);
    });
  }
});
