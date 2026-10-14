import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { CameraCaptureModal } from '../components/camera/CameraCaptureModal';

// Enable act environment for React 19
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('CameraCaptureModal Lifecycle & Error Handling', () => {
  let mockTrack: { stop: ReturnType<typeof vi.fn> };
  let mockStream: {
    getTracks: ReturnType<typeof vi.fn>;
  };
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    mockTrack = { stop: vi.fn() };
    mockStream = {
      getTracks: vi.fn().mockReturnValue([mockTrack]),
    };

    // Ensure isSecureContext
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    // Mock HTMLMediaElement play
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

    // Mock navigator.mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
        enumerateDevices: vi.fn().mockResolvedValue([
          { kind: 'videoinput', deviceId: 'cam1' },
          { kind: 'videoinput', deviceId: 'cam2' },
        ]),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('initializes camera stream and transitions to ready when metadata loads', async () => {
    const onCapturePhotos = vi.fn();
    const onClose = vi.fn();

    await act(async () => {
      root.render(
        React.createElement(CameraCaptureModal, {
          isOpen: true,
          onClose,
          onCapturePhotos,
        })
      );
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();

    const video = container.querySelector('video');
    expect(video).not.toBeNull();

    if (video) {
      Object.defineProperty(video, 'videoWidth', { value: 1280, configurable: true });
      Object.defineProperty(video, 'videoHeight', { value: 720, configurable: true });

      await act(async () => {
        if (video.onloadedmetadata) {
          (video.onloadedmetadata as (e: Event) => void)(new Event('loadedmetadata'));
        }
      });
    }

    expect(container.textContent).toContain('Live');
  });

  it('handles NotAllowedError cleanly with actionable permission guide and retry action', async () => {
    const permError = new Error('Permission denied by system');
    permError.name = 'NotAllowedError';

    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValue(permError);

    await act(async () => {
      root.render(
        React.createElement(CameraCaptureModal, {
          isOpen: true,
          onClose: vi.fn(),
          onCapturePhotos: vi.fn(),
        })
      );
    });

    expect(container.textContent).toContain('Camera Access Blocked');
    expect(container.textContent).toContain('Retry Camera');
    expect(container.textContent).toContain('Open System Camera');
  });

  it('handles NotReadableError when camera is in use by another application', async () => {
    const inUseError = new Error('Could not start video source');
    inUseError.name = 'NotReadableError';

    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValue(inUseError);

    await act(async () => {
      root.render(
        React.createElement(CameraCaptureModal, {
          isOpen: true,
          onClose: vi.fn(),
          onCapturePhotos: vi.fn(),
        })
      );
    });

    expect(container.textContent).toContain('Camera Currently In Use');
  });

  it('stops media stream tracks when closing the modal', async () => {
    const onClose = vi.fn();

    await act(async () => {
      root.render(
        React.createElement(CameraCaptureModal, {
          isOpen: true,
          onClose,
          onCapturePhotos: vi.fn(),
        })
      );
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();

    // Close modal
    await act(async () => {
      root.render(
        React.createElement(CameraCaptureModal, {
          isOpen: false,
          onClose,
          onCapturePhotos: vi.fn(),
        })
      );
    });

    expect(mockTrack.stop).toHaveBeenCalled();
  });
});
