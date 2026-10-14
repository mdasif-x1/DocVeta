import React from 'react';
import {
  RotateCw,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  Crop,
  GripVertical,
  Sparkles,
} from 'lucide-react';
import type { FileItem } from '../../types/file.types';
import { formatBytes, truncateString } from '../../lib/utilities/formatters';

export interface FileCardProps {
  item: FileItem;
  index: number;
  total: number;
  showRotate?: boolean;
  showEdit?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onEdit?: (item: FileItem) => void;
  onRotate?: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  item,
  index,
  total,
  showRotate = false,
  showEdit = false,
  isDragging = false,
  isDragOver = false,
  onEdit,
  onRotate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const isImage = item.type.startsWith('image/');
  const hasTransformations =
    Boolean(item.crop) ||
    (item.filter && item.filter !== 'none') ||
    Boolean(item.adjustments && (item.adjustments.brightness !== 0 || item.adjustments.contrast !== 0));

  return (
    <div
      draggable={Boolean(onDragStart)}
      onDragStart={e => onDragStart?.(e, index)}
      onDragOver={e => onDragOver?.(e, index)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop?.(e, index)}
      className={`group relative bg-white border rounded-xl p-2.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between select-none ${
        isDragging ? 'opacity-30 scale-95 border-brand-500 ring-2 ring-brand-500/20' : ''
      } ${
        isDragOver
          ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Top Header: Drag Handle, Page Index, and Quick Action Buttons */}
      <div className="flex items-center justify-between mb-2 gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400 transition p-0.5 -ml-0.5"
            title="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold tracking-tight tabular-nums">
            {index + 1}
          </span>
        </div>

        <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Reorder Accessible Buttons */}
          {onMoveUp && (
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              aria-label={`Move page ${index + 1} earlier`}
              title="Move earlier"
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {onMoveDown && (
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={index === total - 1}
              aria-label={`Move page ${index + 1} later`}
              title="Move later"
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Rotate Button */}
          {showRotate && onRotate && (
            <button
              type="button"
              onClick={() => onRotate(item.id)}
              aria-label={`Rotate page ${index + 1} 90 degrees`}
              title="Rotate 90°"
              className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50/60 transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove page ${index + 1}`}
            title="Remove page"
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document Preview Frame */}
      <div
        onClick={() => {
          if (showEdit && isImage && onEdit) {
            onEdit(item);
          }
        }}
        className={`relative w-full aspect-3/4 max-h-44 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 mb-2 transition-colors ${
          showEdit && isImage ? 'cursor-pointer hover:border-brand-300 group/preview' : ''
        }`}
      >
        {item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt={item.name}
            style={{
              transform: hasTransformations ? 'none' : `rotate(${item.rotation}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="max-w-full max-h-full object-contain pointer-events-none p-1"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
            <FileText className="w-8 h-8 text-slate-300 mb-1" />
            {item.pageCount && (
              <span className="text-[10px] font-medium text-slate-500">
                {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
              </span>
            )}
          </div>
        )}

        {/* Hover / Tap Hint to open full editor */}
        {showEdit && isImage && (
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-medium gap-1 backdrop-blur-[1px]">
            <Crop className="w-3 h-3" />
            <span>Edit</span>
          </div>
        )}
      </div>

      {/* Transformation indicator pills (compact) */}
      {(item.rotation !== 0 || item.crop || (item.filter && item.filter !== 'none')) && (
        <div className="flex flex-wrap items-center gap-1 mb-1.5">
          {item.rotation !== 0 && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
              {item.rotation}°
            </span>
          )}
          {item.crop && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
              Cropped
            </span>
          )}
          {item.filter && item.filter !== 'none' && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/80 flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              {item.filter === 'enhanced'
                ? 'Magic'
                : item.filter === 'bw'
                ? 'B&W'
                : 'Gray'}
            </span>
          )}
        </div>
      )}

      {/* Card Footer: Compact Filename & Size */}
      <div className="pt-1 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
        <p className="font-medium text-slate-700 truncate pr-1" title={item.name}>
          {truncateString(item.name, 16)}
        </p>
        <span className="text-slate-400 shrink-0 text-[10px] tabular-nums">
          {formatBytes(item.size)}
        </span>
      </div>
    </div>
  );
};
