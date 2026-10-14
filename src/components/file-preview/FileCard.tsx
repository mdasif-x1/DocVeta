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
      className={`group relative bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between select-none ${
        isDragging ? 'opacity-40 scale-95 border-brand-500' : ''
      } ${
        isDragOver
          ? 'border-brand-500 ring-2 ring-brand-400/40 bg-brand-50/20'
          : 'border-slate-200/90'
      }`}
    >
      {/* Top action controls & Page / Sequence index */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-500 transition">
            <GripVertical className="w-3.5 h-3.5" />
          </span>
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
            Page {index + 1}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Accessible reorder buttons */}
          {onMoveUp && (
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              aria-label={`Move ${item.name} up`}
              title="Move earlier in order"
              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:text-slate-400"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {onMoveDown && (
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={index === total - 1}
              aria-label={`Move ${item.name} down`}
              title="Move later in order"
              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:text-slate-400"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Edit / Crop modal button for image tools */}
          {showEdit && isImage && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Edit and crop ${item.name}`}
              title="Edit, crop & enhance"
              className="p-1 rounded text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
            >
              <Crop className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Rotate button for image tools */}
          {showRotate && onRotate && (
            <button
              type="button"
              onClick={() => onRotate(item.id)}
              aria-label={`Rotate ${item.name} 90 degrees`}
              title="Quick rotate 90°"
              className="p-1 rounded text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name}`}
            title="Remove photo"
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Thumbnail or File Icon preview */}
      <div
        onClick={() => {
          if (showEdit && isImage && onEdit) {
            onEdit(item);
          }
        }}
        className={`relative w-full h-32 sm:h-36 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 mb-2.5 ${
          showEdit && isImage ? 'cursor-pointer hover:border-brand-300' : ''
        }`}
      >
        {item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt={item.name}
            style={{
              // If previewUrl already has baked transformations, do not apply CSS rotation
              transform: hasTransformations ? 'none' : `rotate(${item.rotation}deg)`,
              transition: 'transform 0.2s ease-in-out',
            }}
            className="max-w-full max-h-full object-contain pointer-events-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <FileText className="w-10 h-10 text-slate-300 mb-1" />
            {item.pageCount && (
              <span className="text-[11px] font-semibold text-slate-500">
                {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
              </span>
            )}
          </div>
        )}

        {/* Hover overlay hint for editing */}
        {showEdit && isImage && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[1px]">
            <Crop className="w-3.5 h-3.5" />
            <span>Click to Edit</span>
          </div>
        )}
      </div>

      {/* Status & Transformation Pills */}
      {(item.rotation !== 0 || item.crop || (item.filter && item.filter !== 'none')) && (
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {item.rotation !== 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold border border-brand-200">
              {item.rotation}°
            </span>
          )}
          {item.crop && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Cropped
            </span>
          )}
          {item.filter && item.filter !== 'none' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-0.5">
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

      {/* Filename and size info */}
      <div className="mt-auto">
        <p className="text-xs font-semibold text-slate-800 truncate" title={item.name}>
          {truncateString(item.name, 22)}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
          <span>{formatBytes(item.size)}</span>
        </div>
      </div>
    </div>
  );
};
