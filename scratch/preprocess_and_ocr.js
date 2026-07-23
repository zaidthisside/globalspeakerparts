const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createWorker } = require('tesseract.js');

async function main() {
  const extractedDir = path.join(__dirname, 'extracted');
  const tempDir = path.join(__dirname, 'preprocessed');
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('.png'));
  console.log(`Preprocessing and OCR on ${files.length} images...`);

  // Sort files numerically by page number
  files.sort((a, b) => {
    const pageA = parseInt(a.split('_')[1]);
    const pageB = parseInt(b.split('_')[1]);
    return pageA - pageB;
  });

  const worker = await createWorker('eng');

  for (const file of files) {
    const pageNo = parseInt(file.split('_')[1]);
    const srcPath = path.join(extractedDir, file);
    const dstPath = path.join(tempDir, `page_${pageNo}_gray.png`);

    console.log(`Processing page ${pageNo}...`);
    try {
      // Downscale, convert to grayscale, and increase contrast using sharp
      await sharp(srcPath)
        .resize(1000) // downscale to 1000px width
        .grayscale()
        .normalize() // normalize contrast
        .toFile(dstPath);

      // Run OCR on the preprocessed image
      const { data: { text } } = await worker.recognize(dstPath);
      
      const cleanText = text.replace(/[\r\n]+/g, ' ').trim();
      console.log(`[Page ${pageNo}] Text: "${cleanText}"`);
      
      if (cleanText.toLowerCase().includes('450') || cleanText.toLowerCase().includes('d-450') || cleanText.toLowerCase().includes('ccaw')) {
        console.log(`>>> MATCH FOUND ON PAGE ${pageNo}! <<<`);
      }
    } catch (e) {
      console.error(`Error on page ${pageNo}:`, e.message);
    }
  }

  await worker.terminate();
}

main().catch(console.error);
