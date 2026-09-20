import { describe, it, expect, vi } from 'vitest';
import { extractTextFromPdf } from '../lib/pdfjs/pdf-to-text';

// Mock pdfjs-loader
vi.mock('../lib/pdfjs/pdfjs-loader', () => {
  return {
    getPdfJs: vi.fn().mockResolvedValue({
      getDocument: vi.fn().mockImplementation(({ data }: { data: Uint8Array }) => {
        const textStr = new TextDecoder().decode(data);
        const isScannedDoc = textStr.includes('SCANNED_DOC');

        return {
          promise: Promise.resolve({
            numPages: 2,
            getPage: vi.fn().mockImplementation(async (pageNum: number) => {
              if (isScannedDoc) {
                return {
                  getTextContent: vi.fn().mockResolvedValue({ items: [] }),
                };
              }

              return {
                getTextContent: vi.fn().mockResolvedValue({
                  items: [
                    { str: `Header line on page ${pageNum}`, transform: [1, 0, 0, 1, 0, 100] },
                    { str: `Content line for page ${pageNum}`, transform: [1, 0, 0, 1, 0, 80] },
                  ],
                }),
              };
            }),
          }),
        };
      }),
    }),
  };
});

describe('PDF to Text Extraction Engine', () => {
  it('extracts text from multiple pages and formats result', async () => {
    const file = new File(['SAMPLE_PDF_BYTES_CONTAINING_TEXT'], 'sample.pdf', {
      type: 'application/pdf',
    });

    const progressSpy = vi.fn();
    const result = await extractTextFromPdf(file, progressSpy);

    expect(result.pageCount).toBe(2);
    expect(result.isScanned).toBe(false);
    expect(result.pagesText).toHaveLength(2);
    expect(result.pagesText[0].text).toContain('Header line on page 1');
    expect(result.pagesText[1].text).toContain('Content line for page 2');
    expect(result.fullText).toContain('--- Page 1 ---');
    expect(result.fullText).toContain('--- Page 2 ---');
    expect(progressSpy).toHaveBeenCalledTimes(2);
  });

  it('identifies scanned PDFs with low or missing selectable text', async () => {
    const file = new File(['SCANNED_DOC'], 'scanned.pdf', { type: 'application/pdf' });
    const result = await extractTextFromPdf(file);

    expect(result.pageCount).toBe(2);
    expect(result.isScanned).toBe(true);
    expect(result.fullText).toContain('--- Page 1 ---');
  });
});
