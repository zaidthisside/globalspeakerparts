const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

const inputPath = 'C:\\Users\\aleen\\.gemini\\antigravity\\brain\\7cbf25c8-50be-42d9-92b7-274d53645724\\.user_uploaded\\media__1785046091228.jpg';
const outputPath = path.join(__dirname, '..', 'public', 'products', '12-speaker-foam-edges.jpg');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

try {
  const jpegData = fs.readFileSync(inputPath);
  const rawImageData = jpeg.decode(jpegData, { useTArray: true });

  const width = rawImageData.width;
  const height = rawImageData.height;
  const data = rawImageData.data; // RGBA Uint8Array

  // Replace near-white pixels with F3F3F3
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // F3F3F3 is RGB (243, 243, 243)
    if (r > 248 && g > 248 && b > 248) {
      data[i] = 243;
      data[i + 1] = 243;
      data[i + 2] = 243;
    }
  }

  const encoded = jpeg.encode({
    data: data,
    width: width,
    height: height
  }, 95);

  fs.writeFileSync(outputPath, encoded.data);
  console.log('Successfully replaced background with #F3F3F3 and saved to ' + outputPath);
} catch (err) {
  console.error('Error processing image:', err);
}
