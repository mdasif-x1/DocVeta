import React from 'react';
import { RotateCw, Trash2, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import type { FileItem } from '../../types/file.types';
import { formatBytes, truncateString } from '../../lib/utilities/formatters';

export interface FileCardProps {
  item: FileItem;
  index: number;
  total: number;
  showRotate?: boolean;
  onRotate?: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  item,
  index,
  total,
  showRotate = false,
  onRotate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  return (
    <div
      draggable={Boolean(onDragStart)}
      onDragStart={e => onDragStart?.(e, index)}
      onDragOver={e => onDragOver?.(e, index)}
      onDrop={e => onDrop?.(e, index)}
      className="group relative bg-white border border-slate-200/90 rounded-xl p-3 shadow-sm hover:shadow-md transition flex flex-col justify-between select-none"
    >
      {/* Top action controls & Page / Sequence index */}
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
          {index + 1}
        </span>

        <div className="flex items-center gap-1">
          {/* Mobile-friendly accessible reorder buttons */}
          {onMoveUp && (
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              aria-label={`Move ${item.name} up`}
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
              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:text-slate-400"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Rotate button for image tools */}
          {showRotate && onRotate && (
            <button
              type="button"
              onClick={() => onRotate(item.id)}
              aria-label={`Rotate ${item.name} 90 degrees`}
              title="Rotate 90°"
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
            title="Remove"
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Thumbnail or File Icon preview */}
      <div className="w-full h-32 sm:h-36 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 mb-2.5">
        {item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt={item.name}
            style={{
              transform: `rotate(${item.rotation}deg)`,
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
      </div>

      {/* Filename and size info */}
      <div className="mt-auto">
        <p className="text-xs font-semibold text-slate-800 truncate" title={item.name}>
          {truncateString(item.name, 22)}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
          <span>{formatBytes(item.size)}</span>
          {item.rotation !== 0 && (
            <span className="text-[10px] text-brand-600 font-medium">
              {item.rotation}°
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
