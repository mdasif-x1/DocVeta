/**
 * Centralized File & Processing Limits Configuration
 * Enforces client-side memory safety and browser responsiveness.
 */

export const LIMITS_CONFIG = {
  // Max file size for a single file in bytes (default: 50MB)
  maxSingleFileSize: 50 * 1024 * 1024,
  maxSingleFileSizeLabel: '50MB',

  // Max total combined size for batch processing in bytes (default: 150MB)
  maxBatchTotalSize: 150 * 1024 * 1024,
  maxBatchTotalSizeLabel: '150MB',

  // Max number of files allowed in a single multi-file batch (e.g. merge, image to pdf)
  maxFileCount: 50,

  // Text input length limit for Text -> PDF (characters)
  maxTextInputLength: 100000, // ~100k characters (~20,000 words / ~40 pages)

  // Max PDF page count for rendering to images (to avoid browser tab memory exhaustion)
  maxPdfPagesToRender: 100,

  // Thumbnail max dimensions
  thumbnail: {
    maxWidth: 240,
    maxHeight: 240,
    quality: 0.7,
  },
} as const;
