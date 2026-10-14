import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FileItem, CropRegion, ImageFilterMode, ImageAdjustments } from '../../types/file.types';
import {
  loadImage,
  renderRotatedImage,
  applyImageFilter,
  createProcessedThumbnailUrl,
} from '../../lib/image/canvas-utils';
import {
  Crop as CropIcon,
  RotateCw,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  X,
  RotateCcw as ResetIcon,
  Maximize2,
  FileText,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface ImageEditorModalProps {
  isOpen: boolean;
  item: FileItem | null;
  onClose: () => void;
  onSave: (
    id: string,
    updates: {
      rotation: number;
      crop?: CropRegion;
      filter?: ImageFilterMode;
      adjustments?: ImageAdjustments;
      previewUrl: string;
    }
  ) => void;
}

type AspectRatioPreset = 'free' | 'original' | 'a4' | '1:1' | '4:3' | '16:9';

interface ImageEditorModalContentProps {
  item: FileItem;
  onClose: () => void;
  onSave: (
    id: string,
    updates: {
      rotation: number;
      crop?: CropRegion;
      filter?: ImageFilterMode;
      adjustments?: ImageAdjustments;
      previewUrl: string;
    }
  ) => void;
}

const ImageEditorModalContent: React.FC<ImageEditorModalContentProps> = ({
  item,
  onClose,
  onSave,
}) => {
  const [rotation, setRotation] = useState<number>(item.rotation || 0);
  const [crop, setCrop] = useState<CropRegion | null>(item.crop || null);
  const [filter, setFilter] = useState<ImageFilterMode>(item.filter || 'none');
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(
    item.adjustments || { brightness: 0, contrast: 0 }
  );
  const [aspectPreset, setAspectPreset] = useState<AspectRatioPreset>('free');
  const [activeTab, setActiveTab] = useState<'crop' | 'filter' | 'adjust'>('crop');
  const [isSaving, setIsSaving] = useState(false);

  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dragging state for crop handles
  const [dragAction, setDragAction] = useState<
    'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | null
  >(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initialCrop: CropRegion }>({
    clientX: 0,
    clientY: 0,
    initialCrop: { x: 0, y: 0, width: 100, height: 100 },
  });

  // Load image once on mount
  useEffect(() => {
    let canceled = false;
    loadImage(item.file)
      .then(img => {
        if (!canceled) {
          setLoadedImage(img);
        }
      })
      .catch(err => {
        console.error('Failed to load image in editor:', err);
      });

    return () => {
      canceled = true;
    };
  }, [item.file]);

  // Render live preview on canvas
  const updateCanvasPreview = useCallback(() => {
    if (!canvasRef.current || !loadedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Get rotated base canvas
    const rot = ((rotation % 360) + 360) % 360;
    const isPerp = rot % 180 !== 0;
    const baseW = isPerp ? loadedImage.height : loadedImage.width;
    const baseH = isPerp ? loadedImage.width : loadedImage.height;

    const baseRotated = renderRotatedImage(loadedImage, rot);

    // Set canvas dimensions
    canvas.width = baseW;
    canvas.height = baseH;

    ctx.clearRect(0, 0, baseW, baseH);
    ctx.drawImage(baseRotated, 0, 0);

    // Apply filter & adjustments
    if (filter !== 'none' || adjustments.brightness !== 0 || adjustments.contrast !== 0) {
      applyImageFilter(ctx, baseW, baseH, filter, adjustments);
    }
  }, [loadedImage, rotation, filter, adjustments]);

  useEffect(() => {
    updateCanvasPreview();
  }, [updateCanvasPreview]);

  // Crop Preset calculations
  const applyPresetCrop = (preset: AspectRatioPreset) => {
    setAspectPreset(preset);
    if (!loadedImage) return;

    const rot = ((rotation % 360) + 360) % 360;
    const isPerp = rot % 180 !== 0;
    const imgW = isPerp ? loadedImage.height : loadedImage.width;
    const imgH = isPerp ? loadedImage.width : loadedImage.height;

    if (preset === 'free') {
      setCrop({ x: 0, y: 0, width: 100, height: 100 });
      return;
    }

    let targetRatio = 1;
    if (preset === 'original') targetRatio = imgW / imgH;
    else if (preset === 'a4') targetRatio = 1 / 1.414; // Portrait A4
    else if (preset === '1:1') targetRatio = 1;
    else if (preset === '4:3') targetRatio = 4 / 3;
    else if (preset === '16:9') targetRatio = 16 / 9;

    const imageRatio = imgW / imgH;
    let cropW = 100;
    let cropH = 100;

    if (imageRatio > targetRatio) {
      // Image is wider than target ratio
      cropW = (targetRatio / imageRatio) * 100;
      cropH = 100;
    } else {
      // Image is taller than target ratio
      cropH = (imageRatio / targetRatio) * 100;
      cropW = 100;
    }

    const cropX = (100 - cropW) / 2;
    const cropY = (100 - cropH) / 2;

    setCrop({
      x: Math.round(cropX),
      y: Math.round(cropY),
      width: Math.round(cropW),
      height: Math.round(cropH),
    });
  };

  const handleResetCrop = () => {
    setCrop(null);
    setAspectPreset('free');
  };

  const handleResetAll = () => {
    setRotation(0);
    setCrop(null);
    setFilter('none');
    setAdjustments({ brightness: 0, contrast: 0 });
    setAspectPreset('free');
  };

  // Dragging event handlers for crop box
  const startDrag = (
    action: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w',
    clientX: number,
    clientY: number
  ) => {
    setDragAction(action);
    const currentCrop = crop || { x: 0, y: 0, width: 100, height: 100 };
    dragStartRef.current = {
      clientX,
      clientY,
      initialCrop: { ...currentCrop },
    };
  };

  const handlePointerDown = (
    e: React.MouseEvent | React.TouchEvent,
    action: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startDrag(action, clientX, clientY);
  };

  const onPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragAction || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) return;

      const deltaXPercent =
        ((clientX - dragStartRef.current.clientX) / containerRect.width) * 100;
      const deltaYPercent =
        ((clientY - dragStartRef.current.clientY) / containerRect.height) * 100;

      const { initialCrop } = dragStartRef.current;
      const minSize = 10; // minimum 10% width/height

      let newCrop = { ...initialCrop };

      if (dragAction === 'move') {
        let newX = initialCrop.x + deltaXPercent;
        let newY = initialCrop.y + deltaYPercent;
        newX = Math.max(0, Math.min(100 - initialCrop.width, newX));
        newY = Math.max(0, Math.min(100 - initialCrop.height, newY));
        newCrop.x = newX;
        newCrop.y = newY;
      } else {
        if (dragAction.includes('e')) {
          const maxW = 100 - initialCrop.x;
          newCrop.width = Math.max(minSize, Math.min(maxW, initialCrop.width + deltaXPercent));
        }
        if (dragAction.includes('s')) {
          const maxH = 100 - initialCrop.y;
          newCrop.height = Math.max(minSize, Math.min(maxH, initialCrop.height + deltaYPercent));
        }
        if (dragAction.includes('w')) {
          const maxX = initialCrop.x + initialCrop.width - minSize;
          const proposedX = Math.max(0, Math.min(maxX, initialCrop.x + deltaXPercent));
          newCrop.width = initialCrop.width + (initialCrop.x - proposedX);
          newCrop.x = proposedX;
        }
        if (dragAction.includes('n')) {
          const maxY = initialCrop.y + initialCrop.height - minSize;
          const proposedY = Math.max(0, Math.min(maxY, initialCrop.y + deltaYPercent));
          newCrop.height = initialCrop.height + (initialCrop.y - proposedY);
          newCrop.y = proposedY;
        }
      }

      setCrop({
        x: Math.round(newCrop.x * 10) / 10,
        y: Math.round(newCrop.y * 10) / 10,
        width: Math.round(newCrop.width * 10) / 10,
        height: Math.round(newCrop.height * 10) / 10,
      });
    },
    [dragAction]
  );

  const onPointerUp = useCallback(() => {
    setDragAction(null);
  }, []);

  // Global mouse / touch listeners during drag
  useEffect(() => {
    if (!dragAction) return;

    const handleMouseMove = (e: MouseEvent) => {
      onPointerMove(e.clientX, e.clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleEnd = () => {
      onPointerUp();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragAction, onPointerMove, onPointerUp]);

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Determine if a meaningful crop is set
      const isFullCrop =
        !crop ||
        (crop.x === 0 && crop.y === 0 && crop.width === 100 && crop.height === 100);
      const appliedCrop = isFullCrop ? undefined : crop;

      // Generate updated thumbnail with exact applied transformations
      const previewUrl = await createProcessedThumbnailUrl(
        item.file,
        {
          rotation,
          crop: appliedCrop,
          filter,
          adjustments,
        },
        280,
        280
      );

      onSave(item.id, {
        rotation,
        crop: appliedCrop,
        filter,
        adjustments,
        previewUrl,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save image edits:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentCrop = crop || { x: 0, y: 0, width: 100, height: 100 };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <CropIcon className="w-5 h-5 text-brand-400" />
            <div>
              <h2 id="editor-title" className="text-sm sm:text-base font-bold">
                Edit & Enhance Photo
              </h2>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                {item.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              title="Reset all edits"
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <ResetIcon className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Canvas & Interactive Crop Area */}
        <div className="relative flex-1 bg-black/90 p-4 sm:p-6 flex items-center justify-center overflow-hidden min-h-[280px] sm:min-h-[380px]">
          <div
            ref={containerRef}
            className="relative inline-block max-w-full max-h-[460px] select-none shadow-xl border border-slate-800"
          >
            {/* The Live Rendered Canvas */}
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[460px] object-contain block mx-auto"
            />

            {/* Interactive Crop Overlay */}
            {activeTab === 'crop' && (
              <div
                className="absolute border-2 border-brand-400 bg-brand-500/10 cursor-move transition-[box-shadow]"
                style={{
                  left: `${currentCrop.x}%`,
                  top: `${currentCrop.y}%`,
                  width: `${currentCrop.width}%`,
                  height: `${currentCrop.height}%`,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                }}
                onMouseDown={e => handlePointerDown(e, 'move')}
                onTouchStart={e => handlePointerDown(e, 'move')}
              >
                {/* 3x3 Rule-of-Thirds Grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-brand-300/40" />
                  <div className="border-r border-b border-brand-300/40" />
                  <div className="border-b border-brand-300/40" />
                  <div className="border-r border-b border-brand-300/40" />
                  <div className="border-r border-b border-brand-300/40" />
                  <div className="border-b border-brand-300/40" />
                  <div className="border-r border-b border-brand-300/40" />
                  <div className="border-r border-b border-brand-300/40" />
                  <div />
                </div>

                {/* 4 Corner Handles */}
                <div
                  onMouseDown={e => handlePointerDown(e, 'nw')}
                  onTouchStart={e => handlePointerDown(e, 'nw')}
                  className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-brand-600 rounded-full cursor-nwse-resize shadow-md"
                />
                <div
                  onMouseDown={e => handlePointerDown(e, 'ne')}
                  onTouchStart={e => handlePointerDown(e, 'ne')}
                  className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-brand-600 rounded-full cursor-nesw-resize shadow-md"
                />
                <div
                  onMouseDown={e => handlePointerDown(e, 'se')}
                  onTouchStart={e => handlePointerDown(e, 'se')}
                  className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-brand-600 rounded-full cursor-nwse-resize shadow-md"
                />
                <div
                  onMouseDown={e => handlePointerDown(e, 'sw')}
                  onTouchStart={e => handlePointerDown(e, 'sw')}
                  className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-brand-600 rounded-full cursor-nesw-resize shadow-md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 px-4 py-2 bg-slate-950 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('crop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'crop'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CropIcon className="w-3.5 h-3.5" />
            <span>Crop & Rotate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('filter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'filter'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document Filters</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('adjust')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'adjust'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Brightness & Contrast</span>
          </button>
        </div>

        {/* Active Tool Sub-Panel */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          {/* TAB 1: CROP & ROTATE */}
          {activeTab === 'crop' && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Rotation buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 mr-1">Rotate:</span>
                <button
                  type="button"
                  onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                  title="Rotate -90°"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>-90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                  title="Rotate +90°"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>+90°</span>
                </button>
                {rotation !== 0 && (
                  <span className="text-xs font-bold text-brand-400 ml-1">
                    {rotation}°
                  </span>
                )}
              </div>

              {/* Crop Ratio Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-slate-400 mr-1">Ratio:</span>
                <button
                  type="button"
                  onClick={() => applyPresetCrop('free')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    aspectPreset === 'free'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Maximize2 className="w-3 h-3 inline mr-1" />
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetCrop('a4')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    aspectPreset === 'a4'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-3 h-3 inline mr-1" />
                  A4 Paper
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetCrop('1:1')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    aspectPreset === '1:1'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  1:1
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetCrop('4:3')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    aspectPreset === '4:3'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  4:3
                </button>

                {crop && (
                  <button
                    type="button"
                    onClick={handleResetCrop}
                    className="ml-2 text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2"
                  >
                    Clear Crop
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FILTERS */}
          {activeTab === 'filter' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setFilter('none')}
                className={`p-3 rounded-xl border text-left transition ${
                  filter === 'none'
                    ? 'border-brand-500 bg-brand-500/10 text-white'
                    : 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span className="block text-xs font-bold">Original</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  Natural color & light
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilter('enhanced')}
                className={`p-3 rounded-xl border text-left transition ${
                  filter === 'enhanced'
                    ? 'border-brand-500 bg-brand-500/10 text-white'
                    : 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span className="block text-xs font-bold flex items-center gap-1 text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  Magic Color
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  Vibrant text & clean paper
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilter('bw')}
                className={`p-3 rounded-xl border text-left transition ${
                  filter === 'bw'
                    ? 'border-brand-500 bg-brand-500/10 text-white'
                    : 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span className="block text-xs font-bold text-amber-300">B&W Document</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  High-contrast scan text
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilter('grayscale')}
                className={`p-3 rounded-xl border text-left transition ${
                  filter === 'grayscale'
                    ? 'border-brand-500 bg-brand-500/10 text-white'
                    : 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span className="block text-xs font-bold">Grayscale</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  Smooth 8-bit monochrome
                </span>
              </button>
            </div>
          )}

          {/* TAB 3: ADJUSTMENTS */}
          {activeTab === 'adjust' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono">{adjustments.brightness}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={adjustments.brightness}
                  onChange={e =>
                    setAdjustments(prev => ({
                      ...prev,
                      brightness: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-brand-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono">{adjustments.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={adjustments.contrast}
                  onChange={e =>
                    setAdjustments(prev => ({
                      ...prev,
                      contrast: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-brand-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {crop && <span>Cropped • </span>}
            {rotation !== 0 && <span>Rotated {rotation}° • </span>}
            {filter !== 'none' && <span className="capitalize">{filter} filter</span>}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  return (
    <ImageEditorModalContent
      key={`${item.id}-${item.rotation}-${item.crop ? 'c' : 'nc'}`}
      item={item}
      onClose={onClose}
      onSave={onSave}
    />
  );
};
