import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const rootDir = process.cwd();
const arPath = resolve(rootDir, 'public', 'i18n', 'ar.json');
const enPath = resolve(rootDir, 'public', 'i18n', 'en.json');
const srcDir = resolve(rootDir, 'src');

function flattenKeys(obj, prefix = '') {
  const keys = new Map();
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      for (const [childKey, childVal] of flattenKeys(v, fullKey)) {
        keys.set(childKey, childVal);
      }
    } else {
      keys.set(fullKey, v);
    }
  }
  return keys;
}

function collectFiles(dir, extensions) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectFiles(full, extensions));
    } else if (extensions.some((ext) => full.endsWith(ext)) && !full.endsWith('.spec.ts')) {
      results.push(full);
    }
  }
  return results;
}

const KEY_PATTERNS = [
  /['"`]([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)['"`]\s*\|\s*translate\b/g,
  /\btranslate\.(?:stream|get|translate)\(\s*['"`]([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)['"`]/g,
  /\b(?:toast|toastService)\.(?:show|success|error|warn|info)\(\s*(?:['"`]([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)['"`])/g,
  /\b(?:input|signal)\(\s*['"`]([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)['"`]/g,
  /\b[a-zA-Z0-9_]*(?:[Ll]abel|[Tt]itle|[Hh]eader|[Ss]ubtitle|[Pp]laceholder|[Hh]elper|[Hh]int|[Ee]rror|[Aa]riaLabel|[Cc]loseAriaLabel|[Dd]escription|[Mm]essage|[Dd]etail|[Ss]ummary)(?:Key)?\s*[:=]\s*['"`]([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)['"`]/g,
  /['"`](VALIDATION\.[A-Z0-9_]+)['"`]/g,
];

const arJson = JSON.parse(readFileSync(arPath, 'utf-8'));
const enJson = JSON.parse(readFileSync(enPath, 'utf-8'));

const arMap = flattenKeys(arJson);
const enMap = flattenKeys(enJson);

const errors = [];

for (const [key, val] of arMap.entries()) {
  if (typeof val !== 'string' || val.trim().length === 0) {
    errors.push(`[ar.json] Key "${key}" has an empty or non-string value.`);
  }
  if (!enMap.has(key)) {
    errors.push(`[en.json] Missing key "${key}" (present in ar.json).`);
  }
}

for (const [key, val] of enMap.entries()) {
  if (typeof val !== 'string' || val.trim().length === 0) {
    errors.push(`[en.json] Key "${key}" has an empty or non-string value.`);
  }
  if (!arMap.has(key)) {
    errors.push(`[ar.json] Missing key "${key}" (present in en.json).`);
  }
}

const usedKeys = new Set();
const sourceFiles = collectFiles(srcDir, ['.ts', '.html']);

for (const file of sourceFiles) {
  const content = readFileSync(file, 'utf-8');
  for (const regex of KEY_PATTERNS) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }
  }
}

for (const key of usedKeys) {
  if (!arMap.has(key)) {
    errors.push(`[Code -> ar.json] Missing translation key "${key}" referenced in source.`);
  }
  if (!enMap.has(key)) {
    errors.push(`[Code -> en.json] Missing translation key "${key}" referenced in source.`);
  }
}

if (!process.argv.includes('--allow-unused')) {
  for (const key of arMap.keys()) {
    if (!usedKeys.has(key)) {
      errors.push(`[Unused key] "${key}" is defined in translation JSON files but never referenced in src/.`);
    }
  }
}

if (errors.length > 0) {
  console.error('Mozakrety i18n key check failed:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(
  `Mozakrety i18n check passed: ${String(arMap.size)} keys verified across ar.json and en.json (${String(usedKeys.size)} referenced in src/).`,
);
