import { PDFDocument } from 'pdf-lib';
import type { FileItem } from '../../types/file.types';
import type { ProcessingProgress } from '../../types/processing.types';

/**
 * Merges multiple PDF files into one combined PDF document.
 */
export async function mergePdfFiles(
  items: FileItem[],
  onProgress?: (progress: ProcessingProgress) => void
): Promise<Blob> {
  if (items.length < 2) {
    throw new Error('At least 2 PDF files are required for merging.');
  }

  const mergedPdf = await PDFDocument.create();
  const totalFiles = items.length;

  for (let i = 0; i < totalFiles; i++) {
    const item = items[i];

    if (onProgress) {
      onProgress({
        currentStep: i + 1,
        totalSteps: totalFiles,
        percentage: Math.round(((i) / totalFiles) * 100),
        statusMessage: `Merging "${item.name}" (${i + 1} of ${totalFiles})...`,
      });
    }

    try {
      const buffer = await item.file.arrayBuffer();
      const donorPdf = await PDFDocument.load(buffer, { ignoreEncryption: false });
      const donorPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());

      for (const page of donorPages) {
        mergedPdf.addPage(page);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('Password') || msg.includes('encrypted')) {
        throw new Error(`File "${item.name}" is password-protected. Please remove the password before merging.`);
      }
      throw new Error(`Failed to read PDF "${item.name}". The document may be corrupted or invalid.`);
    }
  }

  if (onProgress) {
    onProgress({
      currentStep: totalFiles,
      totalSteps: totalFiles,
      percentage: 100,
      statusMessage: 'Finalizing merged document...',
    });
  }

  const mergedBytes = await mergedPdf.save();
  return new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Inspects a PDF file and returns its page count
 */
export async function inspectPdfPageCount(file: File): Promise<number> {
  try {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch {
    return 0;
  }
}
