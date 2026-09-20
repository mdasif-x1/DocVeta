import { describe, it, expect } from 'vitest';
import { mergePdfFiles, inspectPdfPageCount } from '../lib/pdf/merge-pdf';
import { PDFDocument } from 'pdf-lib';
import type { FileItem } from '../types/file.types';

describe('PDF Merge Engine', () => {
  it('throws an error if fewer than 2 PDFs are provided', async () => {
    const singleItem: FileItem = {
      id: '1',
      file: new File([''], 'doc1.pdf', { type: 'application/pdf' }),
      name: 'doc1.pdf',
      size: 100,
      type: 'application/pdf',
      rotation: 0,
      status: 'ready',
    };

    await expect(mergePdfFiles([singleItem])).rejects.toThrow('At least 2 PDF files are required for merging.');
  });

  it('throws error when zero files are provided', async () => {
    await expect(mergePdfFiles([])).rejects.toThrow('At least 2 PDF files are required for merging.');
  });

  it('merges multiple valid PDFs into a single unified PDF', async () => {
    const docA = await PDFDocument.create();
    docA.addPage([400, 600]);
    const bytesA = await docA.save();

    const docB = await PDFDocument.create();
    docB.addPage([400, 600]);
    docB.addPage([400, 600]);
    const bytesB = await docB.save();

    const fileA = new File([bytesA as unknown as BlobPart], 'a.pdf', { type: 'application/pdf' });
    const fileB = new File([bytesB as unknown as BlobPart], 'b.pdf', { type: 'application/pdf' });

    const items: FileItem[] = [
      { id: '1', file: fileA, name: 'a.pdf', size: bytesA.length, type: 'application/pdf', rotation: 0, status: 'ready' },
      { id: '2', file: fileB, name: 'b.pdf', size: bytesB.length, type: 'application/pdf', rotation: 0, status: 'ready' },
    ];

    const mergedBlob = await mergePdfFiles(items);
    expect(mergedBlob).toBeInstanceOf(Blob);
    expect(mergedBlob.type).toBe('application/pdf');

    const mergedBuffer = await mergedBlob.arrayBuffer();
    const loadedMerged = await PDFDocument.load(mergedBuffer);
    expect(loadedMerged.getPageCount()).toBe(3);
  });

  it('inspectPdfPageCount accurately counts pages in a PDF file', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([300, 300]);
    doc.addPage([300, 300]);
    const bytes = await doc.save();
    const file = new File([bytes as unknown as BlobPart], 'test.pdf', { type: 'application/pdf' });

    const count = await inspectPdfPageCount(file);
    expect(count).toBe(2);
  });

  it('inspectPdfPageCount returns 0 for invalid files', async () => {
    const invalidFile = new File(['not a pdf content'], 'invalid.pdf', { type: 'application/pdf' });
    const count = await inspectPdfPageCount(invalidFile);
    expect(count).toBe(0);
  });

  it('throws a friendly error when attempting to merge corrupted files', async () => {
    const validDoc = await PDFDocument.create();
    validDoc.addPage();
    const validBytes = await validDoc.save();

    const fileA = new File([validBytes as unknown as BlobPart], 'a.pdf', { type: 'application/pdf' });
    const fileCorrupt = new File(['bad pdf data'], 'corrupt.pdf', { type: 'application/pdf' });

    const items: FileItem[] = [
      { id: '1', file: fileA, name: 'a.pdf', size: validBytes.length, type: 'application/pdf', rotation: 0, status: 'ready' },
      { id: '2', file: fileCorrupt, name: 'corrupt.pdf', size: 10, type: 'application/pdf', rotation: 0, status: 'ready' },
    ];

    await expect(mergePdfFiles(items)).rejects.toThrow(/Failed to read PDF "corrupt.pdf"/);
  });
});
