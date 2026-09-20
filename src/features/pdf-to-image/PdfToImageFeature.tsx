import React, { useState } from 'react';
import type { FileItem } from '../../types/file.types';
import type { PdfToImageOptions, ProcessingProgress } from '../../types/processing.types';
import type { ToolMetadata } from '../../types/tool.types';
import { FileUpload } from '../../components/file-upload/FileUpload';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { convertPdfToImages, createZipFromImages } from '../../lib/pdfjs/pdf-to-image';
import type { RenderedPageImage } from '../../lib/pdfjs/pdf-to-image';
import { downloadBlob } from '../../lib/utilities/download';
import { Download, RefreshCw, FileArchive, Settings2, Image as ImageIcon } from 'lucide-react';
import { formatBytes } from '../../lib/utilities/formatters';

export interface PdfToImageFeatureProps {
  tool: ToolMetadata;
}

export const PdfToImageFeature: React.FC<PdfToImageFeatureProps> = ({ tool }) => {
  const [selectedFileItem, setSelectedFileItem] = useState<FileItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [renderedImages, setRenderedImages] = useState<RenderedPageImage[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  const [options, setOptions] = useState<PdfToImageOptions>({
    format: 'image/jpeg',
    quality: 0.92,
    scale: 2.0, // High DPI for crisp text
    selectedPages: [],
  });

  const handleFileSelected = (items: FileItem[]) => {
    if (items.length > 0) {
      setSelectedFileItem(items[0]);
      setRenderedImages([]);
      setErrorMessage(null);
    }
  };

  const handleRenderImages = async () => {
    if (!selectedFileItem) return;
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const results = await convertPdfToImages(selectedFileItem.file, options, p => {
        setProgress(p);
      });
      setRenderedImages(results);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to convert PDF pages to images.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownloadSingle = (img: RenderedPageImage) => {
    const ext = options.format === 'image/png' ? 'png' : 'jpg';
    const filename = `${selectedFileItem?.name.replace(/\.[^/.]+$/, '') || 'document'}-page-${img.pageNumber}.${ext}`;
    downloadBlob(img.blob, filename, options.format);
  };

  const handleDownloadAllZip = async () => {
    if (renderedImages.length === 0 || !selectedFileItem) return;
    setIsZipping(true);
    try {
      const baseName = selectedFileItem.name.replace(/\.[^/.]+$/, '') || 'pdf-pages';
      const zipBlob = await createZipFromImages(renderedImages, baseName, options.format);
      downloadBlob(zipBlob, `${baseName}-images.zip`, 'application/zip');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to bundle ZIP file.';
      setErrorMessage(msg);
    } finally {
      setIsZipping(false);
    }
  };

  // Ensure object URLs are cleaned up when renderedImages changes or component unmounts
  React.useEffect(() => {
    return () => {
      renderedImages.forEach(img => URL.revokeObjectURL(img.dataUrl));
    };
  }, [renderedImages]);

  const handleReset = () => {
    // Explicitly revoke blob object URLs on reset
    renderedImages.forEach(img => URL.revokeObjectURL(img.dataUrl));
    setSelectedFileItem(null);
    setRenderedImages([]);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert type="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* State 1: Upload */}
      {!selectedFileItem && (
        <FileUpload
          acceptedMimes={tool.acceptedMimes}
          acceptedExtensions={tool.acceptedExtensions}
          multiple={false}
          maxFiles={1}
          maxFileSize={tool.limits.maxSingleSize}
          onFilesSelected={handleFileSelected}
          onError={setErrorMessage}
          title="Choose a PDF file or drag and drop"
          subtitle="Select a PDF document to convert each page into a high-resolution JPG or PNG image."
        />
      )}

      {/* State 2: Selected PDF & Options */}
      {selectedFileItem && renderedImages.length === 0 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                Selected PDF
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {selectedFileItem.name}
              </h3>
              <p className="text-xs text-slate-500">
                Size: {formatBytes(selectedFileItem.size)}
                {selectedFileItem.pageCount && ` • ${selectedFileItem.pageCount} pages`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Change PDF
            </Button>
          </div>

          {/* Render Options */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-sm">
              <Settings2 className="w-4 h-4 text-brand-600" />
              <span>Image Output Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Image Format"
                value={options.format}
                onChange={e =>
                  setOptions(prev => ({
                    ...prev,
                    format: e.target.value as 'image/jpeg' | 'image/png',
                  }))
                }
                options={[
                  { label: 'JPG (Smaller size, ideal for photos)', value: 'image/jpeg' },
                  { label: 'PNG (Lossless clarity, ideal for text & diagrams)', value: 'image/png' },
                ]}
              />

              <Select
                label="Render Quality / Resolution"
                value={options.scale}
                onChange={e =>
                  setOptions(prev => ({
                    ...prev,
                    scale: Number(e.target.value),
                  }))
                }
                options={[
                  { label: 'Standard (1.5x scale)', value: 1.5 },
                  { label: 'High Definition (2.0x scale)', value: 2.0 },
                  { label: 'Ultra High (3.0x scale)', value: 3.0 },
                ]}
              />
            </div>
          </div>

          {/* Progress */}
          {isProcessing && progress && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
              <ProgressBar
                percentage={progress.percentage}
                statusMessage={progress.statusMessage}
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handleRenderImages}
              isLoading={isProcessing}
              leftIcon={<ImageIcon className="w-5 h-5" />}
            >
              Convert Pages to Images
            </Button>
          </div>
        </div>
      )}

      {/* State 3: Rendered Images & Download/ZIP */}
      {renderedImages.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {renderedImages.length} {renderedImages.length === 1 ? 'Page' : 'Pages'} Converted
              </h3>
              <p className="text-xs text-slate-500">
                Download individual pages or get all pages in a single ZIP archive.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleDownloadAllZip}
                isLoading={isZipping}
                leftIcon={<FileArchive className="w-4 h-4" />}
              >
                Download All (ZIP)
              </Button>
              <Button variant="outline" size="md" onClick={handleReset} leftIcon={<RefreshCw className="w-4 h-4" />}>
                Convert Another PDF
              </Button>
            </div>
          </div>

          {/* Rendered Pages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {renderedImages.map(img => (
              <div
                key={img.pageNumber}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Page {img.pageNumber}</span>
                  <span className="text-[10px] text-slate-400">{formatBytes(img.blob.size)}</span>
                </div>

                <div className="w-full h-48 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 mb-3">
                  <img
                    src={img.dataUrl}
                    alt={`Page ${img.pageNumber}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownloadSingle(img)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="w-full"
                >
                  Download Page {img.pageNumber}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
