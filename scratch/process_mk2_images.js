const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const artifactsDir = "C:\\Users\\aleen\\.gemini\\antigravity\\brain\\7cbf25c8-50be-42d9-92b7-274d53645724";
  const publicDir = path.join(__dirname, '..', 'public');

  // Image 1: Crop the bottom portion to remove the "AUDIOPOWERED" branded box
  const img1Src = path.join(artifactsDir, 'media__1784885296543.jpg');
  const img1Dst = path.join(publicDir, 'diaphragm-ccaw-d450-mk2-1.jpg');

  console.log(`Processing and cropping image 1: ${img1Src}...`);
  const meta = await sharp(img1Src).metadata();
  console.log(`Original dimensions: width=${meta.width}, height=${meta.height}`);

  // Crop the bottom part where the circular diaphragm is located
  // We want to skip the top 48% (which contains the branded box) and capture the bottom 52%
  const cropHeight = Math.floor(meta.height * 0.52);
  const cropTop = meta.height - cropHeight;

  await sharp(img1Src)
    .extract({
      left: 0,
      top: cropTop,
      width: meta.width,
      height: cropHeight
    })
    .resize(1000, 1000, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(img1Dst);

  console.log(`Saved optimized and cropped image 1 to ${img1Dst}`);

  // Image 2: Save as optimized JPEG
  const img2Src = path.join(artifactsDir, 'media__1784885296545.png');
  const img2Dst = path.join(publicDir, 'diaphragm-ccaw-d450-mk2-2.jpg');

  console.log(`Processing and optimizing image 2: ${img2Src}...`);
  await sharp(img2Src)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(img2Dst);

  console.log(`Saved optimized image 2 to ${img2Dst}`);
}

main().catch(console.error);
