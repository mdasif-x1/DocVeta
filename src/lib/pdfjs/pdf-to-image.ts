import { getPdfJs } from './pdfjs-loader';
import type { PdfToImageOptions, ProcessingProgress } from '../../types/processing.types';
import JSZip from 'jszip';
import { canvasToBlob } from '../image/canvas-utils';

export interface RenderedPageImage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Inspects PDF and returns thumbnail previews for every page
 */
export async function generatePdfPageThumbnails(
  file: File,
  maxDimension = 200
): Promise<{ pageNumber: number; thumbnailDataUrl: string }[]> {
  const pdfjs = await getPdfJs();
  const buffer = await file.arrayBuffer();

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;
  const thumbnails: { pageNumber: number; thumbnailDataUrl: string }[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });

    const scale = Math.min(maxDimension / viewport.width, maxDimension / viewport.height);
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    // Fill white background for pages
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({
      canvasContext: ctx,
      viewport: scaledViewport,
      canvas,
    }).promise;

    thumbnails.push({
      pageNumber: pageNum,
      thumbnailDataUrl: canvas.toDataURL('image/jpeg', 0.7),
    });
  }

  return thumbnails;
}

/**
 * Renders selected PDF pages to high-resolution JPG or PNG images
 */
export async function convertPdfToImages(
  file: File,
  options: PdfToImageOptions,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<RenderedPageImage[]> {
  const pdfjs = await getPdfJs();
  const buffer = await file.arrayBuffer();

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // Determine pages to render (if empty, render all)
  const pagesToRender = options.selectedPages.length > 0
    ? options.selectedPages.filter(p => p >= 1 && p <= totalPages)
    : Array.from({ length: totalPages }, (_, i) => i + 1);

  const results: RenderedPageImage[] = [];
  const scale = options.scale || 2.0; // 2x gives crisp 150-200 DPI rendering

  for (let i = 0; i < pagesToRender.length; i++) {
    const pageNum = pagesToRender[i];

    if (onProgress) {
      onProgress({
        currentStep: i + 1,
        totalSteps: pagesToRender.length,
        percentage: Math.round(((i) / pagesToRender.length) * 100),
        statusMessage: `Rendering page ${pageNum} of ${totalPages}...`,
      });
    }

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context creation failed.');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({
      canvasContext: ctx,
      viewport,
      canvas,
    }).promise;

    const mime = options.format === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await canvasToBlob(canvas, mime, options.quality || 0.92);
    const dataUrl = URL.createObjectURL(blob);

    results.push({
      pageNumber: pageNum,
      blob,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
    });
  }

  if (onProgress) {
    onProgress({
      currentStep: pagesToRender.length,
      totalSteps: pagesToRender.length,
      percentage: 100,
      statusMessage: 'Completed page rendering.',
    });
  }

  return results;
}

/**
 * Creates a ZIP archive containing all rendered page images
 */
export async function createZipFromImages(
  images: RenderedPageImage[],
  baseFilename: string,
  format: 'image/jpeg' | 'image/png'
): Promise<Blob> {
  const zip = new JSZip();
  const ext = format === 'image/png' ? 'png' : 'jpg';

  for (const img of images) {
    const paddedPage = String(img.pageNumber).padStart(2, '0');
    const filename = `${baseFilename}-page-${paddedPage}.${ext}`;
    zip.file(filename, img.blob);
  }

  return await zip.generateAsync({ type: 'blob' });
}
