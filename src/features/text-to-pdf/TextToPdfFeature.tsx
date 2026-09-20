import React, { useState } from 'react';
import type { TextToPdfOptions, ProcessingProgress } from '../../types/processing.types';
import type { ToolMetadata } from '../../types/tool.types';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { convertTextToPdf } from '../../lib/pdf/text-to-pdf';
import { downloadBlob } from '../../lib/utilities/download';
import { Download, RefreshCw, FileText, Upload, Settings2 } from 'lucide-react';
import { LIMITS_CONFIG } from '../../config/limits.config';
import { formatBytes } from '../../lib/utilities/formatters';

export interface TextToPdfFeatureProps {
  tool: ToolMetadata;
}

export const TextToPdfFeature: React.FC<TextToPdfFeatureProps> = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const [pdfSize, setPdfSize] = useState<number>(0);

  const [options, setOptions] = useState<TextToPdfOptions>({
    fontSize: 12,
    lineHeight: 1.5,
    pageSize: 'A4',
    margin: 'medium',
    fontFamily: 'Helvetica',
    includePageNumbers: true,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Text file is too large. Please select a file under 2MB.');
      return;
    }

    try {
      const content = await file.text();
      setText(content);
      setErrorMessage(null);
    } catch {
      setErrorMessage('Failed to read text file.');
    }
    e.target.value = '';
  };

  const handleGeneratePdf = async () => {
    if (!text.trim()) {
      setErrorMessage('Please enter or paste text to generate your PDF document.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const blob = await convertTextToPdf(text, options, p => setProgress(p));
      setGeneratedPdfBlob(blob);
      setPdfSize(blob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate PDF from text.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownload = () => {
    if (!generatedPdfBlob) return;
    downloadBlob(generatedPdfBlob, 'docveta-document.pdf', 'application/pdf');
  };

  const handleReset = () => {
    setText('');
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

      {!generatedPdfBlob ? (
        <div className="space-y-6">
          {/* Text Editor Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <label htmlFor="text-input" className="text-sm font-bold text-slate-800">
                Enter or Paste Document Text
              </label>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-brand-600" />
                  <span>Upload .txt / .md</span>
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {text && (
                  <Button variant="ghost" size="sm" onClick={() => setText('')}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <textarea
              id="text-input"
              rows={12}
              value={text}
              onChange={e => setText(e.target.value.slice(0, LIMITS_CONFIG.maxTextInputLength))}
              placeholder="Type or paste your text here... DocVeta will format it with clean margins, typography, and page numbers automatically."
              className="w-full border border-slate-200 rounded-xl p-4 text-sm font-mono text-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-y"
            />

            <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
              <span>{text.length.toLocaleString()} / {LIMITS_CONFIG.maxTextInputLength.toLocaleString()} characters</span>
              <span>100% processed locally in your browser</span>
            </div>
          </div>

          {/* Typography & Layout Settings */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-sm">
              <Settings2 className="w-4 h-4 text-brand-600" />
              <span>Document Typography & Page Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                label="Font Family"
                value={options.fontFamily}
                onChange={e =>
                  setOptions(prev => ({ ...prev, fontFamily: e.target.value as any }))
                }
                options={[
                  { label: 'Helvetica (Clean Sans)', value: 'Helvetica' },
                  { label: 'Times-Roman (Classic Serif)', value: 'TimesRoman' },
                  { label: 'Courier (Monospace Code)', value: 'Courier' },
                ]}
              />

              <Select
                label="Font Size"
                value={options.fontSize}
                onChange={e =>
                  setOptions(prev => ({ ...prev, fontSize: Number(e.target.value) }))
                }
                options={[
                  { label: '10 pt (Compact)', value: 10 },
                  { label: '12 pt (Standard)', value: 12 },
                  { label: '14 pt (Large)', value: 14 },
                  { label: '16 pt (Extra Large)', value: 16 },
                ]}
              />

              <Select
                label="Page Size"
                value={options.pageSize}
                onChange={e =>
                  setOptions(prev => ({ ...prev, pageSize: e.target.value as any }))
                }
                options={[
                  { label: 'A4 (International)', value: 'A4' },
                  { label: 'US Letter', value: 'Letter' },
                ]}
              />

              <Select
                label="Margins"
                value={options.margin}
                onChange={e =>
                  setOptions(prev => ({ ...prev, margin: e.target.value as any }))
                }
                options={[
                  { label: 'Small Margins', value: 'small' },
                  { label: 'Medium Margins', value: 'medium' },
                  { label: 'Large Margins', value: 'large' },
                ]}
              />
            </div>
          </div>

          {/* Progress Indicator */}
          {isProcessing && progress && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
              <ProgressBar
                percentage={progress.percentage}
                statusMessage={progress.statusMessage}
              />
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handleGeneratePdf}
              isLoading={isProcessing}
              disabled={!text.trim()}
              leftIcon={<FileText className="w-5 h-5" />}
            >
              Create PDF Document
            </Button>
          </div>
        </div>
      ) : (
        /* Result / Download Screen */
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center shadow-sm max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Your PDF Document is ready!
            </h3>
            <p className="text-sm text-slate-600">
              Successfully generated formatted PDF ({formatBytes(pdfSize)}).
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
              Create Another Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
