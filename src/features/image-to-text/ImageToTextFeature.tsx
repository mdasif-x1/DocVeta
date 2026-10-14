import React, { useState } from 'react';
import type { FileItem } from '../../types/file.types';
import type { ProcessingProgress } from '../../types/processing.types';
import type { ToolMetadata } from '../../types/tool.types';
import { FileUpload } from '../../components/file-upload/FileUpload';
import { CameraCaptureModal } from '../../components/camera/CameraCaptureModal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { performImageOcr } from '../../lib/ocr/image-ocr';
import { createThumbnailUrl } from '../../lib/image/canvas-utils';
import { downloadText } from '../../lib/utilities/download';
import { Copy, Check, Download, RefreshCw, ScanText, Info } from 'lucide-react';
import { formatBytes } from '../../lib/utilities/formatters';

export interface ImageToTextFeatureProps {
  tool: ToolMetadata;
}

export const ImageToTextFeature: React.FC<ImageToTextFeatureProps> = ({ tool }) => {
  const [selectedFileItem, setSelectedFileItem] = useState<FileItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const handleCameraPhotosCaptured = async (rawFiles: File[]) => {
    if (rawFiles.length === 0) return;
    const file = rawFiles[0];
    let previewUrl: string | undefined;
    try {
      previewUrl = await createThumbnailUrl(file, 200, 200);
    } catch {
      // Fallback
    }

    const item: FileItem = {
      id: `ocr-cam-${Date.now()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl,
      rotation: 0,
      status: 'ready',
    };

    setSelectedFileItem(item);
    setExtractedText(null);
    setConfidence(null);
    setErrorMessage(null);
  };

  const handleFileSelected = (items: FileItem[]) => {
    if (items.length > 0) {
      setSelectedFileItem(items[0]);
      setExtractedText(null);
      setConfidence(null);
      setErrorMessage(null);
    }
  };

  const handleRunOcr = async () => {
    if (!selectedFileItem) return;
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const result = await performImageOcr(selectedFileItem.file, 'eng', p => {
        setProgress(p);
      });
      setExtractedText(result.text);
      setConfidence(result.confidence);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to perform OCR on image.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleCopy = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage('Failed to copy to clipboard.');
    }
  };

  const handleDownload = () => {
    if (!extractedText || !selectedFileItem) return;
    const base = selectedFileItem.name.replace(/\.[^/.]+$/, '') || 'ocr-text';
    downloadText(extractedText, `${base}-extracted.txt`);
  };

  const handleReset = () => {
    setSelectedFileItem(null);
    setExtractedText(null);
    setConfidence(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert type="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* State 1: Upload Dropzone */}
      {!selectedFileItem && (
        <FileUpload
          acceptedMimes={tool.acceptedMimes}
          acceptedExtensions={tool.acceptedExtensions}
          multiple={false}
          allowCamera={tool.allowCamera}
          onOpenScanner={() => setIsCameraModalOpen(true)}
          maxFiles={1}
          maxFileSize={tool.limits.maxSingleSize}
          onFilesSelected={handleFileSelected}
          onError={setErrorMessage}
          title="Choose an image or take a photo"
          subtitle="Extract editable digital text from photos, scans, receipts, or screenshots."
        />
      )}

      {/* State 2: Selected Image & OCR Options */}
      {selectedFileItem && extractedText === null && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="w-48 h-48 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
              {selectedFileItem.previewUrl ? (
                <img
                  src={selectedFileItem.previewUrl}
                  alt={selectedFileItem.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <ScanText className="w-12 h-12 text-slate-300" />
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  Target Image
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedFileItem.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Size: {formatBytes(selectedFileItem.size)}
                </p>
              </div>

              {/* Realistic Accuracy Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  OCR runs locally in a background Web Worker. Accuracy depends on image quality, lighting, resolution, and font clarity.
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="md"
                  onClick={handleRunOcr}
                  isLoading={isProcessing}
                  leftIcon={<ScanText className="w-4 h-4" />}
                >
                  Extract Text (OCR)
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Choose Different Image
                </Button>
              </div>
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
        </div>
      )}

      {/* State 3: Editable OCR Result */}
      {extractedText !== null && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Extracted Text Result
                </h3>
                {confidence !== null && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Confidence: {Math.round(confidence)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                You can review or edit the recognized text below before copying.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download .txt
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RefreshCw className="w-4 h-4" />}>
                Scan Another Image
              </Button>
            </div>
          </div>

          {/* Editable Text Result Area */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <textarea
              rows={14}
              value={extractedText}
              onChange={e => setExtractedText(e.target.value)}
              placeholder="No text recognized in image."
              className="w-full border border-slate-200 rounded-xl p-4 text-sm font-mono text-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-y"
            />
          </div>
        </div>
      )}

      {/* Live Camera Scanner Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapturePhotos={handleCameraPhotosCaptured}
      />
    </div>
  );
};
