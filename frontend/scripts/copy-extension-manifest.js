const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'public', 'manifest-extension.json');
const dest = path.join(__dirname, '..', 'build', 'manifest.json');

if (!fs.existsSync(src)) {
  console.error(`Missing source manifest: ${src}`);
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log('Copied Chrome extension manifest to build/manifest.json');
