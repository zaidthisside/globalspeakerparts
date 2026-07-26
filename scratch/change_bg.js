const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;
const jpeg = require('jpeg-js');

const inputPath = 'C:\\Users\\aleen\\.gemini\\antigravity\\brain\\7cbf25c8-50be-42d9-92b7-274d53645724\\.user_uploaded\\media__1785044666900.png';
const outputPath = path.join(__dirname, '..', 'public', 'speaker-edge-ports.jpg');

fs.createReadStream(inputPath)
  .pipe(new PNG())
  .on('parsed', function () {
    const width = this.width;
    const height = this.height;
    const data = this.data; // Uint8Array of RGBA values

    // Create a buffer for the JPEG output (RGBA format)
    const outBuffer = Buffer.alloc(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) * 4;

        let r = data[idx];
        let g = data[idx + 1];
        let b = data[idx + 2];
        let a = data[idx + 3];

        // Check if the pixel is transparent or near-white
        // F3F3F3 is RGB (243, 243, 243)
        if (a < 5 || (r > 248 && g > 248 && b > 248)) {
          r = 243;
          g = 243;
          b = 243;
          a = 255;
        }

        outBuffer[idx] = r;
        outBuffer[idx + 1] = g;
        outBuffer[idx + 2] = b;
        outBuffer[idx + 3] = a;
      }
    }

    // Encode to JPEG using jpeg-js
    const rawImageData = {
      data: outBuffer,
      width: width,
      height: height,
    };
    const jpegImageData = jpeg.encode(rawImageData, 95);

    fs.writeFileSync(outputPath, jpegImageData.data);
    console.log('Successfully changed background to #F3F3F3 and saved to ' + outputPath);
  })
  .on('error', function (err) {
    console.error('Error reading PNG file:', err);
  });
