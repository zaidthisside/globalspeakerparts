const fs = require('fs');
const path = require('path');

async function main() {
  // Use dynamic import for the ES module legacy build of pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const pdfPath = path.join(__dirname, '..', 'AUDIOPOWERED DIAPHRAGM.pdf');
  console.log(`Loading PDF from ${pdfPath}...`);
  
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  
  console.log(`PDF Loaded successfully. Total Pages: ${pdf.numPages}`);
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    console.log(`--- Page ${i} ---`);
    console.log(text.trim());
  }
}

main().catch(err => {
  console.error("Error inspecting PDF:", err);
});
