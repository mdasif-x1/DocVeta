import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateFitDimensions,
  applyImageFilter,
  renderProcessedImage,
} from '../lib/image/canvas-utils';

describe('Canvas Utils & Processing Engine', () => {
  beforeEach(() => {
    const dummyCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(100 * 100 * 4),
      }),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(dummyCtx);
  });

  it('calculates aspect-ratio-preserving dimensions (contain)', () => {
    // 800x600 in 400x400 box -> should be 400x300 centered
    const dims = calculateFitDimensions(800, 600, 400, 400);
    expect(dims.width).toBe(400);
    expect(dims.height).toBe(300);
    expect(dims.x).toBe(0);
    expect(dims.y).toBe(50);
  });

  it('calculates fit dimensions for portrait image in landscape box', () => {
    // 600x800 in 400x400 box -> should be 300x400 centered
    const dims = calculateFitDimensions(600, 800, 400, 400);
    expect(dims.width).toBe(300);
    expect(dims.height).toBe(400);
    expect(dims.x).toBe(50);
    expect(dims.y).toBe(0);
  });

  it('applies document filters (enhanced, bw, grayscale) to pixel data', () => {
    const imgData = {
      data: new Uint8ClampedArray([
        100, 100, 100, 255, // pixel 1
        200, 200, 200, 255, // pixel 2
      ]),
    };
    const mockCtx = {
      getImageData: vi.fn().mockReturnValue(imgData),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    // Test enhanced filter
    applyImageFilter(mockCtx, 2, 1, 'enhanced', { brightness: 10, contrast: 10 });
    expect(mockCtx.putImageData).toHaveBeenCalledWith(imgData, 0, 0);

    // Test B&W document filter
    applyImageFilter(mockCtx, 2, 1, 'bw');
    expect(mockCtx.putImageData).toHaveBeenCalled();

    // Test grayscale filter
    applyImageFilter(mockCtx, 2, 1, 'grayscale');
    expect(mockCtx.putImageData).toHaveBeenCalled();
  });

  it('renders processed image with rotation and crop bounds', () => {
    const img = new Image();
    Object.defineProperty(img, 'width', { value: 200, configurable: true });
    Object.defineProperty(img, 'height', { value: 100, configurable: true });

    const canvas = renderProcessedImage(img, {
      rotation: 90,
      crop: { x: 10, y: 10, width: 80, height: 80 },
      filter: 'enhanced',
      adjustments: { brightness: 10, contrast: 5 },
    });

    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBeGreaterThan(0);
  });
});
