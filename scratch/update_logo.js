const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const artifactsDir = "C:\\Users\\aleen\\.gemini\\antigravity\\brain\\7cbf25c8-50be-42d9-92b7-274d53645724";
  const publicDir = path.join(__dirname, '..', 'public');

  const srcPath = path.join(artifactsDir, 'media__1784894879640.png');
  const dstPath = path.join(publicDir, 'logo-horizontal.jpg');

  console.log(`Processing logo ${srcPath} -> ${dstPath}...`);
  
  // Convert PNG (which may have transparency) to JPEG with white background
  await sharp(srcPath)
    .resize(800, 300, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 95 })
    .toFile(dstPath);
    
  console.log("Logo updated successfully!");
}

main().catch(console.error);
