import { describe, it, expect, vi } from 'vitest';
import { performImageOcr } from '../lib/ocr/image-ocr';

// Mock Tesseract.js worker
vi.mock('tesseract.js', () => {
  return {
    createWorker: vi.fn().mockImplementation(async (_lang, _mode, options) => {
      // Simulate progress updates via options.logger
      if (options && options.logger) {
        options.logger({ status: 'recognizing text', progress: 0.5 });
      }

      return {
        recognize: vi.fn().mockResolvedValue({
          data: {
            text: 'Extracted sample text from image',
            confidence: 94.5,
          },
        }),
        terminate: vi.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

describe('Image OCR Engine (image-to-text)', () => {
  const dummyImageFile = new File(['dummy image'], 'invoice.jpg', { type: 'image/jpeg' });

  it('runs OCR recognition on an image file and returns text and confidence', async () => {
    const progressSpy = vi.fn();
    const result = await performImageOcr(dummyImageFile, 'eng', progressSpy);

    expect(result.text).toBe('Extracted sample text from image');
    expect(result.confidence).toBe(94.5);
    expect(progressSpy).toHaveBeenCalled();
  });
});
