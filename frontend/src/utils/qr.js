// Genera la imagen real del QR a partir del contenido devuelto por Factus/DIAN.
// - Si el valor ya es una imagen (data URI / base64), se devuelve tal cual.
// - Si es una URL o texto (p. ej. la URL de verificación DIAN devuelta por Factus),
//   se codifica ese contenido exacto en un QR visible en el navegador.
import QRCode from 'qrcode';

export async function qrImageSrc(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // Ya es una imagen real (data URI)
  if (/^data:image\//i.test(raw)) return raw;

  try {
    return await QRCode.toDataURL(raw, {
      margin: 1,
      width: 240,
      errorCorrectionLevel: 'M',
      color: { dark: '#14231fff', light: '#ffffffff' }
    });
  } catch (err) {
    console.error('[QR] No fue posible generar la imagen del QR:', err.message);
    return null;
  }
}
