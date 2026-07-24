const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const artifactsDir = "C:\\Users\\aleen\\.gemini\\antigravity\\brain\\7cbf25c8-50be-42d9-92b7-274d53645724";
  const publicDir = path.join(__dirname, '..', 'public');

  const files = [
    { src: 'media__1784873336885.jpg', dst: 'diaphragm-ccaw-d450-gold-1.jpg' },
    { src: 'media__1784873336981.jpg', dst: 'diaphragm-ccaw-d450-gold-2.jpg' },
    { src: 'media__1784873337022.png', dst: 'diaphragm-ccaw-d450-gold-3.jpg' }
  ];

  for (let i = 0; i < files.length; i++) {
    const srcPath = path.join(artifactsDir, files[i].src);
    const dstPath = path.join(publicDir, files[i].dst);

    console.log(`Processing and optimizing ${srcPath} -> ${dstPath}...`);
    
    // Resize to max 1200px width/height and save as optimized JPEG
    await sharp(srcPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(dstPath);

    console.log(`Saved ${files[i].dst}`);
  }
  
  console.log("All three gold diaphragm images processed successfully!");
}

main().catch(console.error);
