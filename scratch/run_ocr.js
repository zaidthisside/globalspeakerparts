const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');

async function main() {
  const extractedDir = path.join(__dirname, 'extracted');
  const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} images to perform OCR on.`);
  
  // Sort files numerically by page number
  files.sort((a, b) => {
    const pageA = parseInt(a.split('_')[1]);
    const pageB = parseInt(b.split('_')[1]);
    return pageA - pageB;
  });

  const worker = await createWorker('eng');
  
  for (const file of files) {
    const filePath = path.join(extractedDir, file);
    console.log(`Performing OCR on ${file}...`);
    try {
      const { data: { text } } = await worker.recognize(filePath);
      console.log(`--- Result for ${file} ---`);
      console.log(text.trim());
      console.log('---------------------------');
    } catch (err) {
      console.error(`Error performing OCR on ${file}:`, err.message);
    }
  }
  
  await worker.terminate();
}

main().catch(console.error);
