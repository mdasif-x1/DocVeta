import { sanitizeFilename } from './sanitize';

/**
 * Triggers a browser file download from a Blob or Uint8Array.
 * Automatically cleans up the object URL to avoid memory leaks.
 */
export function downloadBlob(
  data: Blob | Uint8Array,
  filename: string,
  mimeType?: string
): void {
  const safeName = sanitizeFilename(filename, 'document');
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], { type: mimeType || 'application/octet-stream' });
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = safeName;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();

  // Defer cleanup to give the browser time to initiate download
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}

/**
 * Download plain text content as a file
 */
export function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename.endsWith('.txt') ? filename : `${filename}.txt`, 'text/plain');
}
