/**
 * Domain types for File Management, Validation, and State.
 */

export type SupportedFileFormat = 
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'application/pdf'
  | 'text/plain'
  | 'text/markdown';

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  rotation: number; // 0, 90, 180, 270
  pageCount?: number;
  status: 'idle' | 'validating' | 'ready' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface FileValidationOptions {
  allowedMimes: string[];
  allowedExtensions: string[];
  maxFileSize?: number;
  checkMagicBytes?: boolean;
}

export interface FileValidationError {
  code: 'TYPE_NOT_ALLOWED' | 'SIZE_EXCEEDED' | 'CORRUPT_OR_EMPTY' | 'FILE_COUNT_EXCEEDED' | 'INVALID_MAGIC_BYTES';
  message: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: FileValidationError;
}
