import { getPdfJs } from './pdfjs-loader';
import type { ProcessingProgress } from '../../types/processing.types';

export interface ExtractedPdfTextResult {
  fullText: string;
  pagesText: { pageNumber: number; text: string }[];
  isScanned: boolean;
  pageCount: number;
}

/**
 * Extracts selectable text from a PDF file using PDF.js.
 * Automatically identifies scanned PDFs with zero/trivial selectable text.
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ExtractedPdfTextResult> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  const pagesText: { pageNumber: number; text: string }[] = [];
  let totalCharacterCount = 0;

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    if (onProgress) {
      onProgress({
        currentStep: pageNum,
        totalSteps: pageCount,
        percentage: Math.round((pageNum / pageCount) * 100),
        statusMessage: `Reading text from page ${pageNum} of ${pageCount}...`,
      });
    }

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Combine text items with line breaks when line changes
    let lastY: number | null = null;
    let pageLines: string[] = [];
    let currentLine = '';

    for (const item of textContent.items) {
      if ('str' in item) {
        // Check vertical position change for newline
        const y = item.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 5) {
          pageLines.push(currentLine.trim());
          currentLine = item.str;
        } else {
          currentLine += (currentLine ? ' ' : '') + item.str;
        }
        lastY = y;
      }
    }

    if (currentLine) {
      pageLines.push(currentLine.trim());
    }

    const cleanedPageText = pageLines.filter(l => l.length > 0).join('\n');
    totalCharacterCount += cleanedPageText.trim().length;

    pagesText.push({
      pageNumber: pageNum,
      text: cleanedPageText,
    });
  }

  const fullText = pagesText
    .map(p => `--- Page ${p.pageNumber} ---\n\n${p.text}`)
    .join('\n\n');

  // Detect scanned document: if total selectable text is < 20 characters across all pages
  const isScanned = totalCharacterCount < 20;

  return {
    fullText,
    pagesText,
    isScanned,
    pageCount,
  };
}
