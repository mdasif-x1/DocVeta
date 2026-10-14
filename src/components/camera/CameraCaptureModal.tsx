import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  X,
  Check,
  Trash2,
  AlertCircle,
  FlipHorizontal,
  Upload,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapturePhotos: (files: File[]) => void;
}

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'capturing' | 'error';

export type CameraErrorType =
  | 'permission-denied'
  | 'not-found'
  | 'in-use'
  | 'insecure-context'
  | 'unsupported'
  | 'unknown';

interface CameraErrorInfo {
  type: CameraErrorType;
  title: string;
  message: string;
  instructions?: string[];
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapturePhotos,
}) => {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [errorInfo, setErrorInfo] = useState<CameraErrorInfo | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [retryCount, setRetryCount] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<{ id: string; url: string; file: File }[]>([]);
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [availableCamerasCount, setAvailableCamerasCount] = useState<number>(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<number>(0);

  // Stop camera tracks cleanly
  const stopCurrentStream = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }
  }, []);

  // Close modal and release all resources
  const handleClose = useCallback(() => {
    sessionIdRef.current += 1;
    stopCurrentStream();
    setCameraStatus('idle');
    setErrorInfo(null);
    setCapturedPhotos(prev => {
      prev.forEach(p => URL.revokeObjectURL(p.url));
      return [];
    });
    onClose();
  }, [onClose, stopCurrentStream]);

  // Enumerate cameras to know if flipping is possible
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(devices => {
          const videoInputs = devices.filter(d => d.kind === 'videoinput');
          setAvailableCamerasCount(videoInputs.length);
        })
        .catch(() => {
          setAvailableCamerasCount(1);
        });
    }
  }, [isOpen]);

  // Acquire camera stream with resilient fallback constraints
  useEffect(() => {
    if (!isOpen) {
      stopCurrentStream();
      return;
    }

    const currentSessionId = ++sessionIdRef.current;
    let canceled = false;

    const startCameraSession = async () => {
      // 1. Check for secure context and mediaDevices support
      if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
        setCameraStatus('error');
        setErrorInfo({
          type: 'insecure-context',
          title: 'Secure Connection Required',
          message: 'Browsers restrict camera access to HTTPS connections or localhost.',
          instructions: [
            'Ensure you are accessing DocVeta over https://',
            'Or use the System Camera button below to capture photos directly with your device.',
          ],
        });
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('error');
        setErrorInfo({
          type: 'unsupported',
          title: 'Camera Access Not Supported',
          message: 'Your current browser does not support the live camera streaming API.',
          instructions: [
            'Try updating your browser or opening DocVeta in Safari (iOS) or Chrome (Android).',
            'You can still use the System Camera button below to take document photos.',
          ],
        });
        return;
      }

      setCameraStatus('requesting');
      setErrorInfo(null);

      // Clean up any existing stream before requesting a new one
      stopCurrentStream();

      // Constraint tier 1: High definition document constraints
      const tier1Constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      // Constraint tier 2: Basic facing mode constraints
      const tier2Constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
        },
        audio: false,
      };

      // Constraint tier 3: Bare minimum video constraints
      const tier3Constraints: MediaStreamConstraints = {
        video: true,
        audio: false,
      };

      let stream: MediaStream | null = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia(tier1Constraints);
      } catch {
        if (canceled || currentSessionId !== sessionIdRef.current) return;

        // If overconstrained or failed, try tier 2
        try {
          stream = await navigator.mediaDevices.getUserMedia(tier2Constraints);
        } catch {
          if (canceled || currentSessionId !== sessionIdRef.current) return;

          // If still failing, try tier 3
          try {
            stream = await navigator.mediaDevices.getUserMedia(tier3Constraints);
          } catch (finalErr: unknown) {
            if (canceled || currentSessionId !== sessionIdRef.current) return;

            // Analyze error for helpful user feedback
            const errName = (finalErr as { name?: string })?.name || '';
            const errMsg = (finalErr as Error)?.message || '';

            if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
              setCameraStatus('error');
              setErrorInfo({
                type: 'permission-denied',
                title: 'Camera Access Blocked',
                message: 'DocVeta was denied permission to access your camera.',
                instructions: [
                  'iPhone / iPad (Safari): Tap "aA" or the lock in the address bar → Website Settings → Camera → set to "Allow".',
                  'Android (Chrome): Tap the lock/info icon beside the address bar → Permissions → Camera → set to "Allow".',
                  'Desktop: Click the camera icon in your browser URL bar to grant permission.',
                ],
              });
            } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
              setCameraStatus('error');
              setErrorInfo({
                type: 'not-found',
                title: 'No Camera Detected',
                message: 'No working camera hardware was found on this device.',
                instructions: [
                  'Check if your webcam is connected and enabled.',
                  'You can take photos using your device camera app via the button below.',
                ],
              });
            } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
              setCameraStatus('error');
              setErrorInfo({
                type: 'in-use',
                title: 'Camera Currently In Use',
                message: 'Another application or browser tab is already using your camera.',
                instructions: [
                  'Close any open video call, camera app, or other browser tabs.',
                  'Click "Retry Camera" once other apps are closed.',
                ],
              });
            } else {
              setCameraStatus('error');
              setErrorInfo({
                type: 'unknown',
                title: 'Camera Initialization Issue',
                message: errMsg || 'Unable to start camera video stream.',
                instructions: [
                  'Try reloading the page or clicking "Retry Camera".',
                  'You can also use "Use System Camera" to capture photos directly.',
                ],
              });
            }
            return;
          }
        }
      }

      if (canceled || currentSessionId !== sessionIdRef.current) {
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }
        return;
      }

      activeStreamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;

        try {
          await video.play();
        } catch (playErr) {
          console.warn('Video play deferred or rejected:', playErr);
        }

        const markReady = () => {
          if (currentSessionId === sessionIdRef.current) {
            setCameraStatus('ready');
          }
        };

        // Wait for video to have valid dimensions and frames
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          markReady();
        } else {
          video.onloadedmetadata = markReady;
          video.oncanplay = markReady;
        }
      }
    };

    startCameraSession();

    return () => {
      canceled = true;
      stopCurrentStream();
    };
  }, [isOpen, facingMode, retryCount, stopCurrentStream]);

  // Shutter action
  const handleSnap = () => {
    if (!videoRef.current || cameraStatus !== 'ready') return;
    const video = videoRef.current;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w === 0 || h === 0) return;

    // Visual shutter flash & haptic feedback
    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 180);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(40);
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      blob => {
        if (!blob) return;
        const count = capturedPhotos.length + 1;
        const filename = `document-scan-${count}-${Date.now().toString().slice(-4)}.jpg`;
        const file = new File([blob], filename, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setCapturedPhotos(prev => [...prev, { id: `${Date.now()}-${count}`, url, file }]);
      },
      'image/jpeg',
      0.95
    );
  };

  // Flip front / rear camera
  const handleToggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Remove a photo from active tray
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

  // Submit photos to collection
  const handleFinish = () => {
    if (capturedPhotos.length > 0) {
      onCapturePhotos(capturedPhotos.map(p => p.file));
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-[#0b0f19] border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Sleek Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0e1422] border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="camera-modal-title" className="text-sm font-semibold text-white tracking-tight">
                  Document Camera Scanner
                </h2>
                {cameraStatus === 'ready' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Processed privately on your device. Never uploaded to a cloud.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Flip camera button (visible if device has multiple cameras or environment mode) */}
            {availableCamerasCount > 1 && cameraStatus === 'ready' && (
              <button
                type="button"
                onClick={handleToggleFacingMode}
                title={`Switch to ${facingMode === 'environment' ? 'front' : 'rear'} camera`}
                aria-label="Flip camera"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              title="Close camera"
              aria-label="Close camera"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Window */}
        <div className="relative flex-1 bg-black min-h-[320px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
          {/* Shutter visual flash animation */}
          {isShutterActive && (
            <div className="absolute inset-0 bg-white/80 z-30 pointer-events-none transition-opacity duration-150" />
          )}

          {/* Persistent Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full max-h-[520px] object-contain transition-opacity duration-300 ${
              cameraStatus === 'ready' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Optical Document Framing Guide (Visible when camera is ready) */}
          {cameraStatus === 'ready' && (
            <div className="absolute inset-6 sm:inset-12 pointer-events-none border border-white/30 border-dashed rounded-xl flex flex-col justify-between p-3.5 z-10">
              <div className="flex justify-between items-center text-white/60 text-[10px] font-mono tracking-wider uppercase">
                <span className="bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">Auto-Framing</span>
                <span className="bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                  {facingMode === 'environment' ? 'Rear Document Cam' : 'Front Cam'}
                </span>
              </div>
              <div className="text-center text-white/80 text-xs font-medium bg-black/60 py-1.5 px-4 rounded-full mx-auto backdrop-blur-md border border-white/10 shadow-lg">
                Position document inside the frame
              </div>
            </div>
          )}

          {/* State: Requesting / Initializing */}
          {cameraStatus === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b0f19] text-slate-300 z-20">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-white">Starting camera feed...</p>
                <p className="text-xs text-slate-400">Please allow browser permission if prompted</p>
              </div>
            </div>
          )}

          {/* State: Error / Fallback Card */}
          {cameraStatus === 'error' && errorInfo && (
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 bg-[#0b0f19] z-20">
              <div className="max-w-md w-full bg-[#111827] border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  {errorInfo.type === 'permission-denied' ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-1">{errorInfo.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{errorInfo.message}</p>
                </div>

                {errorInfo.instructions && errorInfo.instructions.length > 0 && (
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 text-left text-xs text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider mb-1">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      <span>How to resolve</span>
                    </div>
                    {errorInfo.instructions.map((inst, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                        <span className="text-blue-400 font-bold shrink-0">•</span>
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Button
                    size="sm"
                    onClick={() => setRetryCount(c => c + 1)}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    Retry Camera
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    leftIcon={<Camera className="w-4 h-4" />}
                    className="w-full sm:w-auto border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    Open System Camera
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden native camera capture input for reliable mobile fallback */}
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

        {/* Captured Photos Tray */}
        {capturedPhotos.length > 0 && (
          <div className="px-5 py-2.5 bg-[#0a0d16] border-t border-slate-800/80 flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-slate-400">
              <span>Scanned Pages</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">
                {capturedPhotos.length}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {capturedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative group shrink-0 w-12 h-14 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shadow-md"
                >
                  <img src={photo.url} alt={`Scan ${index + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0.5 left-0.5 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-rose-600/90 text-white opacity-90 hover:opacity-100 hover:bg-rose-600 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shutter Bar & Action Footer */}
        <div className="px-5 py-4 bg-[#0e1422] flex items-center justify-between border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition py-1 px-2 rounded-lg hover:bg-slate-800/50"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Use System Camera / Photos</span>
            </button>
          </div>

          {/* Shutter Capture Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSnap}
              disabled={cameraStatus !== 'ready'}
              aria-label="Capture photo"
              title={cameraStatus === 'ready' ? 'Take document photo' : 'Waiting for camera...'}
              className="group relative w-16 h-16 rounded-full border-4 border-white/90 bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all shadow-xl"
            >
              <div className="w-11 h-11 rounded-full bg-white group-hover:scale-95 transition-transform shadow-inner" />
            </button>
          </div>

          {/* Done / Add to Document Action */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800/80"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleFinish}
              disabled={capturedPhotos.length === 0}
              leftIcon={<Check className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-md font-semibold"
            >
              Add {capturedPhotos.length > 0 ? `${capturedPhotos.length} ` : ''}
              {capturedPhotos.length === 1 ? 'Page' : 'Pages'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
