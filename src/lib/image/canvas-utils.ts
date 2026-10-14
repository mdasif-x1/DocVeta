/**
 * Reusable Canvas and Image Manipulation Utilities
 */

import type { CropRegion, ImageFilterMode, ImageAdjustments } from '../../types/file.types';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ProcessImageOptions {
  rotation?: number;
  crop?: CropRegion;
  filter?: ImageFilterMode;
  adjustments?: ImageAdjustments;
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

  const normalizedRotation = ((rotationDegrees % 360) + 360) % 360;
  const rad = normalizedRotation * (Math.PI / 180);
  const isPerpendicular = normalizedRotation % 180 !== 0;

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
 * Applies document enhancement filters (Magic Color, B&W threshold, Grayscale)
 * and brightness / contrast adjustments to canvas context in-place.
 */
export function applyImageFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: ImageFilterMode = 'none',
  adjustments?: ImageAdjustments
): void {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const brightness = adjustments?.brightness ?? 0; // -100 to 100
    const contrast = adjustments?.contrast ?? 0;     // -100 to 100

    // Contrast factor: [-100, 100] -> scale factor
    // Using standard formula: factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
    const contrastFactor =
      contrast !== 0
        ? (259 * (contrast + 255)) / (255 * (259 - contrast))
        : 1;

    // Brightness offset: [-100, 100] mapped to [-150, 150]
    const brightnessOffset = brightness * 1.5;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 1. Brightness
      if (brightness !== 0) {
        r += brightnessOffset;
        g += brightnessOffset;
        b += brightnessOffset;
      }

      // 2. Contrast
      if (contrast !== 0) {
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
      }

      // 3. Preset Document Filters
      if (filter === 'grayscale') {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray;
        g = gray;
        b = gray;
      } else if (filter === 'bw') {
        // Document Binarization (CamScanner-like crisp B&W)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        // Adaptive threshold centered around 138, shifted slightly with brightness
        const threshold = 138 + brightness * 0.3;
        const val = gray > threshold ? 255 : 0;
        r = val;
        g = val;
        b = val;
      } else if (filter === 'enhanced') {
        // "Magic Color": Boost contrast and clarity of document ink & paper
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        // Stretch dynamic range: darks darker, lights cleaner
        const factor = 1.25;
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;

        // Slight paper whitening if background is light gray
        if (gray > 175) {
          const boost = (gray - 175) * 0.35;
          r += boost;
          g += boost;
          b += boost;
        }
      }

      // Clamp RGB values
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    // If getImageData fails (e.g. cross-origin or jsdom dummy context), fail gracefully
    console.warn('Canvas filter application skipped:', err);
  }
}

/**
 * Renders an image through the full processing pipeline:
 * Rotation -> Crop -> Enhancement Filters & Adjustments
 */
export function renderProcessedImage(
  img: HTMLImageElement,
  options: ProcessImageOptions = {}
): HTMLCanvasElement {
  const { rotation = 0, crop, filter = 'none', adjustments } = options;

  // 1. Rotation phase
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  let rotatedCanvas: HTMLCanvasElement;
  if (normalizedRotation !== 0) {
    rotatedCanvas = renderRotatedImage(img, normalizedRotation);
  } else {
    rotatedCanvas = document.createElement('canvas');
    rotatedCanvas.width = img.width;
    rotatedCanvas.height = img.height;
    const rCtx = rotatedCanvas.getContext('2d');
    if (rCtx) {
      rCtx.drawImage(img, 0, 0);
    }
  }

  // 2. Crop phase
  const rotW = rotatedCanvas.width;
  const rotH = rotatedCanvas.height;

  let cropX = 0;
  let cropY = 0;
  let cropW = rotW;
  let cropH = rotH;

  if (crop) {
    const clampedX = Math.max(0, Math.min(100, crop.x));
    const clampedY = Math.max(0, Math.min(100, crop.y));
    const clampedW = Math.max(1, Math.min(100 - clampedX, crop.width));
    const clampedH = Math.max(1, Math.min(100 - clampedY, crop.height));

    cropX = Math.round((clampedX / 100) * rotW);
    cropY = Math.round((clampedY / 100) * rotH);
    cropW = Math.max(1, Math.round((clampedW / 100) * rotW));
    cropH = Math.max(1, Math.round((clampedH / 100) * rotH));
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = cropW;
  outputCanvas.height = cropH;

  const outCtx = outputCanvas.getContext('2d');
  if (!outCtx) {
    throw new Error('Failed to get 2D canvas context for processed image.');
  }

  outCtx.drawImage(
    rotatedCanvas,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    cropW,
    cropH
  );

  // 3. Filters & Adjustments phase
  const needsFilters =
    filter !== 'none' ||
    (adjustments && (adjustments.brightness !== 0 || adjustments.contrast !== 0));

  if (needsFilters) {
    applyImageFilter(outCtx, cropW, cropH, filter, adjustments);
  }

  return outputCanvas;
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

/**
 * Creates a thumbnail data URL incorporating rotation, crop, and document enhancement filters
 */
export async function createProcessedThumbnailUrl(
  file: File,
  options: ProcessImageOptions = {},
  maxWidth = 260,
  maxHeight = 260
): Promise<string> {
  const img = await loadImage(file);
  const processedCanvas = renderProcessedImage(img, options);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const { width, height } = calculateFitDimensions(
    processedCanvas.width,
    processedCanvas.height,
    maxWidth,
    maxHeight
  );

  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  ctx.drawImage(processedCanvas, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.75);
}
