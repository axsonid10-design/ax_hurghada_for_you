import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Rule 2610 #6: Strict Capped Semantic Rollover (No digit reaches 10)
let [major, minor, patch] = (pkg.version || '1.0.0').split('.').map(Number);
if (isNaN(major)) major = 1;
if (isNaN(minor)) minor = 0;
if (isNaN(patch)) patch = 0;

patch += 1;
if (patch >= 10) {
  patch = 0;
  minor += 1;
}
if (minor >= 10) {
  minor = 0;
  major += 1;
}

pkg.version = `${major}.${minor}.${patch}`;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

const versionJsonPath = path.resolve(__dirname, '../public/version.json');
const versionData = {
  version: pkg.version,
  buildTime: new Date().toISOString(),
  name: pkg.name
};
fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2) + '\n', 'utf8');

console.log(`[Version Bumper] Version bumped to ${pkg.version}`);
