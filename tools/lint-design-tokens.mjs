import fs from 'node:fs';
import path from 'node:path';

const targetDir = path.resolve('src/app/shared/ui');
const bannedLiterals = ['354px', '370px'];
const violations = [];

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (/\.(ts|html|css)$/.test(entry.name) && !entry.name.endsWith('.spec.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        for (const literal of bannedLiterals) {
          if (line.includes(literal)) {
            violations.push({
              file: path.relative(process.cwd(), fullPath),
              line: index + 1,
              literal,
              preview: line.trim(),
            });
          }
        }
      });
    }
  }
}

scanDirectory(targetDir);

if (violations.length > 0) {
  console.error('\n❌ [Design Tokens Lint] Found banned Figma frame width literals:');
  for (const v of violations) {
    console.error(`  - ${v.file}:${v.line} contains "${v.literal}" -> "${v.preview}"`);
  }
  console.error(
    '\nRule: Widths 354px and 370px are mobile frame dimensions from Figma artboards, not component widths.',
  );
  console.error('All components must be fluid and follow container queries.\n');
  process.exit(1);
} else {
  console.log('✅ [Design Tokens Lint] No banned frame dimensions found in src/app/shared/ui/.');
  process.exit(0);
}
