import fs from 'fs';
import path from 'path';

// Function to copy files
function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}

// Function to update HTML paths
function fixHtmlPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix absolute paths to relative paths
  content = content.replace(/href="\/([^"]+)"/g, 'href="./$1"');
  content = content.replace(/src="\/([^"]+)"/g, 'src="./$1"');
  
  fs.writeFileSync(filePath, content);
}

console.log('Building Chrome extension...');

// Copy manifest
copyFile('public/manifest.json', 'dist/manifest.json');

// Fix HTML paths
fixHtmlPaths('dist/popup.html');
fixHtmlPaths('dist/sidepanel.html');

// Update manifest to remove icons section if needed
const manifest = JSON.parse(fs.readFileSync('dist/manifest.json', 'utf8'));
delete manifest.icons; // Remove icons for now
fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));

console.log('Extension build complete! Load the dist/ folder in Chrome.');