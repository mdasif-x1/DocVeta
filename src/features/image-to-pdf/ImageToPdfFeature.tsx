import React, { useState } from 'react';
import type { FileItem, CropRegion, ImageFilterMode, ImageAdjustments } from '../../types/file.types';
import type { ImageToPdfOptions, ProcessingProgress } from '../../types/processing.types';
import type { ToolMetadata } from '../../types/tool.types';
import { FileUpload } from '../../components/file-upload/FileUpload';
import { FilePreviewGrid } from '../../components/file-preview/FilePreviewGrid';
import { CameraCaptureModal } from '../../components/camera/CameraCaptureModal';
import { ImageEditorModal } from '../../components/image-editor/ImageEditorModal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { convertImagesToPdf } from '../../lib/pdf/image-to-pdf';
import { createThumbnailUrl } from '../../lib/image/canvas-utils';
import { downloadBlob } from '../../lib/utilities/download';
import { generateDownloadName } from '../../lib/utilities/sanitize';
import {
  Download,
  RefreshCw,
  FileCheck,
  Settings2,
  Camera,
  ArrowUpDown,
  RotateCw,
} from 'lucide-react';
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

  // Modal dialog states
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FileItem | null>(null);

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

  const handleCameraPhotosCaptured = async (rawFiles: File[]) => {
    const newItems: FileItem[] = [];
    for (const file of rawFiles) {
      let previewUrl: string | undefined;
      try {
        previewUrl = await createThumbnailUrl(file, 200, 200);
      } catch {
        // Fallback gracefully
      }
      newItems.push({
        id: `cam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        rotation: 0,
        status: 'ready',
      });
    }

    if (newItems.length > 0) {
      setErrorMessage(null);
      setGeneratedPdfBlob(null);
      setItems(prev => [...prev, ...newItems]);
    }
  };

  const handleRotate = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item
      )
    );
  };

  const handleRotateAll = () => {
    setItems(prev =>
      prev.map(item => ({
        ...item,
        rotation: (item.rotation + 90) % 360,
      }))
    );
  };

  const handleReverseOrder = () => {
    setItems(prev => [...prev].reverse());
  };

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveImageEdits = (
    id: string,
    updates: {
      rotation: number;
      crop?: CropRegion;
      filter?: ImageFilterMode;
      adjustments?: ImageAdjustments;
      previewUrl: string;
    }
  ) => {
    setItems(prev =>
      prev.map(it => {
        if (it.id === id) {
          return {
            ...it,
            rotation: updates.rotation,
            crop: updates.crop,
            filter: updates.filter,
            adjustments: updates.adjustments,
            previewUrl: updates.previewUrl,
          };
        }
        return it;
      })
    );
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

  const totalBytes = items.reduce((sum, it) => sum + it.size, 0);

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
          onOpenScanner={() => setIsCameraModalOpen(true)}
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
        <div className="space-y-5">
          {/* Top Bar: Page counter & Compact Workspace Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">
                {items.length} {items.length === 1 ? 'page' : 'pages'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-normal">
                {formatBytes(totalBytes)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Scan More (Camera) */}
              {tool.allowCamera && (
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  <span>Scan</span>
                </button>
              )}

              {/* Add More Files */}
              <FileUpload
                compact
                acceptedMimes={tool.acceptedMimes}
                acceptedExtensions={tool.acceptedExtensions}
                multiple={true}
                allowCamera={false}
                onFilesSelected={handleFilesSelected}
                onError={setErrorMessage}
              />

              {/* Rotate All shortcut */}
              <button
                type="button"
                onClick={handleRotateAll}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition shadow-2xs"
                title="Rotate all pages 90° clockwise"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Rotate All</span>
              </button>

              {/* Reverse Order shortcut */}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={handleReverseOrder}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition shadow-2xs"
                  title="Reverse page sequence"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reverse</span>
                </button>
              )}

              {/* Clear All */}
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1.5 transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Thumbnails Grid with drag and drop & edit modal trigger */}
          <FilePreviewGrid
            items={items}
            showRotate={true}
            showEdit={true}
            onEdit={item => setEditingItem(item)}
            onRotate={handleRotate}
            onRemove={handleRemove}
            onReorder={setItems}
          />

          {/* Collapsible / Streamlined Page Layout Settings */}
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 transition-all">
            <div className="flex items-center justify-between mb-3 text-slate-800 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Page Layout Options</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Select
                label="Page Size"
                value={options.pageSize}
                onChange={e =>
                  setOptions(prev => ({
                    ...prev,
                    pageSize: e.target.value as 'A4' | 'Letter' | 'FitImage',
                  }))
                }
                options={[
                  { label: 'A4 (210 × 297 mm)', value: 'A4' },
                  { label: 'US Letter', value: 'Letter' },
                  { label: 'Fit to Image Size', value: 'FitImage' },
                ]}
              />

              <Select
                label="Orientation"
                value={options.orientation}
                onChange={e =>
                  setOptions(prev => ({
                    ...prev,
                    orientation: e.target.value as 'auto' | 'portrait' | 'landscape',
                  }))
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
                  setOptions(prev => ({
                    ...prev,
                    margin: e.target.value as 'none' | 'small' | 'medium' | 'large',
                  }))
                }
                options={[
                  { label: 'None (Border to border)', value: 'none' },
                  { label: 'Small', value: 'small' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Large', value: 'large' },
                ]}
              />

              <Select
                label="Image Fit"
                value={options.fit}
                onChange={e =>
                  setOptions(prev => ({
                    ...prev,
                    fit: e.target.value as 'contain' | 'fill',
                  }))
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
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
              <ProgressBar
                percentage={progress.percentage}
                statusMessage={progress.statusMessage}
              />
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Page order above will match the generated PDF.
            </span>
            <Button
              size="md"
              onClick={handleGeneratePdf}
              isLoading={isProcessing}
              leftIcon={<FileCheck className="w-4 h-4" />}
              className="px-5 py-2.5 font-medium"
            >
              Export PDF ({items.length} {items.length === 1 ? 'Page' : 'Pages'})
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

      {/* Camera Scanner Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapturePhotos={handleCameraPhotosCaptured}
      />

      {/* Image Editor, Cropper & Enhancer Modal */}
      <ImageEditorModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveImageEdits}
      />
    </div>
  );
};
