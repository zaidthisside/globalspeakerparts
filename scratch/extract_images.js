const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

async function main() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.join(__dirname, '..', 'AUDIOPOWERED DIAPHRAGM.pdf');
  const outputDir = path.join(__dirname, 'extracted');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Loading PDF from ${pdfPath}...`);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  console.log(`PDF Loaded. Total pages: ${doc.numPages}`);

  for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
    console.log(`Processing page ${pageNo}...`);
    const page = await doc.getPage(pageNo);
    const ops = await page.getOperatorList();
    
    let imgCount = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
        imgCount++;
        const imageId = ops.argsArray[i][0];
        
        try {
          // Wait for object to be resolved if needed, or get directly
          const img = page.objs.get(imageId);
          if (!img) {
            console.log(`  [Page ${pageNo}] Image object ${imageId} not found in page.objs`);
            continue;
          }

          const outPath = path.join(outputDir, `page_${pageNo}_img_${imgCount}.png`);
          console.log(`  Found image ${imageId}: width=${img.width}, height=${img.height}, kind=${img.kind}`);
          
          if (img.kind === 1) { // RGB
            const png = new PNG({ width: img.width, height: img.height });
            // Copy RGB to RGBA
            let srcIdx = 0;
            let dstIdx = 0;
            for (let y = 0; y < img.height; y++) {
              for (let x = 0; x < img.width; x++) {
                png.data[dstIdx++] = img.data[srcIdx++];   // R
                png.data[dstIdx++] = img.data[srcIdx++];   // G
                png.data[dstIdx++] = img.data[srcIdx++];   // B
                png.data[dstIdx++] = 255;                  // A
              }
            }
            png.pack().pipe(fs.createWriteStream(outPath));
            console.log(`  Saved RGB image to ${outPath}`);
          } else if (img.kind === 2) { // RGBA
            const png = new PNG({ width: img.width, height: img.height });
            png.data = Buffer.from(img.data);
            png.pack().pipe(fs.createWriteStream(outPath));
            console.log(`  Saved RGBA image to ${outPath}`);
          } else if (img.kind === 3) { // Grayscale
            const png = new PNG({ width: img.width, height: img.height });
            let srcIdx = 0;
            let dstIdx = 0;
            for (let y = 0; y < img.height; y++) {
              for (let x = 0; x < img.width; x++) {
                const val = img.data[srcIdx++];
                png.data[dstIdx++] = val;   // R
                png.data[dstIdx++] = val;   // G
                png.data[dstIdx++] = val;   // B
                png.data[dstIdx++] = 255;   // A
              }
            }
            png.pack().pipe(fs.createWriteStream(outPath));
            console.log(`  Saved Grayscale image to ${outPath}`);
          } else {
            // Raw Jpeg stream / standard data buffer
            if (img.data && img.data.length > 0) {
              const jpgPath = path.join(outputDir, `page_${pageNo}_img_${imgCount}.jpg`);
              fs.writeFileSync(jpgPath, img.data);
              console.log(`  Saved Raw Image stream to ${jpgPath}`);
            } else {
              console.log(`  Unknown or empty image data for imageId ${imageId}`);
            }
          }
        } catch (e) {
          console.error(`  Error extracting imageId ${imageId}:`, e.message);
        }
      }
    }
  }
}

main().catch(err => {
  console.error("Error executing image extraction:", err);
});
