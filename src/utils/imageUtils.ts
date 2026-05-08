// Decode an image File into an ImageBitmap. Falls back to a JS-based
// HEIC/HEIF decoder for formats Chrome can't decode natively (iPhone
// photos default to HEIC). The fallback is dynamic-imported only when
// the native call fails, so non-HEIC users don't pay the bundle cost.
async function decodeImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch (originalErr) {
    try {
      const { heicTo } = await import('heic-to');
      const jpegBlob = await heicTo({
        blob: file,
        type: 'image/jpeg',
        quality: 0.9,
      });
      return await createImageBitmap(jpegBlob as Blob);
    } catch {
      throw originalErr;
    }
  }
}

export async function downscaleToWebp(
  file: File,
  maxSize: number = 512,
  quality: number = 0.7,
): Promise<Blob> {
  const bitmap = await decodeImage(file);
  const { width: srcW, height: srcH } = bitmap;
  const minSide = Math.min(srcW, srcH);
  const scale = Math.min(1, maxSize / minSide);
  const cropSize = minSide;
  const sx = (srcW - cropSize) / 2;
  const sy = (srcH - cropSize) / 2;
  const targetSize = Math.round(cropSize * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bitmap, sx, sy, cropSize, cropSize, 0, 0, targetSize, targetSize);
  bitmap.close?.();

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/webp',
      quality,
    );
  });
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}
