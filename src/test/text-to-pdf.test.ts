import { describe, it, expect, vi, beforeAll } from 'vitest';
import { convertTextToPdf } from '../lib/pdf/text-to-pdf';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

// Mock fetch to serve font files from local public directory in Node environment
beforeAll(() => {
  global.fetch = vi.fn().mockImplementation(async (url: string) => {
    const filename = url.replace('/fonts/', '');
    const filePath = path.resolve(__dirname, '../../public/fonts', filename);
    const buffer = fs.readFileSync(filePath);
    const ab = new Uint8Array(buffer).buffer;

    return {
      ok: true,
      status: 200,
      arrayBuffer: async () => ab,
    } as Response;
  });
});

describe('Text to PDF Engine', () => {
  it('throws an error if empty text is provided', async () => {
    await expect(
      convertTextToPdf('', {
        fontSize: 12,
        lineHeight: 1.4,
        pageSize: 'A4',
        margin: 'medium',
        fontFamily: 'Helvetica',
        includePageNumbers: true,
      })
    ).rejects.toThrow('Please enter text to generate a PDF.');
  });

  it('generates a valid PDF blob from multiline text', async () => {
    const sampleText = 'Line 1: DocVeta Text to PDF\nLine 2: Fast, free, browser-first tools.\nLine 3: Tested thoroughly.';
    const blob = await convertTextToPdf(sampleText, {
      fontSize: 14,
      lineHeight: 1.5,
      pageSize: 'A4',
      margin: 'medium',
      fontFamily: 'Helvetica',
      includePageNumbers: true,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(500);

    // Verify generated document structure with pdf-lib
    const buffer = await blob.arrayBuffer();
    const loadedDoc = await PDFDocument.load(buffer);
    expect(loadedDoc.getPageCount()).toBe(1);
  });

  it('paginates long text across multiple pages automatically', async () => {
    // Generate 120 lines of text
    const longText = Array.from({ length: 120 }, (_, i) => `Paragraph item number ${i + 1} with some extra descriptive words to fill the page width nicely.`).join('\n');
    const blob = await convertTextToPdf(longText, {
      fontSize: 12,
      lineHeight: 1.4,
      pageSize: 'A4',
      margin: 'medium',
      fontFamily: 'Helvetica',
      includePageNumbers: true,
    });

    const buffer = await blob.arrayBuffer();
    const loadedDoc = await PDFDocument.load(buffer);
    expect(loadedDoc.getPageCount()).toBeGreaterThan(1);
  });

  it('handles complex Unicode input without WinAnsi encoding errors', async () => {
    const unicodeInput = [
      'ASCII: Hello World',
      'Symbols: → ← ↑ ↓ ✓ © ™',
      'Currency: ₹ $ € £ ¥',
      'Accented: Café résumé naïve',
      'Hindi: नमस्ते दुनिया',
      'Mixed: Hello → नमस्ते ₹100',
    ].join('\n');

    const blob = await convertTextToPdf(unicodeInput, {
      fontSize: 12,
      lineHeight: 1.4,
      pageSize: 'A4',
      margin: 'medium',
      fontFamily: 'Helvetica',
      includePageNumbers: true,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);

    const buffer = await blob.arrayBuffer();
    const loadedDoc = await PDFDocument.load(buffer);
    expect(loadedDoc.getPageCount()).toBe(1);
  });
});
