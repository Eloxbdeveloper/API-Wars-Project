import fs from 'fs';
import { createRequire } from 'module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const jsqrSrc = fs.readFileSync(require.resolve('jsqr/dist/jsQR.js'), 'utf8');

const state = JSON.parse(fs.readFileSync('__pay_state.json', 'utf8'));
const res = await fetch(`http://localhost:3000/api/payments/${encodeURIComponent(state.referenceCode)}`);
const json = await res.json();
const qr = json?.data?.qr;
if (!qr) { console.error('Sin QR del cobro', json); process.exit(1); }
console.log('cobro:', state.referenceCode, '| estado:', json.data.status);

const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 1100 } });
await context.grantPermissions(['camera']);
const page = await context.newPage();

//1. Cámara virtual que proyecta el QR real del cobro
await page.addInitScript((qrDataUri) => {
  const img = new Image();
  img.src = qrDataUri;
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia = async () => {
      if (!img.complete) await new Promise((r) => { img.onload = r; img.onerror = r; });
      const size = 720;
      const pad = 60;

      // Composición fuera de pantalla: el QR se dibuja UNA vez para que el
      // stream nunca capture un fotograma a medio borrar (torn frame).
      const off = document.createElement('canvas');
      off.width = size; off.height = size;
      const octx = off.getContext('2d');
      octx.fillStyle = '#fff';
      octx.fillRect(0, 0, size, size);
      octx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);

      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const blit = () => ctx.drawImage(off, 0, 0);
      blit();
      setInterval(blit, 100);
      return canvas.captureStream(24);
    };
  }
}, qr);

//2. BarcodeDetector no existe en Chromium headless: se implementa con jsQR
//   (el escáner de la página sigue siendo el oficial; sólo se aporta el decodificador).
await page.addInitScript((src) => {
  try {
    if (document.documentElement) {
      const script = document.createElement('script');
      script.textContent = src;
      document.documentElement.appendChild(script);
    } else {
      window.eval(src);
    }
  } catch (e) {
    window.eval(src);
  }
  if (!window.jsQR) {
    const factory = new Function(`${src}\n;return typeof jsQR !== 'undefined' ? jsQR : window.jsQR;`);
    window.jsQR = factory();
  }

  const toImageData = (source) => {
    if (!source) return null;
    if (source instanceof ImageData) return source;
    if (source instanceof HTMLVideoElement) {
      const c = document.createElement('canvas');
      c.width = source.videoWidth; c.height = source.videoHeight;
      if (!c.width || !c.height) return null;
      c.getContext('2d').drawImage(source, 0, 0);
      return c.getContext('2d').getImageData(0, 0, c.width, c.height);
    }
    if (source instanceof HTMLCanvasElement) {
      return source.getContext('2d').getImageData(0, 0, source.width, source.height);
    }
    if (source instanceof ImageBitmap || source instanceof HTMLImageElement) {
      const c = document.createElement('canvas');
      c.width = source.naturalWidth || source.width;
      c.height = source.naturalHeight || source.height;
      if (!c.width || !c.height) return null;
      c.getContext('2d').drawImage(source, 0, 0);
      return c.getContext('2d').getImageData(0, 0, c.width, c.height);
    }
    return null;
  };

  window.BarcodeDetector = class BarcodeDetector {
    static async getSupportedFormats() { return ['qr_code']; }
    async detect(source) {
      window.__detectCalls = (window.__detectCalls || 0) + 1;
      try {
        const imageData = toImageData(source);
        if (!imageData) { window.__detectNoImageData = (window.__detectNoImageData || 0) + 1; return []; }
        if (window.__detectCalls % 30 === 1 && (window.__snapshots || []).length < 3) {
          let dark = 0, total = 0;
          for (let y = 0; y < imageData.height; y += 10) {
            for (let x = 0; x < imageData.width; x += 10) {
              const i = (y * imageData.width + x) * 4;
              total++;
              if (imageData.data[i] < 128) dark++;
            }
          }
          const c = document.createElement('canvas');
          c.width = imageData.width; c.height = imageData.height;
          c.getContext('2d').putImageData(imageData, 0, 0);
          window.__snapshots = window.__snapshots || [];
          window.__snapshots.push({ w: imageData.width, h: imageData.height, darkRatio: dark / total, url: c.toDataURL('image/png') });
        }
        if (!window.jsQR) { window.__detectNoJsQR = (window.__detectNoJsQR || 0) + 1; return []; }
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });
        if (!code || !code.data) { window.__detectNoCode = (window.__detectNoCode || 0) + 1; return []; }
        window.__lastDecoded = code.data.slice(0, 60);
        return [{ data: code.data, rawValue: code.data, location: code.location }];
      } catch (e) {
        window.__detectError = String(e && e.message || e);
        return [];
      }
    }
  };
}, jsqrSrc);

await page.goto('https://pay-api-sandbox.factus.com.co/simulator', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(800);
console.log('jsQR:', await page.evaluate(() => typeof window.jsQR),
  '| BarcodeDetector:', await page.evaluate(() => typeof window.BarcodeDetector));
await page.getByRole('button', { name: /Iniciar Cámara/i }).click();

let scanned = false;
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const ps = Array.from(document.querySelectorAll('p')).map((p) => p.innerText.trim());
    return {
      monto: ps.find((t) => /^\$/.test(t) && t.length < 30) || null,
      key: ps.find((t) => t.startsWith('@')) || null,
      paymentId: ps.find((t) => /^[0-9a-f]{8}-[0-9a-f-]+/i.test(t)) || null,
      calls: window.__detectCalls || 0,
      noImg: window.__detectNoImageData || 0,
      noJsQR: window.__detectNoJsQR || 0,
      noCode: window.__detectNoCode || 0,
      err: window.__detectError || null,
      decoded: window.__lastDecoded || null,
      snaps: (window.__snapshots || []).map((s) => ({ w: s.w, h: s.h, dark: Number(s.darkRatio.toFixed(3)) })),
      cameraError: (document.querySelector('p[x-show]') || {}).innerText || null
    };
  });
  const snap = await page.evaluate(() => (window.__snapshots && window.__snapshots[0]) ? window.__snapshots[0].url : null);
  if (snap && !globalThis.__snapSaved) {
    globalThis.__snapSaved = true;
    fs.writeFileSync('__frame.png', Buffer.from(snap.split(',')[1], 'base64'));
    console.log('frame guardado en __frame.png');
  }
  if (i % 3 === 0 || info.monto) console.log(`t+${i + 1}s`, JSON.stringify(info));
  if (info.monto && info.key) {
    scanned = true;
    console.log(`✅ escaneado en t+${i + 1}s → ${info.monto} | ${info.key.slice(0, 10)}… | ${info.paymentId}`);
    break;
  }
}
console.log('escaneado:', scanned);

if (scanned) {
  await page.selectOption('select[name="errorType"]', { index: 0 });
  await page.getByRole('button', { name: /Simular pago/i }).click();
  await page.waitForTimeout(5000);
  const after = await page.locator('body').innerText();
  console.log('\n--- TRAS "Simular pago" ---');
  console.log(after.replace(/\n{2,}/g, '\n').slice(0, 1600));
}

await page.screenshot({ path: '__sim_screenshot.png', fullPage: true });
await browser.close();
console.log('\nRESULTADO:', scanned ? 'SIMULACIÓN ENVIADA' : 'FALLO DE ESCANEO');
