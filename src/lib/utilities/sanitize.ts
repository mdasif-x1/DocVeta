/**
 * Sanitize filenames to prevent path traversal, control character injection,
 * or invalid characters in download names across operating systems.
 */
export function sanitizeFilename(name: string, fallback = 'download'): string {
  if (!name || typeof name !== 'string') return fallback;

  // Remove any path traversal segments entirely
  let clean = name.replace(/(\.\.[/\\]|\.\.)+/g, '');
  clean = clean.replace(/[/\\\\]+/g, '_');

  // Strip invalid/control characters across Windows, Mac, Linux: < > : " / \ | ? * and ASCII 0-31
  // eslint-disable-next-line no-control-regex
  clean = clean.replace(/[<>:"/\\|?*\x00-\x1F]/g, '');

  // Strip repeated dots or underscores
  clean = clean.replace(/\.{2,}/g, '.');
  clean = clean.replace(/_{2,}/g, '_');

  // Strip leading/trailing dots, underscores, or spaces
  clean = clean.replace(/^[.\s_]+|[.\s_]+$/g, '');

  // Trim whitespace
  clean = clean.trim();

  // If after sanitization no meaningful alphanumeric characters remain, return fallback
  if (!clean || !/[a-zA-Z0-9]/.test(clean)) {
    return fallback;
  }

  // Enforce max length
  if (clean.length > 80) {
    const extIndex = clean.lastIndexOf('.');
    if (extIndex > 0) {
      const ext = clean.slice(extIndex);
      clean = clean.slice(0, 80 - ext.length) + ext;
    } else {
      clean = clean.slice(0, 80);
    }
  }

  return clean;
}

/**
 * Generate standardized, descriptive download filename
 */
export function generateDownloadName(
  prefix: string,
  extension: string,
  originalFilename?: string
): string {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  if (originalFilename) {
    const cleanOrig = sanitizeFilename(originalFilename).replace(/\.[^/.]+$/, '');
    if (cleanOrig.length > 0) {
      return `${cleanOrig}-${prefix}${ext}`;
    }
  }
  return `docveta-${prefix}${ext}`;
}

/**
 * Escape basic text for safe rendering
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
