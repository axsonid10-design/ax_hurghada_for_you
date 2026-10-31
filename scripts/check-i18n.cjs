const fs = require('fs');
const path = require('path');

const transFile = fs.readFileSync('src/i18n/translations.js', 'utf8');
const arKeys = new Set();
const enKeys = new Set();

const arSection = transFile.split('ar: {')[1].split('en: {')[0];
const enSection = transFile.split('en: {')[1];

for (const m of arSection.matchAll(/^\s*([a-zA-Z0-9_]+)\s*:/gm)) {
  arKeys.add(m[1]);
}
for (const m of enSection.matchAll(/^\s*([a-zA-Z0-9_]+)\s*:/gm)) {
  enKeys.add(m[1]);
}

console.log('Total AR keys:', arKeys.size, 'Total EN keys:', enKeys.size);

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

const usedKeys = new Set();
const keySources = {};
for (const file of walk('src')) {
  if (file.includes('translations.js')) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const m of content.matchAll(/\bt\(\s*['"]([a-zA-Z0-9_]+)['"]/g)) {
    usedKeys.add(m[1]);
    if (!keySources[m[1]]) keySources[m[1]] = [];
    keySources[m[1]].push(file);
  }
}

console.log('Total used t() keys in src:', usedKeys.size);
const missingInAr = [...usedKeys].filter(k => !arKeys.has(k));
const missingInEn = [...usedKeys].filter(k => !enKeys.has(k));
console.log('Keys used in code but MISSING in AR (count: ' + missingInAr.length + '):', missingInAr);
console.log('Keys used in code but MISSING in EN (count: ' + missingInEn.length + '):', missingInEn);
