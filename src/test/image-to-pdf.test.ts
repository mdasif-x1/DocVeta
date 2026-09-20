import { describe, it, expect, vi } from 'vitest';
import { convertImagesToPdf } from '../lib/pdf/image-to-pdf';
import { PDFDocument } from 'pdf-lib';
import type { FileItem } from '../types/file.types';
import type { ImageToPdfOptions } from '../types/processing.types';

// Mock canvas-utils so jsdom canvas environment won't crash when loading image files
vi.mock('../lib/image/canvas-utils', () => {
  return {
    loadImage: vi.fn().mockImplementation(async () => {
      return { width: 400, height: 300 };
    }),
    renderRotatedImage: vi.fn().mockImplementation(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 400;
      return canvas;
    }),
    canvasToUint8Array: vi.fn().mockImplementation(async () => {
      // Return a minimal valid 1x1 PNG Uint8Array byte array for pdfDoc.embedPng / embedJpg
      const dummyPngBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const binary = atob(dummyPngBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }),
  };
});

describe('Image to PDF Engine', () => {
  const dummyPngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const binary = atob(dummyPngBase64);
  const pngBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    pngBytes[i] = binary.charCodeAt(i);
  }

  const sampleFile = new File([pngBytes], 'sample.png', { type: 'image/png' });
  const sampleItem: FileItem = {
    id: 'img-1',
    file: sampleFile,
    name: 'sample.png',
    size: pngBytes.length,
    type: 'image/png',
    rotation: 0,
    status: 'ready',
  };

  const defaultOptions: ImageToPdfOptions = {
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 'medium',
    fit: 'contain',
    quality: 0.92,
  };

  it('throws an error if no images are provided', async () => {
    await expect(convertImagesToPdf([], defaultOptions)).rejects.toThrow(
      'No images provided for PDF generation.'
    );
  });

  it('converts a single image into a valid PDF Blob', async () => {
    const progressSpy = vi.fn();
    const pdfBlob = await convertImagesToPdf([sampleItem], defaultOptions, progressSpy);

    expect(pdfBlob).toBeInstanceOf(Blob);
    expect(pdfBlob.type).toBe('application/pdf');
    expect(progressSpy).toHaveBeenCalled();

    const pdfBuffer = await pdfBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    expect(pdfDoc.getPageCount()).toBe(1);
  });

  it('supports FitImage page size setting', async () => {
    const options: ImageToPdfOptions = {
      ...defaultOptions,
      pageSize: 'FitImage',
      margin: 'none',
    };

    const pdfBlob = await convertImagesToPdf([sampleItem], options);
    const pdfBuffer = await pdfBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    expect(pdfDoc.getPageCount()).toBe(1);
    const page = pdfDoc.getPage(0);
    expect(page.getWidth()).toBeGreaterThan(0);
    expect(page.getHeight()).toBeGreaterThan(0);
  });

  it('handles rotated images correctly', async () => {
    const rotatedItem: FileItem = {
      ...sampleItem,
      rotation: 90,
    };

    const pdfBlob = await convertImagesToPdf([rotatedItem], defaultOptions);
    expect(pdfBlob).toBeInstanceOf(Blob);
  });

  it('converts multiple images into a multi-page PDF', async () => {
    const item2: FileItem = { ...sampleItem, id: 'img-2', name: 'sample2.png' };
    const pdfBlob = await convertImagesToPdf([sampleItem, item2], defaultOptions);

    const pdfBuffer = await pdfBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    expect(pdfDoc.getPageCount()).toBe(2);
  });
});
