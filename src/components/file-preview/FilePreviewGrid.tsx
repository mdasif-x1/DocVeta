import React, { useState } from 'react';
import type { FileItem } from '../../types/file.types';
import { FileCard } from './FileCard';

export interface FilePreviewGridProps {
  items: FileItem[];
  showRotate?: boolean;
  onReorder: (newItems: FileItem[]) => void;
  onRotate?: (id: string) => void;
  onRemove: (id: string) => void;
}

export const FilePreviewGrid: React.FC<FilePreviewGridProps> = ({
  items,
  showRotate = false,
  onReorder,
  onRotate,
  onRemove,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (_e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const updated = [...items];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    onReorder(updated);
    setDraggedIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onReorder(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onReorder(updated);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {items.map((item, index) => (
        <FileCard
          key={item.id}
          item={item}
          index={index}
          total={items.length}
          showRotate={showRotate}
          onRotate={onRotate}
          onRemove={onRemove}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};
