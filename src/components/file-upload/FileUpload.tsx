import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Plus } from 'lucide-react';
import { validateFile, validateBatch } from '../../lib/validation/file-validator';
import type { FileItem } from '../../types/file.types';
import { createThumbnailUrl } from '../../lib/image/canvas-utils';
import { inspectPdfPageCount } from '../../lib/pdf/merge-pdf';

export interface FileUploadProps {
  acceptedMimes: string[];
  acceptedExtensions: string[];
  multiple?: boolean;
  allowCamera?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  onFilesSelected: (files: FileItem[]) => void;
  onError?: (message: string) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  acceptedMimes,
  acceptedExtensions,
  multiple = true,
  allowCamera = false,
  maxFiles = 50,
  maxFileSize,
  onFilesSelected,
  onError,
  title = 'Choose files or drag and drop here',
  subtitle,
  compact = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processIncomingFiles = async (rawFileList: FileList | File[]) => {
    const rawFiles = Array.from(rawFileList);
    if (rawFiles.length === 0) return;

    setIsValidating(true);

    // 1. Validate batch limit
    const batchCheck = validateBatch(rawFiles, maxFiles);
    if (!batchCheck.valid) {
      onError?.(batchCheck.error?.message || 'File limit exceeded.');
      setIsValidating(false);
      return;
    }

    const processedItems: FileItem[] = [];
    const errors: string[] = [];

    for (const file of rawFiles) {
      // 2. Validate individual file
      const validation = await validateFile(file, {
        allowedMimes: acceptedMimes,
        allowedExtensions: acceptedExtensions,
        maxFileSize,
      });

      if (!validation.valid) {
        errors.push(validation.error?.message || `Invalid file "${file.name}"`);
        continue;
      }

      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      let previewUrl: string | undefined = undefined;
      let pageCount: number | undefined = undefined;

      // Fast thumbnail for images
      if (file.type.startsWith('image/')) {
        try {
          previewUrl = await createThumbnailUrl(file, 200, 200);
        } catch {
          // If thumbnail generation fails, still proceed
        }
      } else if (file.type === 'application/pdf') {
        pageCount = await inspectPdfPageCount(file);
      }

      processedItems.push({
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        rotation: 0,
        pageCount,
        status: 'ready',
      });
    }

    setIsValidating(false);

    if (errors.length > 0) {
      onError?.(errors.join(' '));
    }

    if (processedItems.length > 0) {
      onFilesSelected(processedItems);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processIncomingFiles(e.target.files);
    }
    // Reset value so selecting the exact same file works again
    e.target.value = '';
  };

  const triggerPicker = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const acceptString = acceptedExtensions.join(',');

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload files"
        />
        <button
          type="button"
          onClick={triggerPicker}
          disabled={isValidating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50 text-xs font-semibold text-slate-700 transition"
        >
          <Plus className="w-4 h-4 text-brand-600" />
          <span>Add More Files</span>
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerPicker}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerPicker();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Upload file drop zone"
      className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        isDragOver
          ? 'border-brand-500 bg-brand-50/70 scale-[0.99]'
          : 'border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        tabIndex={-1}
      />

      {allowCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleInputChange}
          className="hidden"
          tabIndex={-1}
        />
      )}

      <div className="flex flex-col items-center justify-center max-w-md mx-auto pointer-events-none">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-sm border border-brand-100">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          {subtitle || `Supported formats: ${acceptedExtensions.join(', ')}`}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              triggerPicker();
            }}
            disabled={isValidating}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            {isValidating ? 'Validating...' : multiple ? 'Choose Files' : 'Choose File'}
          </button>

          {allowCamera && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                triggerCamera();
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition flex items-center gap-1.5 sm:hidden"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
