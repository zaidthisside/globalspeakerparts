const fs = require('fs');
const path = require('path');

async function main() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.join(__dirname, '..', 'AUDIOPOWERED DIAPHRAGM.pdf');
  
  console.log(`Loading PDF from ${pdfPath}...`);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  console.log("Fetching metadata...");
  try {
    const meta = await doc.getMetadata();
    console.log("Metadata:", JSON.stringify(meta, null, 2));
  } catch (e) {
    console.error("Error fetching metadata:", e);
  }
}

main().catch(err => {
  console.error("Error fetching outlines:", err);
});
