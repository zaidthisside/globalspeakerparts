const path = require('path');
const sharp = require('sharp');

async function main() {
  const srcPath = path.join(__dirname, 'extracted', 'page_3_img_1.png');
  const dstPath = path.join(__dirname, 'page_3_ref.jpg');
  
  console.log(`Resizing ${srcPath} to ${dstPath}...`);
  await sharp(srcPath)
    .resize(1024, 1024, { fit: 'inside' })
    .jpeg({ quality: 90 })
    .toFile(dstPath);
    
  console.log("Resize complete!");
}

main().catch(console.error);
