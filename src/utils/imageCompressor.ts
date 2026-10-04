/**
 * Client-side Image Compression Utility
 * Resizes and compresses field photos to ~1MB (target ~800KB - 1000KB)
 * for optimal storage, fast upload, and Google Sheets / Drive synchronization.
 */

export interface CompressionResult {
  dataUrl: string;
  sizeBytes: number;
  sizeKb: number;
  sizeFormatted: string;
  originalSizeKb?: number;
  width: number;
  height: number;
}

/**
 * Calculates byte size of a base64 Data URL
 */
export function getBase64SizeBytes(dataUrl: string): number {
  if (!dataUrl || !dataUrl.includes(',')) return 0;
  const base64String = dataUrl.split(',')[1];
  const padding = (base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0);
  return (base64String.length * 3) / 4 - padding;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compresses an image (File, Blob, or base64 Data URL) to around 1MB (<= 1024 KB)
 * Default max dimension: 1920px (Full HD clarity for infrastructure inspection)
 */
export async function compressImage(
  input: File | Blob | string,
  options?: {
    maxSizeKb?: number; // target max size, default 1024 KB (1MB)
    maxDimension?: number; // default 1920px
    initialQuality?: number; // default 0.85
  }
): Promise<CompressionResult> {
  const targetMaxKb = options?.maxSizeKb ?? 1024; // 1 MB
  const targetMaxBytes = targetMaxKb * 1024;
  const maxDimension = options?.maxDimension ?? 1920;
  const initialQuality = options?.initialQuality ?? 0.85;

  let originalSizeKb: number | undefined;
  let sourceDataUrl = '';

  if (typeof input === 'string') {
    sourceDataUrl = input;
    originalSizeKb = Math.round(getBase64SizeBytes(input) / 1024);
  } else {
    originalSizeKb = Math.round(input.size / 1024);
    sourceDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(input);
    });
  }

  // Load image into an HTMLImageElement
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (!sourceDataUrl.startsWith('data:')) {
      image.crossOrigin = 'anonymous';
    }
    image.onload = () => resolve(image);
    image.onerror = () => {
      // Fallback: try without crossOrigin
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = (err) => reject(new Error('Fotoğraf yüklenemedi: ' + err));
      fallbackImg.src = sourceDataUrl;
    };
    image.src = sourceDataUrl;
  });

  // Calculate target dimensions keeping aspect ratio
  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Canvas 2D context oluşturulamadı');
  }

  // Use high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Iteratively find quality that fits <= targetMaxBytes (approx 1MB)
  let quality = initialQuality;
  let resultDataUrl = sourceDataUrl;
  let sizeBytes = 0;

  try {
    resultDataUrl = canvas.toDataURL('image/jpeg', quality);
    sizeBytes = getBase64SizeBytes(resultDataUrl);

    let iterations = 0;
    // If still bigger than target ~1MB, reduce quality progressively
    while (sizeBytes > targetMaxBytes && quality > 0.45 && iterations < 5) {
      quality -= 0.1;
      resultDataUrl = canvas.toDataURL('image/jpeg', quality);
      sizeBytes = getBase64SizeBytes(resultDataUrl);
      iterations++;
    }

    // If still above 1MB after quality reductions (very dense image), downscale dimensions slightly
    if (sizeBytes > targetMaxBytes) {
      const downscaleCanvas = document.createElement('canvas');
      downscaleCanvas.width = Math.round(width * 0.8);
      downscaleCanvas.height = Math.round(height * 0.8);
      const dctx = downscaleCanvas.getContext('2d', { alpha: false });
      if (dctx) {
        dctx.imageSmoothingEnabled = true;
        dctx.imageSmoothingQuality = 'high';
        dctx.drawImage(canvas, 0, 0, downscaleCanvas.width, downscaleCanvas.height);
        resultDataUrl = downscaleCanvas.toDataURL('image/jpeg', 0.75);
        sizeBytes = getBase64SizeBytes(resultDataUrl);
        width = downscaleCanvas.width;
        height = downscaleCanvas.height;
      }
    }
  } catch (canvasErr) {
    console.warn('Canvas export warning, keeping source image:', canvasErr);
    resultDataUrl = sourceDataUrl;
    sizeBytes = getBase64SizeBytes(sourceDataUrl);
  }

  const sizeKb = Math.round(sizeBytes / 1024);

  return {
    dataUrl: resultDataUrl,
    sizeBytes,
    sizeKb,
    sizeFormatted: formatBytes(sizeBytes),
    originalSizeKb,
    width,
    height
  };
}

export function getImageSizeDisplay(dataUrl?: string | null): { sizeFormatted: string; sizeKb: number; isOptimized: boolean } {
  if (!dataUrl) {
    return { sizeFormatted: '0 KB', sizeKb: 0, isOptimized: false };
  }
  const bytes = getBase64SizeBytes(dataUrl);
  const sizeKb = Math.round(bytes / 1024);
  return {
    sizeFormatted: formatBytes(bytes),
    sizeKb,
    isOptimized: bytes > 0 && bytes <= 1100 * 1024 // ~1MB or less
  };
}

