import fs from 'node:fs';
import path from 'node:path';

const fontsDir = path.resolve('public/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function downloadFonts() {
  const url = 'https://fonts.googleapis.com/css2?family=Alexandria:wght@400;500;600;700&family=Stack+Sans+Text:wght@400;500;600&family=Stack+Sans+Headline:wght@600;700&display=swap';
  console.log('Fetching CSS from Google Fonts...');
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  const css = await res.text();

  // Parse font face blocks
  const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
  let match;
  let counter = 0;
  let localCss = '';

  while ((match = fontFaceRegex.exec(css)) !== null) {
    const block = match[1];
    const familyMatch = /font-family:\s*['"]?([^'";]+)['"]?/.exec(block);
    const weightMatch = /font-weight:\s*(\d+)/.exec(block);
    const styleMatch = /font-style:\s*([^;]+)/.exec(block);
    const urlMatch = /src:\s*url\((https:[^)]+)\)\s*format\(['"]?woff2['"]?\)/.exec(block);
    const unicodeMatch = /unicode-range:\s*([^;]+)/.exec(block);

    if (familyMatch && weightMatch && urlMatch) {
      counter++;
      const familyName = familyMatch[1].trim().replace(/\s+/g, '');
      const weight = weightMatch[1].trim();
      const style = styleMatch ? styleMatch[1].trim() : 'normal';
      const fontUrl = urlMatch[1].trim();
      const unicodeRange = unicodeMatch ? unicodeMatch[1].trim() : '';

      const filename = `${familyName}-${weight}-${counter}.woff2`;
      const filePath = path.join(fontsDir, filename);

      console.log(`Downloading ${filename} from ${fontUrl}...`);
      const fontRes = await fetch(fontUrl);
      const buffer = await fontRes.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      localCss += `@font-face {\n  font-family: '${familyMatch[1].trim()}';\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('/fonts/${filename}') format('woff2');\n${unicodeRange ? `  unicode-range: ${unicodeRange};\n` : ''}}\n\n`;
    }
  }

  console.log(`Downloaded ${counter} fonts.`);
  return localCss;
}

downloadFonts().then((generatedCss) => {
  if (generatedCss) {
    fs.writeFileSync('src/styles/fonts.css', generatedCss);
    console.log('Updated src/styles/fonts.css successfully!');
  }
}).catch((err) => {
  console.error('Failed to download fonts:', err);
  process.exit(1);
});
