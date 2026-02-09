// Ensures the Payload importMap.js stub exists before Next.js compilation.
// Payload auto-generates the real content on startup/HMR, but Next.js
// needs the file to exist at compile time to resolve the import.

const fs = require('fs');
const path = require('path');

const importMapPath = path.join(
  __dirname,
  'src',
  'app',
  '(payload)',
  'admin',
  'importMap.js',
);

fs.mkdirSync(path.dirname(importMapPath), { recursive: true });

if (!fs.existsSync(importMapPath)) {
  fs.writeFileSync(importMapPath, 'export const importMap = {}\n');
}
