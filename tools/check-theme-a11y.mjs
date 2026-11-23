// Theme accessibility gate (WCAG AA) for every role palette.
//
// 1. Parses the *runtime* tokens in src/styles/roles.css (per html[data-role]) and src/styles/theme.css.
// 2. Verifies roles.css stays in sync with ROLE_PALETTES in src/app/core/theme/role-palettes.ts (no drift).
// 3. Checks the foreground/background pairs actually used by the UI for all 6 roles:
//    text >= 4.5:1, UI boundaries / focus rings >= 3:1.
// Tokens are direction-agnostic, so the same results hold for RTL (ar) and LTR (en);
// direction-specific layout is guarded by `mozakrety/no-physical-direction` and
// `src/app/core/theme/theme-locale-matrix.spec.ts`.
import fs from 'node:fs';
import path from 'node:path';

const ROLES = ['student', 'parent', 'teacher', 'school', 'partner', 'admin'];
const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const WHITE = '#ffffff';
const TEXT = 4.5;
const UI = 3;

const read = (p) => fs.readFileSync(path.resolve(p), 'utf8');
const errors = [];
const warnings = [];

// ---------- CSS parsing ----------
function parseBlocks(css) {
  const blocks = [];
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const vars = {};
    for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[d[1]] = d[2].trim();
    blocks.push({ selector: m[1].trim(), vars });
  }
  return blocks;
}

const roleBlocks = parseBlocks(read('src/styles/roles.css'));
const rootVars = roleBlocks.find((b) => b.selector.includes(':root'))?.vars ?? {};
const varsForRole = (role) => ({
  ...rootVars,
  ...(roleBlocks.find((b) => b.selector.includes(`data-role='${role}'`))?.vars ?? {}),
});

const themeVars = Object.assign({}, ...parseBlocks(read('src/styles/theme.css')).map((b) => b.vars));

function resolve(vars, name, depth = 0) {
  const raw = vars[name];
  if (raw === undefined || depth > 10) return undefined;
  const ref = /^var\((--[\w-]+)\)$/.exec(raw);
  return ref ? resolve(vars, ref[1], depth + 1) : raw.toLowerCase();
}

// ---------- contrast ----------
const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function check(scope, label, fg, bg, min, { warnOnly = false } = {}) {
  if (!isHex(fg) || !isHex(bg)) {
    errors.push(`${scope}: cannot resolve colors for "${label}" (fg=${fg}, bg=${bg})`);
    return;
  }
  const ratio = contrast(fg, bg);
  if (ratio + 1e-9 < min) {
    const msg = `${scope}: ${label} = ${ratio.toFixed(2)}:1 (required >= ${min}:1)`;
    (warnOnly ? warnings : errors).push(msg);
  }
}

// ---------- 1) Drift check: roles.css <-> role-palettes.ts ----------
const paletteTs = read('src/app/core/theme/role-palettes.ts');
for (const role of ROLES) {
  const block = new RegExp(`\\b${role}:\\s*\\{([\\s\\S]*?)\\n  \\},`).exec(paletteTs)?.[1];
  if (!block) {
    errors.push(`role-palettes.ts: palette for "${role}" not found`);
    continue;
  }
  const field = (name) => new RegExp(`\\b${name}:\\s*'(#[0-9A-Fa-f]{6})'`).exec(block)?.[1]?.toLowerCase();
  const vars = varsForRole(role);
  const pairs = [
    ...SHADES.map((s) => [`scale['${s}']`, new RegExp(`'${s}':\\s*'(#[0-9A-Fa-f]{6})'`).exec(block)?.[1]?.toLowerCase(), `--moz-primary-${s}`]),
    ['onPrimary', field('onPrimary'), '--moz-on-primary'],
    ['onPrimary500', field('onPrimary500'), '--moz-on-primary-500'],
    ['primaryContrast', field('primaryContrast'), '--primary-contrast'],
  ];
  for (const [tsName, tsValue, cssVar] of pairs) {
    const cssValue = resolve(vars, cssVar);
    if (tsValue !== cssValue) {
      errors.push(`[${role}] drift: role-palettes.ts ${tsName}=${tsValue} but roles.css ${cssVar}=${cssValue}`);
    }
  }
}

// ---------- 2) Role-dependent pairs ----------
const surfaceSoft = resolve(themeVars, '--color-surface-soft');
for (const role of ROLES) {
  const v = varsForRole(role);
  const p = (s) => resolve(v, `--moz-primary-${s}`);
  const scope = `[${role}]`;
  check(scope, 'on-primary on primary-600 (filled button)', resolve(v, '--moz-on-primary'), p('600'), TEXT);
  check(scope, 'on-primary on primary-700 (hover/pressed)', resolve(v, '--moz-on-primary'), p('700'), TEXT);
  check(scope, 'on-primary-500 on primary-500', resolve(v, '--moz-on-primary-500'), p('500'), TEXT);
  check(scope, 'primary-contrast on primary-500', resolve(v, '--primary-contrast'), p('500'), TEXT);
  check(scope, 'primary-600 text/link on white', p('600'), WHITE, TEXT);
  check(scope, 'primary-700 text on primary-50 (selected/tinted)', p('700'), p('50'), TEXT);
  check(scope, 'primary-700 text on surface-soft', p('700'), surfaceSoft, TEXT);
  check(scope, 'primary-600 focus ring/border on white', p('600'), WHITE, UI);
  check(scope, 'primary-600 focus ring/border on surface-soft', p('600'), surfaceSoft, UI);
}

// ---------- 3) Role-independent neutrals & semantic tones ----------
const t = (name) => resolve(themeVars, `--color-${name}`);
const scope = '[neutral]';
for (const ink of ['ink', 'ink-subtle', 'subdued', 'subdued-alt']) {
  check(scope, `${ink} text on white`, t(ink), WHITE, TEXT);
}
for (const ink of ['ink', 'ink-subtle']) {
  check(scope, `${ink} text on surface-soft`, t(ink), surfaceSoft, TEXT);
}
for (const tone of ['success', 'warning', 'orange', 'error']) {
  check(scope, `semantic-${tone}-text on semantic-${tone}-bg`, t(`semantic-${tone}-text`), t(`semantic-${tone}-bg`), TEXT);
}
check(scope, 'semantic-error-border on white (invalid field)', t('semantic-error-border'), WHITE, UI);
// Informational only: these tokens must be used for disabled/placeholder/decorative purposes.
check(scope, 'muted on white (use only for disabled/placeholder)', t('muted'), WHITE, TEXT, { warnOnly: true });
check(scope, 'border-subtle on white (decorative only, not a sole field boundary)', t('border-subtle'), WHITE, UI, { warnOnly: true });

// ---------- report ----------
for (const w of warnings) console.warn(`⚠️  [Theme A11y] ${w}`);
if (errors.length > 0) {
  console.error('\n❌ [Theme A11y] WCAG AA violations / token drift:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✅ [Theme A11y] ${ROLES.length} roles × (ar/rtl, en/ltr) pass WCAG AA token checks.`);
