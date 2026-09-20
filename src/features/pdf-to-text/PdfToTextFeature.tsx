import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FileItem } from '../../types/file.types';
import type { ProcessingProgress } from '../../types/processing.types';
import type { ToolMetadata } from '../../types/tool.types';
import { FileUpload } from '../../components/file-upload/FileUpload';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { extractTextFromPdf } from '../../lib/pdfjs/pdf-to-text';
import type { ExtractedPdfTextResult } from '../../lib/pdfjs/pdf-to-text';
import { downloadText } from '../../lib/utilities/download';
import { Copy, Check, Download, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import { formatBytes } from '../../lib/utilities/formatters';

export interface PdfToTextFeatureProps {
  tool: ToolMetadata;
}

export const PdfToTextFeature: React.FC<PdfToTextFeatureProps> = ({ tool }) => {
  const [selectedFileItem, setSelectedFileItem] = useState<FileItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractedPdfTextResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelected = (items: FileItem[]) => {
    if (items.length > 0) {
      setSelectedFileItem(items[0]);
      setExtractionResult(null);
      setErrorMessage(null);
    }
  };

  const handleExtractText = async () => {
    if (!selectedFileItem) return;
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const result = await extractTextFromPdf(selectedFileItem.file, p => {
        setProgress(p);
      });
      setExtractionResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to extract text from PDF.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleCopy = async () => {
    if (!extractionResult?.fullText) return;
    try {
      await navigator.clipboard.writeText(extractionResult.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage('Failed to copy to clipboard.');
    }
  };

  const handleDownload = () => {
    if (!extractionResult?.fullText || !selectedFileItem) return;
    const base = selectedFileItem.name.replace(/\.[^/.]+$/, '') || 'extracted-text';
    downloadText(extractionResult.fullText, `${base}-text.txt`);
  };

  const handleReset = () => {
    setSelectedFileItem(null);
    setExtractionResult(null);
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
          subtitle="Extract digital, selectable text from all pages of your PDF document."
        />
      )}

      {/* State 2: Selected File Confirmation */}
      {selectedFileItem && !extractionResult && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                Selected Document
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
              onClick={handleExtractText}
              isLoading={isProcessing}
              leftIcon={<FileText className="w-5 h-5" />}
            >
              Extract Text from PDF
            </Button>
          </div>
        </div>
      )}

      {/* State 3: Extraction Result */}
      {extractionResult && (
        <div className="space-y-6">
          {/* Scanned Document Alert Warning if no selectable text found */}
          {extractionResult.isScanned ? (
            <Alert type="warning" title="Scanned PDF Detected (No Selectable Text)">
              <div className="space-y-2 mt-1">
                <p>
                  This PDF does not contain selectable digital text streams. It appears to consist of scanned images or pictures of physical pages.
                </p>
                <div className="pt-2">
                  <Link
                    to="/image-to-text"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 underline hover:text-black"
                  >
                    <span>Use our Image to Text (OCR) Tool instead</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Alert>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Extracted Text ({extractionResult.pageCount} {extractionResult.pageCount === 1 ? 'page' : 'pages'})
                </h3>
                <p className="text-xs text-slate-500">
                  All digital text was extracted directly in your browser.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleCopy}
                  leftIcon={copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                >
                  {copied ? 'Copied!' : 'Copy All Text'}
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
                  New PDF
                </Button>
              </div>
            </div>
          )}

          {/* Text Output Viewer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <textarea
              readOnly
              rows={16}
              value={extractionResult.fullText || '(No selectable text found in this PDF document)'}
              className="w-full border border-slate-200 rounded-xl p-4 text-sm font-mono text-slate-800 bg-slate-50/50 outline-none resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
};
