import fs from 'fs';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const png = PNG.sync.read(fs.readFileSync('__frame.png'));
let dark = 0, total = 0, sum = 0;
for (let y = 0; y < png.height; y += 4) {
  for (let x = 0; x < png.width; x += 4) {
    const i = (y * png.width + x) * 4;
    const lum = (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
    sum += lum;
    total++;
    if (png.data[i] < 128) dark++;
  }
}
console.log('frame:', png.width, 'x', png.height, '| oscuros:', (dark / total).toFixed(3), '| brillo medio:', (sum / total).toFixed(1));

const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height, { inversionAttempts: 'attemptBoth' });
console.log('jsQR en Node →', code ? `DECODEADO: ${code.data.slice(0, 80)}` : 'sin decodificar');
