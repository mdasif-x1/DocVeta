/**
 * Reusable Canvas and Image Manipulation Utilities
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Loads a File or Blob into an HTMLImageElement safely
 */
export function loadImage(fileOrBlob: Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file.'));
    };

    img.src = url;
  });
}

/**
 * Calculates aspect-ratio-preserving dimensions that fit within target bounds (contain)
 */
export function calculateFitDimensions(
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number
): { width: number; height: number; x: number; y: number } {
  const srcRatio = srcWidth / srcHeight;
  const targetRatio = targetWidth / targetHeight;

  let width = targetWidth;
  let height = targetHeight;

  if (srcRatio > targetRatio) {
    // Image is wider than target area
    width = targetWidth;
    height = targetWidth / srcRatio;
  } else {
    // Image is taller than target area
    height = targetHeight;
    width = targetHeight * srcRatio;
  }

  const x = (targetWidth - width) / 2;
  const y = (targetHeight - height) / 2;

  return { width, height, x, y };
}

/**
 * Rotates an image and returns a Canvas with rotated content
 */
export function renderRotatedImage(
  img: HTMLImageElement,
  rotationDegrees: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context.');

  const rad = (rotationDegrees % 360) * (Math.PI / 180);
  const isPerpendicular = rotationDegrees % 180 !== 0;

  canvas.width = isPerpendicular ? img.height : img.width;
  canvas.height = isPerpendicular ? img.width : img.height;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();

  return canvas;
}

/**
 * Converts a Canvas to a Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/jpeg',
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed.'));
      },
      type,
      quality
    );
  });
}

/**
 * Converts a canvas directly to a Uint8Array
 */
export async function canvasToUint8Array(
  canvas: HTMLCanvasElement,
  type = 'image/jpeg',
  quality = 0.92
): Promise<Uint8Array> {
  const blob = await canvasToBlob(canvas, type, quality);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Creates an ultra-lightweight thumbnail data URL for UI cards
 */
export async function createThumbnailUrl(
  file: File,
  maxWidth = 200,
  maxHeight = 200
): Promise<string> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const { width, height } = calculateFitDimensions(
    img.width,
    img.height,
    maxWidth,
    maxHeight
  );

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.7);
}
