/**
 * Lazy PDF.js Loader
 * Only loaded when a user opens PDF to Image or PDF to Text tools.
 */

let pdfjsInstance: typeof import('pdfjs-dist') | null = null;

export async function getPdfJs(): Promise<typeof import('pdfjs-dist')> {
  if (pdfjsInstance) return pdfjsInstance;

  const pdfjs = await import('pdfjs-dist');

  // Configure worker using Vite URL resolver or CDN fallback
  try {
    const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;
  } catch {
    // Robust CDN fallback if URL import fails in specific testing environments
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  pdfjsInstance = pdfjs;
  return pdfjsInstance;
}
