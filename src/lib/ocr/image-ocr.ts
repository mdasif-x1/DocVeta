import { createWorker } from 'tesseract.js';
import type { OcrResult, ProcessingProgress } from '../../types/processing.types';

export interface OcrProgressCallback {
  (progress: ProcessingProgress): void;
}

/**
 * Runs OCR recognition on an image file using Tesseract.js inside a dedicated Web Worker.
 * Safely cleans up the worker after recognition to preserve device memory.
 */
export async function performImageOcr(
  file: File,
  language = 'eng',
  onProgress?: OcrProgressCallback
): Promise<OcrResult> {
  if (onProgress) {
    onProgress({
      currentStep: 1,
      totalSteps: 3,
      percentage: 10,
      statusMessage: 'Initializing OCR recognition worker...',
    });
  }

  // Create isolated worker
  const worker = await createWorker(language, 1, {
    logger: m => {
      if (onProgress && m.status === 'recognizing text') {
        const pct = Math.min(99, Math.max(10, Math.round((m.progress || 0) * 100)));
        onProgress({
          currentStep: 2,
          totalSteps: 3,
          percentage: pct,
          statusMessage: `Recognizing text (${pct}%)...`,
        });
      }
    },
  });

  try {
    const ret = await worker.recognize(file);
    const text = ret.data.text.trim();
    const confidence = ret.data.confidence;

    if (onProgress) {
      onProgress({
        currentStep: 3,
        totalSteps: 3,
        percentage: 100,
        statusMessage: 'Text extraction complete.',
      });
    }

    return {
      text,
      confidence,
    };
  } finally {
    // Terminate worker immediately to free memory
    await worker.terminate();
  }
}
