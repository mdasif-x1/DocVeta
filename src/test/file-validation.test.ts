import { describe, it, expect } from 'vitest';
import { validateFile, validateBatch } from '../lib/validation/file-validator';

describe('File Validation Engine', () => {
  it('rejects empty files (0 bytes)', async () => {
    const emptyFile = new File([''], 'empty.pdf', { type: 'application/pdf' });
    const result = await validateFile(emptyFile);
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('CORRUPT_OR_EMPTY');
  });

  it('rejects files exceeding maximum file size limit', async () => {
    // 5MB limit test
    const largeContent = new Uint8Array(6 * 1024 * 1024);
    const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
    const result = await validateFile(largeFile, { maxFileSize: 5 * 1024 * 1024, checkMagicBytes: false });
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('SIZE_EXCEEDED');
  });

  it('rejects files with unsupported extensions', async () => {
    const exeFile = new File(['binarycontent'], 'program.exe', { type: 'application/x-msdownload' });
    const result = await validateFile(exeFile, {
      allowedExtensions: ['.pdf'],
      checkMagicBytes: false,
    });
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('TYPE_NOT_ALLOWED');
  });

  it('validates correct PDF magic bytes (%PDF)', async () => {
    const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]); // %PDF-1.4
    const pdfFile = new File([validPdfBytes], 'valid.pdf', { type: 'application/pdf' });
    const result = await validateFile(pdfFile, { checkMagicBytes: true });
    expect(result.valid).toBe(true);
  });

  it('detects corrupted or fake PDF file with invalid magic bytes', async () => {
    const fakePdfBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]); // Invalid header
    const fakeFile = new File([fakePdfBytes], 'corrupt.pdf', { type: 'application/pdf' });
    const result = await validateFile(fakeFile, { checkMagicBytes: true });
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('INVALID_MAGIC_BYTES');
  });

  it('validates batch count and total size limits', () => {
    const file1 = new File(['a'], '1.pdf', { type: 'application/pdf' });
    const file2 = new File(['b'], '2.pdf', { type: 'application/pdf' });

    // Count limit exceeded
    const countCheck = validateBatch([file1, file2], 1, 1000);
    expect(countCheck.valid).toBe(false);
    expect(countCheck.error?.code).toBe('FILE_COUNT_EXCEEDED');

    // Total size limit exceeded
    const sizeCheck = validateBatch([file1, file2], 10, 1);
    expect(sizeCheck.valid).toBe(false);
    expect(sizeCheck.error?.code).toBe('SIZE_EXCEEDED');

    // Valid batch
    const validBatch = validateBatch([file1, file2], 10, 1000);
    expect(validBatch.valid).toBe(true);
  });
});
