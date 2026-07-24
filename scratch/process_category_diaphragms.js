const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const artifactsDir = "C:\\Users\\aleen\\.gemini\\antigravity\\brain\\7cbf25c8-50be-42d9-92b7-274d53645724";
  const publicDir = path.join(__dirname, '..', 'public');

  const srcPath = path.join(artifactsDir, 'category_diaphragms_f3f3f3_1784897109324.jpg');
  const dstPath = path.join(publicDir, 'category-diaphragms.jpg');

  console.log(`Processing category image ${srcPath} -> ${dstPath}...`);
  await sharp(srcPath)
    .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(dstPath);
    
  console.log("Category image saved successfully to public/category-diaphragms.jpg");
}

main().catch(console.error);
