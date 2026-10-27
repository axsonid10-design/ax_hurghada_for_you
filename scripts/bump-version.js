import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const versionParts = pkg.version.split('.').map(Number);
versionParts[2] += 1;
pkg.version = versionParts.join('.');

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

const versionJsonPath = path.resolve(__dirname, '../public/version.json');
const versionData = {
  version: pkg.version,
  buildTime: new Date().toISOString(),
  name: pkg.name
};
fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2) + '\n', 'utf8');

console.log(`[Version Bumper] Version bumped to ${pkg.version}`);
