import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, Trash2, AlertCircle, FlipHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapturePhotos: (files: File[]) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapturePhotos,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<{ id: string; url: string; file: File }[]>([]);
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Stop camera tracks
  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleClose = useCallback(() => {
    stopCameraStream();
    setCapturedPhotos(prev => {
      prev.forEach(p => URL.revokeObjectURL(p.url));
      return [];
    });
    setCameraError(null);
    onClose();
  }, [onClose, stopCameraStream]);

  // Handle camera stream setup when modal is open
  useEffect(() => {
    if (!isOpen) return;

    let canceled = false;

    const initCamera = async () => {
      setIsStartingCamera(true);
      setCameraError(null);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported by your browser.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (canceled) {
          mediaStream.getTracks().forEach(t => t.stop());
          return;
        }

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: unknown) {
        if (canceled) return;
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to access camera. Please allow camera permissions or use the system camera.';
        setCameraError(msg);
      } finally {
        if (!canceled) {
          setIsStartingCamera(false);
        }
      }
    };

    initCamera();

    return () => {
      canceled = true;
      stopCameraStream();
    };
  }, [isOpen, facingMode, retryTrigger, stopCameraStream]);

  // Attach stream to video when videoRef becomes ready
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Capture current frame from live video
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Trigger visual shutter flash
    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;
      const count = capturedPhotos.length + 1;
      const filename = `scan-${new Date().toISOString().slice(0, 10)}-${count}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setCapturedPhotos(prev => [...prev, { id: `${Date.now()}-${count}`, url, file }]);
    }, 'image/jpeg', 0.95);
  };

  // Flip front / rear camera
  const handleToggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Delete a captured photo
  const handleRemovePhoto = (id: string) => {
    setCapturedPhotos(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter(p => p.id !== id);
    });
  };

  // Native camera fallback file input change
  const handleNativeCameraInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newItems = files.map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        url: URL.createObjectURL(file),
        file,
      }));
      setCapturedPhotos(prev => [...prev, ...newItems]);
    }
    e.target.value = '';
  };

  // Done button: add photos to collection
  const handleFinish = () => {
    if (capturedPhotos.length > 0) {
      onCapturePhotos(capturedPhotos.map(p => p.file));
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5 text-brand-400" />
            <h2 id="camera-modal-title" className="text-sm sm:text-base font-bold">
              Document Camera Scanner
            </h2>
            {capturedPhotos.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-600/30 border border-brand-500/40 text-brand-300 text-xs font-semibold">
                {capturedPhotos.length} {capturedPhotos.length === 1 ? 'photo' : 'photos'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFacingMode}
              title="Flip camera"
              aria-label="Flip camera"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <FlipHorizontal className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              title="Close scanner"
              aria-label="Close scanner"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex-1 bg-black min-h-[300px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {/* Shutter visual flash effect */}
          {isShutterActive && (
            <div className="absolute inset-0 bg-white/70 z-30 pointer-events-none transition-opacity duration-150" />
          )}

          {/* Camera live feed */}
          {stream && !cameraError && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full max-h-[500px] object-contain"
            />
          )}

          {/* Document Alignment Framing Guide */}
          {stream && !cameraError && (
            <div className="absolute inset-6 sm:inset-12 pointer-events-none border-2 border-white/40 border-dashed rounded-xl flex flex-col justify-between p-3">
              <div className="flex justify-between text-white/50 text-[10px] uppercase font-mono tracking-wider">
                <span>Align document corners</span>
                <span>Auto-focus</span>
              </div>
              <div className="text-center text-white/60 text-xs font-medium bg-black/40 py-1 px-3 rounded-full mx-auto backdrop-blur-xs">
                Hold phone steady over paper
              </div>
            </div>
          )}

          {/* Loading state */}
          {isStartingCamera && (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-400" />
              <p className="text-xs">Starting camera...</p>
            </div>
          )}

          {/* Error / Fallback state */}
          {cameraError && (
            <div className="max-w-md p-6 text-center text-slate-300 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Camera Access Issue</h3>
                <p className="text-xs text-slate-400">{cameraError}</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="sm"
                  onClick={() => setRetryTrigger(prev => prev + 1)}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Retry Camera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  leftIcon={<Camera className="w-4 h-4" />}
                  className="border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  Open System Camera
                </Button>
              </div>
            </div>
          )}

          {/* Hidden native camera input fallback */}
          <input
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleNativeCameraInput}
            className="hidden"
          />
        </div>

        {/* Captured Photos Tray (Multi-Photo Session) */}
        {capturedPhotos.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-3 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 shrink-0">
              Tray ({capturedPhotos.length}):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {capturedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative group shrink-0 w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shadow-sm"
                >
                  <img
                    src={photo.url}
                    alt={`Scan ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 left-0.5 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-rose-600/80 text-white opacity-90 hover:opacity-100 hover:bg-rose-600 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="p-4 bg-slate-950 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Use System Camera</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            {/* Shutter Capture Button */}
            {stream && !cameraError && (
              <button
                type="button"
                onClick={handleSnap}
                aria-label="Take photo"
                className="w-14 h-14 rounded-full border-4 border-white/80 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white flex items-center justify-center shadow-lg transition"
              >
                <div className="w-8 h-8 rounded-full bg-white/20" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleFinish}
              disabled={capturedPhotos.length === 0}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Add {capturedPhotos.length} {capturedPhotos.length === 1 ? 'Photo' : 'Photos'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
