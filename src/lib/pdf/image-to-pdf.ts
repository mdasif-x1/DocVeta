import { PDFDocument } from 'pdf-lib';
import type { FileItem } from '../../types/file.types';
import type { ImageToPdfOptions, ProcessingProgress } from '../../types/processing.types';
import { loadImage, renderRotatedImage, canvasToUint8Array } from '../image/canvas-utils';

const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612.0, height: 792.0 },
};

const MARGIN_SIZES = {
  none: 0,
  small: 20,
  medium: 36,
  large: 54,
};

/**
 * Converts multiple images to a single high-quality PDF document
 */
export async function convertImagesToPdf(
  items: FileItem[],
  options: ImageToPdfOptions,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<Blob> {
  if (items.length === 0) {
    throw new Error('No images provided for PDF generation.');
  }

  const pdfDoc = await PDFDocument.create();
  const totalSteps = items.length;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (onProgress) {
      onProgress({
        currentStep: i + 1,
        totalSteps,
        percentage: Math.round(((i) / totalSteps) * 100),
        statusMessage: `Processing image ${i + 1} of ${totalSteps}...`,
      });
    }

    // Load image element
    const imgElement = await loadImage(item.file);
    const rotation = item.rotation || 0;

    let imageBytes: Uint8Array;
    let isPng = item.file.type === 'image/png';

    // If rotated or WebP, convert to canvas representation first
    if (rotation !== 0 || item.file.type === 'image/webp') {
      const rotatedCanvas = renderRotatedImage(imgElement, rotation);
      // If original was PNG, preserve alpha by exporting as PNG; else JPEG
      if (isPng) {
        imageBytes = await canvasToUint8Array(rotatedCanvas, 'image/png', options.quality);
      } else {
        imageBytes = await canvasToUint8Array(rotatedCanvas, 'image/jpeg', options.quality);
      }
    } else {
      const buffer = await item.file.arrayBuffer();
      imageBytes = new Uint8Array(buffer);
    }

    // Embed in PDF
    let embeddedImage;
    if (isPng) {
      try {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } catch {
        // Fallback to JPEG if PNG embed fails
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }
    } else {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    }

    const imgDims = embeddedImage.scale(1);
    const margin = MARGIN_SIZES[options.margin] || 0;

    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'FitImage') {
      pageWidth = imgDims.width + margin * 2;
      pageHeight = imgDims.height + margin * 2;
    } else {
      const base = PAGE_SIZES[options.pageSize] || PAGE_SIZES.A4;
      const isImageLandscape = imgDims.width > imgDims.height;

      let useLandscape = false;
      if (options.orientation === 'landscape') {
        useLandscape = true;
      } else if (options.orientation === 'auto') {
        useLandscape = isImageLandscape;
      }

      pageWidth = useLandscape ? base.height : base.width;
      pageHeight = useLandscape ? base.width : base.height;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Usable area inside margins
    const usableWidth = Math.max(10, pageWidth - margin * 2);
    const usableHeight = Math.max(10, pageHeight - margin * 2);

    // Calculate aspect ratio fit (contain)
    const imgRatio = imgDims.width / imgDims.height;
    const pageRatio = usableWidth / usableHeight;

    let renderWidth = usableWidth;
    let renderHeight = usableHeight;

    if (options.fit === 'fill') {
      // Stretch to margin bounds (rarely used, but supported)
      renderWidth = usableWidth;
      renderHeight = usableHeight;
    } else {
      // Default: contain (preserves aspect ratio without distortion)
      if (imgRatio > pageRatio) {
        renderWidth = usableWidth;
        renderHeight = usableWidth / imgRatio;
      } else {
        renderHeight = usableHeight;
        renderWidth = usableHeight * imgRatio;
      }
    }

    const renderX = margin + (usableWidth - renderWidth) / 2;
    const renderY = margin + (usableHeight - renderHeight) / 2;

    page.drawImage(embeddedImage, {
      x: renderX,
      y: renderY,
      width: renderWidth,
      height: renderHeight,
    });
  }

  if (onProgress) {
    onProgress({
      currentStep: totalSteps,
      totalSteps,
      percentage: 100,
      statusMessage: 'Finalizing PDF document...',
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}
