import React, { useState } from 'react';
import type { FileItem } from '../../types/file.types';
import type { ImageToPdfOptions, ProcessingProgress } from '../../types/processing.types';
import type { ToolMetadata } from '../../types/tool.types';
import { FileUpload } from '../../components/file-upload/FileUpload';
import { FilePreviewGrid } from '../../components/file-preview/FilePreviewGrid';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { convertImagesToPdf } from '../../lib/pdf/image-to-pdf';
import { downloadBlob } from '../../lib/utilities/download';
import { generateDownloadName } from '../../lib/utilities/sanitize';
import { Download, RefreshCw, FileCheck, Settings2 } from 'lucide-react';
import { formatBytes } from '../../lib/utilities/formatters';

export interface ImageToPdfFeatureProps {
  tool: ToolMetadata;
}

export const ImageToPdfFeature: React.FC<ImageToPdfFeatureProps> = ({ tool }) => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const [pdfSize, setPdfSize] = useState<number>(0);

  // PDF Page Layout Options
  const [options, setOptions] = useState<ImageToPdfOptions>({
    pageSize: 'A4',
    orientation: 'auto',
    margin: 'none',
    fit: 'contain',
    quality: 0.92,
  });

  const handleFilesSelected = (newItems: FileItem[]) => {
    setErrorMessage(null);
    setGeneratedPdfBlob(null);
    setItems(prev => [...prev, ...newItems]);
  };

  const handleRotate = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item
      )
    );
  };

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleGeneratePdf = async () => {
    if (items.length === 0) return;
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const blob = await convertImagesToPdf(items, options, p => {
        setProgress(p);
      });
      setGeneratedPdfBlob(blob);
      setPdfSize(blob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate PDF.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownload = () => {
    if (!generatedPdfBlob) return;
    const downloadName = generateDownloadName(
      'images-to-pdf',
      'pdf',
      items[0]?.name
    );
    downloadBlob(generatedPdfBlob, downloadName, 'application/pdf');
  };

  const handleReset = () => {
    setItems([]);
    setGeneratedPdfBlob(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert type="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* State 1: Upload Dropzone (When no files selected yet) */}
      {items.length === 0 && (
        <FileUpload
          acceptedMimes={tool.acceptedMimes}
          acceptedExtensions={tool.acceptedExtensions}
          multiple={tool.multipleFiles}
          allowCamera={tool.allowCamera}
          maxFiles={tool.limits.maxFiles}
          maxFileSize={tool.limits.maxSingleSize}
          onFilesSelected={handleFilesSelected}
          onError={setErrorMessage}
          title={`Choose ${tool.shortName} files or drag and drop`}
          subtitle="Files are processed directly in your browser. Nothing is uploaded to any server."
        />
      )}

      {/* State 2: Selected Files Workspace */}
      {items.length > 0 && !generatedPdfBlob && (
        <div className="space-y-6">
          {/* Header Controls: File count + Add more */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {items.length} {items.length === 1 ? 'image' : 'images'} selected
              </h3>
              <p className="text-xs text-slate-500">
                Drag cards or use arrows to rearrange page order. Click rotate to adjust orientation.
              </p>
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
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Clear All
              </Button>
            </div>
          </div>

          {/* Thumbnails Grid */}
          <FilePreviewGrid
            items={items}
            showRotate={true}
            onRotate={handleRotate}
            onRemove={handleRemove}
            onReorder={setItems}
          />

          {/* Options Panel */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-sm">
              <Settings2 className="w-4 h-4 text-brand-600" />
              <span>Page Layout & PDF Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                label="Page Size"
                value={options.pageSize}
                onChange={e =>
                  setOptions(prev => ({ ...prev, pageSize: e.target.value as any }))
                }
                options={[
                  { label: 'A4 (Standard Document)', value: 'A4' },
                  { label: 'US Letter', value: 'Letter' },
                  { label: 'Fit to Image Size', value: 'FitImage' },
                ]}
              />

              <Select
                label="Orientation"
                value={options.orientation}
                onChange={e =>
                  setOptions(prev => ({ ...prev, orientation: e.target.value as any }))
                }
                options={[
                  { label: 'Auto (Match Image)', value: 'auto' },
                  { label: 'Portrait', value: 'portrait' },
                  { label: 'Landscape', value: 'landscape' },
                ]}
              />

              <Select
                label="Margins"
                value={options.margin}
                onChange={e =>
                  setOptions(prev => ({ ...prev, margin: e.target.value as any }))
                }
                options={[
                  { label: 'No Margin (Border to border)', value: 'none' },
                  { label: 'Small Margin', value: 'small' },
                  { label: 'Medium Margin', value: 'medium' },
                  { label: 'Large Margin', value: 'large' },
                ]}
              />

              <Select
                label="Image Fit"
                value={options.fit}
                onChange={e =>
                  setOptions(prev => ({ ...prev, fit: e.target.value as any }))
                }
                options={[
                  { label: 'Contain (Preserve ratio)', value: 'contain' },
                  { label: 'Fill Margin Bounds', value: 'fill' },
                ]}
              />
            </div>
          </div>

          {/* Processing Progress */}
          {isProcessing && progress && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
              <ProgressBar
                percentage={progress.percentage}
                statusMessage={progress.statusMessage}
              />
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              size="lg"
              onClick={handleGeneratePdf}
              isLoading={isProcessing}
              leftIcon={<FileCheck className="w-5 h-5" />}
            >
              Create PDF ({items.length} {items.length === 1 ? 'Page' : 'Pages'})
            </Button>
          </div>
        </div>
      )}

      {/* State 3: Result / Download State */}
      {generatedPdfBlob && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center shadow-sm max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <FileCheck className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Your PDF is ready!
            </h3>
            <p className="text-sm text-slate-600">
              Successfully converted {items.length} {items.length === 1 ? 'image' : 'images'} into a PDF ({formatBytes(pdfSize)}).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleDownload}
              leftIcon={<Download className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Download PDF
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Convert More Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
