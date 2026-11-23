// Checks the single fixed app palette against WCAG AA contrast ratios.
import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(path.resolve('src/styles/palette.css'), 'utf8');
const tokens = Object.fromEntries(
  [...css.matchAll(/(--[\w-]+)\s*:\s*(#[\da-f]{6})\s*;/gi)].map((match) => [
    match[1],
    match[2].toLowerCase(),
  ]),
);
const errors = [];

function luminance(hex) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const [red, green, blue] = channels.map((value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground, background) {
  const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (high + 0.05) / (low + 0.05);
}

function check(foregroundToken, backgroundToken, minimum, label) {
  const foreground = tokens[foregroundToken];
  const background = tokens[backgroundToken];
  if (!foreground || !background) {
    errors.push(`${label}: missing palette token (${foregroundToken} or ${backgroundToken})`);
    return;
  }
  const ratio = contrast(foreground, background);
  if (ratio + 1e-9 < minimum) {
    errors.push(`${label}: ${ratio.toFixed(2)}:1; expected at least ${minimum}:1`);
  }
}

check('--app-on-primary', '--app-primary-600', 4.5, 'Primary button text');
check('--app-on-primary', '--app-primary-700', 4.5, 'Primary button hover text');
check('--app-primary-600', '--app-white', 4.5, 'Primary text on white');
check('--app-primary-700', '--app-primary-50', 4.5, 'Primary text on tinted surface');

if (errors.length) {
  console.error('Theme accessibility check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Theme accessibility check passed for the fixed palette.');
