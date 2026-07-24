const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const artifactsDir = "C:\\Users\\aleen\\.gemini\\antigravity\\brain\\7cbf25c8-50be-42d9-92b7-274d53645724";
  const appDir = path.join(__dirname, '..', 'src', 'app');

  const srcPath = path.join(artifactsDir, 'media__1784894241889.png');
  const dstPath = path.join(appDir, 'icon.png');
  const oldIconPath = path.join(appDir, 'icon.jpg');

  console.log(`Processing favicon ${srcPath} -> ${dstPath}...`);
  
  // Convert icon to square 512x512 PNG with transparency
  await sharp(srcPath)
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toFile(dstPath);
    
  console.log(`Saved new favicon icon.png successfully!`);

  // Remove old icon.jpg to avoid conflicts
  if (fs.existsSync(oldIconPath)) {
    fs.unlinkSync(oldIconPath);
    console.log(`Removed old icon.jpg successfully!`);
  }
}

main().catch(console.error);
