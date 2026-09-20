import type { FileValidationResult } from '../../types/file.types';
import { LIMITS_CONFIG } from '../../config/limits.config';
import { formatBytes } from '../utilities/formatters';

interface ValidationOptions {
  allowedMimes?: string[];
  allowedExtensions?: string[];
  maxFileSize?: number;
  checkMagicBytes?: boolean;
}

/**
 * Reads the first N bytes of a File as a Uint8Array
 */
async function readHeaderBytes(file: File, length = 16): Promise<Uint8Array> {
  const slice = file.slice(0, length);
  const buffer = await slice.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Checks if bytes match expected magic signatures
 */
function verifyMagicBytes(bytes: Uint8Array, expectedType: string): boolean {
  if (bytes.length < 4) return false;

  // PDF check: %PDF
  if (expectedType === 'application/pdf') {
    return (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    );
  }

  // PNG check: \x89PNG\r\n\x1a\n
  if (expectedType === 'image/png') {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4E &&
      bytes[3] === 0x47
    );
  }

  // JPEG check: \xFF\xD8\xFF
  if (expectedType === 'image/jpeg') {
    return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  }

  // WebP check: RIFF....WEBP
  if (expectedType === 'image/webp') {
    const isRiff =
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46;
    if (!isRiff || bytes.length < 12) return false;
    const isWebp =
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50;
    return isWebp;
  }

  // Plain text / markdown check: ensure no binary null bytes in initial chunk
  if (expectedType === 'text/plain' || expectedType === 'text/markdown') {
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0x00) return false; // Binary null byte detected
    }
    return true;
  }

  return true;
}

/**
 * Validates an uploaded File item
 */
export async function validateFile(
  file: File,
  options: ValidationOptions = {}
): Promise<FileValidationResult> {
  const maxSize = options.maxFileSize || LIMITS_CONFIG.maxSingleFileSize;

  // 1. Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: {
        code: 'CORRUPT_OR_EMPTY',
        message: `File "${file.name}" is empty (0 bytes). Please upload a valid document.`,
      },
    };
  }

  // 2. Check single file size limit
  if (file.size > maxSize) {
    return {
      valid: false,
      error: {
        code: 'SIZE_EXCEEDED',
        message: `File "${file.name}" (${formatBytes(file.size)}) exceeds the maximum allowed size of ${formatBytes(maxSize)}.`,
      },
    };
  }

  // 3. Check extension
  const ext = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const isExtAllowed = options.allowedExtensions.some(
      e => e.toLowerCase() === ext
    );
    if (!isExtAllowed) {
      return {
        valid: false,
        error: {
          code: 'TYPE_NOT_ALLOWED',
          message: `The file format "${ext}" is not supported for this tool. Supported formats: ${options.allowedExtensions.join(', ')}.`,
        },
      };
    }
  }

  // 4. Magic bytes verification
  if (options.checkMagicBytes !== false) {
    try {
      const header = await readHeaderBytes(file, 16);
      
      // Determine what to verify based on extension or MIME
      let targetType = file.type;
      if (!targetType) {
        if (ext === '.pdf') targetType = 'application/pdf';
        else if (ext === '.png') targetType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') targetType = 'image/jpeg';
        else if (ext === '.webp') targetType = 'image/webp';
        else if (ext === '.txt' || ext === '.md') targetType = 'text/plain';
      }

      if (targetType) {
        const matches = verifyMagicBytes(header, targetType);
        if (!matches) {
          return {
            valid: false,
            error: {
              code: 'INVALID_MAGIC_BYTES',
              message: `File "${file.name}" appears corrupted or does not match its declared format.`,
            },
          };
        }
      }
    } catch {
      return {
        valid: false,
        error: {
          code: 'CORRUPT_OR_EMPTY',
          message: `Unable to read "${file.name}". The file may be locked or corrupt.`,
        },
      };
    }
  }

  return { valid: true };
}

/**
 * Validates a batch of files for total size and count limits
 */
export function validateBatch(
  files: File[],
  maxCount: number = LIMITS_CONFIG.maxFileCount,
  maxTotalSize: number = LIMITS_CONFIG.maxBatchTotalSize
): FileValidationResult {
  if (files.length > maxCount) {
    return {
      valid: false,
      error: {
        code: 'FILE_COUNT_EXCEEDED',
        message: `You selected ${files.length} files. The maximum allowed is ${maxCount} files per batch.`,
      },
    };
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  if (totalSize > maxTotalSize) {
    return {
      valid: false,
      error: {
        code: 'SIZE_EXCEEDED',
        message: `Total batch size (${formatBytes(totalSize)}) exceeds the maximum allowed limit of ${formatBytes(maxTotalSize)}.`,
      },
    };
  }

  return { valid: true };
}
