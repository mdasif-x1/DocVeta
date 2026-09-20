import { describe, it, expect, vi, beforeAll } from 'vitest';
import {
  generatePdfPageThumbnails,
  convertPdfToImages,
  createZipFromImages,
  type RenderedPageImage,
} from '../lib/pdfjs/pdf-to-image';
import type { PdfToImageOptions } from '../types/processing.types';

beforeAll(() => {
  // Mock HTMLCanvasElement 2D context for jsdom environment
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
    return {
      fillStyle: '#ffffff',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
  });

  HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mock');

  if (typeof URL.createObjectURL !== 'function') {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-blob-url');
  } else {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost/mock-blob-url');
  }

  if (typeof URL.revokeObjectURL !== 'function') {
    URL.revokeObjectURL = vi.fn();
  }
});

// Mock pdfjs-loader and canvasToBlob
vi.mock('../lib/pdfjs/pdfjs-loader', () => {
  return {
    getPdfJs: vi.fn().mockResolvedValue({
      getDocument: vi.fn().mockReturnValue({
        promise: Promise.resolve({
          numPages: 3,
          getPage: vi.fn().mockResolvedValue({
            getViewport: vi.fn().mockReturnValue({ width: 600, height: 800 }),
            render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
          }),
        }),
      }),
    }),
  };
});

vi.mock('../lib/image/canvas-utils', () => {
  return {
    canvasToBlob: vi.fn().mockResolvedValue(new Blob(['dummy_image_data'], { type: 'image/png' })),
  };
});

describe('PDF to Image Engine', () => {
  const dummyFile = new File(['dummy pdf data'], 'document.pdf', { type: 'application/pdf' });

  it('generates thumbnail previews for all PDF pages', async () => {
    const thumbnails = await generatePdfPageThumbnails(dummyFile, 150);

    expect(thumbnails).toHaveLength(3);
    expect(thumbnails[0].pageNumber).toBe(1);
    expect(thumbnails[0].thumbnailDataUrl).toBeDefined();
  });

  it('converts selected pages of a PDF into high-res images', async () => {
    const options: PdfToImageOptions = {
      format: 'image/png',
      quality: 0.95,
      scale: 2.0,
      selectedPages: [1, 3],
    };

    const progressSpy = vi.fn();
    const renderedImages = await convertPdfToImages(dummyFile, options, progressSpy);

    expect(renderedImages).toHaveLength(2);
    expect(renderedImages[0].pageNumber).toBe(1);
    expect(renderedImages[1].pageNumber).toBe(3);
    expect(progressSpy).toHaveBeenCalledTimes(3);
  });

  it('creates a ZIP file containing rendered page images', async () => {
    const renderedImages: RenderedPageImage[] = [
      {
        pageNumber: 1,
        blob: new Blob(['data1'], { type: 'image/png' }),
        dataUrl: 'blob:http://localhost/1',
        width: 600,
        height: 800,
      },
      {
        pageNumber: 2,
        blob: new Blob(['data2'], { type: 'image/png' }),
        dataUrl: 'blob:http://localhost/2',
        width: 600,
        height: 800,
      },
    ];

    const zipBlob = await createZipFromImages(renderedImages, 'document', 'image/png');

    expect(zipBlob).toBeInstanceOf(Blob);
    expect(zipBlob.size).toBeGreaterThan(0);
  });
});
