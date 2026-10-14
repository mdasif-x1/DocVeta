import React, { useState } from 'react';
import type { FileItem } from '../../types/file.types';
import type { ProcessingProgress } from '../../types/processing.types';
import type { ToolMetadata } from '../../types/tool.types';
import { FileUpload } from '../../components/file-upload/FileUpload';
import { FilePreviewGrid } from '../../components/file-preview/FilePreviewGrid';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { mergePdfFiles } from '../../lib/pdf/merge-pdf';
import { downloadBlob } from '../../lib/utilities/download';
import { Download, RefreshCw, Files, FileCheck } from 'lucide-react';
import { formatBytes } from '../../lib/utilities/formatters';

export interface MergePdfFeatureProps {
  tool: ToolMetadata;
}

export const MergePdfFeature: React.FC<MergePdfFeatureProps> = ({ tool }) => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedSize, setMergedSize] = useState<number>(0);

  const handleFilesSelected = (newItems: FileItem[]) => {
    setErrorMessage(null);
    setMergedBlob(null);
    setItems(prev => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      setErrorMessage('Please select at least 2 PDF files to merge.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const blob = await mergePdfFiles(items, p => setProgress(p));
      setMergedBlob(blob);
      setMergedSize(blob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to merge PDF files.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) return;
    downloadBlob(mergedBlob, 'docveta-merged.pdf', 'application/pdf');
  };

  const handleReset = () => {
    setItems([]);
    setMergedBlob(null);
    setErrorMessage(null);
  };

  const totalPages = items.reduce((acc, it) => acc + (it.pageCount || 0), 0);

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert type="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* State 1: Upload Dropzone */}
      {items.length === 0 && (
        <FileUpload
          acceptedMimes={tool.acceptedMimes}
          acceptedExtensions={tool.acceptedExtensions}
          multiple={true}
          maxFiles={tool.limits.maxFiles}
          maxFileSize={tool.limits.maxSingleSize}
          onFilesSelected={handleFilesSelected}
          onError={setErrorMessage}
          title="Choose PDF files or drag and drop"
          subtitle="Select 2 or more PDF documents to combine into a single file."
        />
      )}

      {/* State 2: Selected PDFs Workspace */}
      {items.length > 0 && !mergedBlob && (
        <div className="space-y-5">
          {/* Top Bar: PDF count & Add / Clear Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">
                {items.length} {items.length === 1 ? 'file' : 'files'}
              </span>
              {totalPages > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-normal">
                    {totalPages} total pages
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <FileUpload
                compact
                acceptedMimes={tool.acceptedMimes}
                acceptedExtensions={tool.acceptedExtensions}
                multiple={true}
                onFilesSelected={handleFilesSelected}
                onError={setErrorMessage}
              />
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1.5 transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* PDF Files Grid */}
          <FilePreviewGrid
            items={items}
            showRotate={false}
            onRemove={handleRemove}
            onReorder={setItems}
          />

          {items.length < 2 && (
            <Alert type="info">
              Add at least 1 more PDF document to merge them together.
            </Alert>
          )}

          {/* Progress */}
          {isProcessing && progress && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
              <ProgressBar
                percentage={progress.percentage}
                statusMessage={progress.statusMessage}
              />
            </div>
          )}

          {/* Merge Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              PDFs will be merged in the order shown above.
            </span>
            <Button
              size="md"
              onClick={handleMerge}
              disabled={items.length < 2}
              isLoading={isProcessing}
              leftIcon={<Files className="w-4 h-4" />}
              className="px-5 py-2.5 font-medium"
            >
              Merge {items.length} PDFs
            </Button>
          </div>
        </div>
      )}

      {/* State 3: Download Merged PDF */}
      {mergedBlob && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center shadow-sm max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <FileCheck className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              PDFs successfully merged!
            </h3>
            <p className="text-sm text-slate-600">
              Combined {items.length} PDF files into one document ({formatBytes(mergedSize)}).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleDownload}
              leftIcon={<Download className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Download Merged PDF
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Merge More PDFs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
