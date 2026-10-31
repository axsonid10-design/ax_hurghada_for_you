const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== 'dev-dist' && f !== 'dist') files = files.concat(walk(full));
    } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
      files.push(full);
    }
  }
  return files;
}

const arabicRegex = /[\u0600-\u06FF]/;

const filesWithArabic = [];
for (const file of walk('src/components')) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const matchingLines = [];
  lines.forEach((line, idx) => {
    // ignore if it's translations or initialSetup
    if (arabicRegex.test(line)) {
      // Check if it's not inside a lang === 'ar' condition or t('...')
      matchingLines.push({ lineNum: idx + 1, text: line.trim() });
    }
  });
  if (matchingLines.length > 0) {
    filesWithArabic.push({ file, count: matchingLines.length, sample: matchingLines.slice(0, 5) });
  }
}

console.log('Files in src/components containing Arabic:');
for (const f of filesWithArabic) {
  console.log(`- ${f.file} (${f.count} lines)`);
}
