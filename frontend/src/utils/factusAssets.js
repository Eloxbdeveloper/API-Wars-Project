// Utilidades para resolver el QR y el documento público devueltos por Factus.
// No construyen URLs: solo normalizan valores ya presentes en la respuesta.

const QR_KEYS = new Set(['qr', 'qrcode', 'qrimage', 'qrurl', 'codigoqr']);
const DOC_KEYS = new Set(['publicurl', 'pdfurl', 'pdf', 'documenturl']);

const normalizeAssetKey = (key) => String(key).toLowerCase().replace(/[_\-\s]/g, '');

// Busca en profundidad la primera clave coincidente dentro de un objeto guardado.
export function findFirstStringByKeys(payload, keySet = QR_KEYS, maxDepth = 6) {
  if (!payload || typeof payload !== 'object') return null;

  const queue = [{ node: payload, depth: 0 }];
  while (queue.length > 0) {
    const { node, depth } = queue.shift();
    if (depth > maxDepth) continue;

    for (const [key, value] of Object.entries(node)) {
      if (keySet.has(normalizeAssetKey(key)) && typeof value === 'string' && value.trim()) {
        return value.trim();
      }
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          value.forEach((entry) => {
            if (entry && typeof entry === 'object') queue.push({ node: entry, depth: depth + 1 });
          });
        } else {
          queue.push({ node: value, depth: depth + 1 });
        }
      }
    }
  }
  return null;
}

// Normaliza el valor de QR (URL, data-URI, base64, objeto o JSON stringificado).
export function normalizeQrCandidate(value, depth = 0) {
  if (!value || depth > 3) return null;

  if (typeof value === 'object') {
    const candidate = value.qr || value.url || value.image || value.qr_image || value.qr_code || null;
    return normalizeQrCandidate(candidate, depth + 1);
  }

  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return normalizeQrCandidate(JSON.parse(trimmed), depth + 1);
    } catch {
      // No es JSON válido: se continúa abajo.
    }
  }

  // Una data-URI ya es una imagen; una URL o texto es el contenido a codificar.
  if (/^(https?:\/\/|data:|blob:)/i.test(trimmed)) return trimmed;
  if (/^[A-Za-z0-9+/=]+$/.test(trimmed)) return `data:image/png;base64,${trimmed}`;
  return trimmed;
}

export function resolveQrSrc(detail) {
  const candidates = [
    detail?.qrCodeUrl,
    detail?.qr,
    detail?.qr_code,
    findFirstStringByKeys(detail?.factusResponse, QR_KEYS),
  ];
  for (const candidate of candidates) {
    const src = normalizeQrCandidate(candidate);
    if (src) return src;
  }
  return null;
}

// Solo se devuelven enlaces absolutos ya presentes en la respuesta; nunca se construyen URLs.
export function resolveDocUrl(detail) {
  const candidates = [
    detail?.pdfUrl,
    detail?.publicUrl,
    detail?.public_url,
    findFirstStringByKeys(detail?.factusResponse, DOC_KEYS),
  ];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        const inner = typeof parsed === 'object'
          ? (parsed.public_url || parsed.pdf_url || parsed.pdf || parsed.url || null)
          : null;
        if (inner && /^https?:\/\//i.test(String(inner))) return String(inner);
      } catch {
        // Ignora valores que no son JSON.
      }
    }
  }
  return null;
}
