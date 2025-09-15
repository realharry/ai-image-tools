import fs from 'fs';
import path from 'path';

console.log('Post-processing Chrome extension build...');

// Copy manifest
fs.copyFileSync('public/manifest.json', 'dist/manifest.json');

// Move HTML files to root
if (fs.existsSync('dist/src/popup/index.html')) {
  fs.copyFileSync('dist/src/popup/index.html', 'dist/popup.html');
}
if (fs.existsSync('dist/src/sidepanel/index.html')) {
  fs.copyFileSync('dist/src/sidepanel/index.html', 'dist/sidepanel.html');
}

// Fix paths in HTML files
function fixHtmlPaths(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/src="\/([^"]+)"/g, 'src="./$1"');
    content = content.replace(/href="\/([^"]+)"/g, 'href="./$1"');
    fs.writeFileSync(filePath, content);
  }
}

fixHtmlPaths('dist/popup.html');
fixHtmlPaths('dist/sidepanel.html');

// Clean up
if (fs.existsSync('dist/src')) {
  fs.rmSync('dist/src', { recursive: true, force: true });
}

console.log('✅ Chrome extension build complete!');
console.log('📁 Load the dist/ folder in Chrome Developer Mode');