import React, { useRef, useState, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  FlipHorizontal, 
  Zap, 
  ZapOff, 
  Upload, 
  Copy, 
  Check, 
  ExternalLink, 
  Wifi, 
  User, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  Download, 
  RefreshCw, 
  History, 
  FileSpreadsheet,
  Coins,
  Volume2,
  VolumeX,
  Vibrate,
  Sliders,
  Sparkles,
  QrCode,
  Trash2,
  Search,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { parseQRPayload, downloadVCard, type ParsedPayload } from '../../utils/payloadParser';
import { playScanChime, playTactileClick } from '../../utils/audioFeedback';
import { QRType } from '../../types';

interface ScanHistoryEntry {
  id: string;
  raw: string;
  type: string;
  timestamp: string;
  date: string;
}

interface QRScannerProps {
  onLoadToGenerator?: (payload: string, type?: QRType) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onLoadToGenerator }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [scanResult, setScanResult] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedPayload | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Scanning Modes: 'single' (stops on first capture) vs 'batch' (continuous logging)
  const [scanMode, setScanMode] = useState<'single' | 'batch'>('single');
  const [batchCount, setBatchCount] = useState<number>(0);
  const lastScannedPayloadRef = useRef<{ payload: string; time: number } | null>(null);

  // Audio & Haptic settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);

  // Camera settings
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorchCapability, setHasTorchCapability] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [zoomCapability, setZoomCapability] = useState<{ min: number; max: number; step: number } | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  // Drag & Drop / Paste state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // History & Filtering
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState<string>('');

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('strix_scan_history_v2');
      if (saved) {
        setScanHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (items: ScanHistoryEntry[]) => {
    setScanHistory(items);
    try {
      localStorage.setItem('strix_scan_history_v2', JSON.stringify(items));
    } catch {
      // Ignore
    }
  };

  // Enumerate cameras
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0 && !selectedCameraId) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
      }).catch(() => {});
    }
  }, [selectedCameraId]);

  // Audio and Haptic trigger
  const triggerScanAlert = useCallback(() => {
    if (soundEnabled) {
      playScanChime();
    }
    if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([45, 30, 45]);
      } catch {
        // Ignored
      }
    }
  }, [soundEnabled, hapticEnabled]);

  // Handle successful code capture
  const handleScanSuccess = useCallback((data: string) => {
    if (!data || typeof data !== 'string') return;

    // Rate-limiting consecutive identical frames in batch mode
    const now = Date.now();
    if (scanMode === 'batch') {
      if (
        lastScannedPayloadRef.current &&
        lastScannedPayloadRef.current.payload === data &&
        now - lastScannedPayloadRef.current.time < 1800
      ) {
        return; // Ignore repeated scan of same code within 1.8 seconds in batch mode
      }
    } else {
      if (isPaused) return;
    }

    lastScannedPayloadRef.current = { payload: data, time: now };
    triggerScanAlert();

    const parsed = parseQRPayload(data);
    setScanResult(data);
    setParsedData(parsed);

    // If single mode, pause viewfinder to examine payload
    if (scanMode === 'single') {
      setIsPaused(true);
    } else {
      setBatchCount((c) => c + 1);
    }

    // Save to session & persistent history
    const newEntry: ScanHistoryEntry = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      raw: data,
      type: parsed.type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString(),
    };

    setScanHistory((prev) => {
      const updated = [newEntry, ...prev.slice(0, 49)]; // Store up to 50 items
      try {
        localStorage.setItem('strix_scan_history_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [isPaused, scanMode, triggerScanAlert]);

  // Optical frame decoding loop with Hardware Accelerated BarcodeDetector + jsQR fallback
  useEffect(() => {
    let animationFrameId: number;

    // Check for native BarcodeDetector
    const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    const barcodeDetector = hasBarcodeDetector
      ? new (window as any).BarcodeDetector({ formats: ['qr_code'] })
      : null;

    const tick = async () => {
      if (!isPaused && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;

        // 1. Try Hardware-Accelerated BarcodeDetector API
        if (barcodeDetector) {
          try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              handleScanSuccess(barcodes[0].rawValue);
              if (cameraActive && (!isPaused || scanMode === 'batch')) {
                animationFrameId = requestAnimationFrame(tick);
              }
              return;
            }
          } catch {
            // Fall back to jsQR
          }
        }

        // 2. Fallback: jsQR via HTML5 Offscreen Canvas
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (code && code.data) {
              handleScanSuccess(code.data);
            }
          }
        }
      }

      if (cameraActive && (!isPaused || scanMode === 'batch')) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (cameraActive && (!isPaused || scanMode === 'batch')) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive, isPaused, scanMode, handleScanSuccess]);

  // Decode from image file / blob
  const decodeImageBlob = (blob: Blob) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // 1. Try BarcodeDetector
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await detector.detect(img);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              handleScanSuccess(barcodes[0].rawValue);
              return;
            }
          } catch {}
        }

        // 2. jsQR
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data) {
            handleScanSuccess(code.data);
          } else {
            setErrorMsg('No QR code detected in the provided image. Ensure the image is crisp and well-lit.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(blob);
  };

  // Clipboard Paste (Ctrl+V) listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setErrorMsg(null);
            decodeImageBlob(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Camera stream starter
  const startCamera = async () => {
    setErrorMsg(null);
    setScanResult(null);
    setParsedData(null);
    setIsPaused(false);
    setIsTorchOn(false);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          ...(selectedCameraId
            ? { deviceId: { exact: selectedCameraId } }
            : { facingMode: { ideal: facingMode } }),
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);

        const track = stream.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          const caps = track.getCapabilities() as any;
          setHasTorchCapability(Boolean(caps.torch));

          // Check zoom
          if (caps.zoom) {
            setZoomCapability({
              min: caps.zoom.min || 1,
              max: caps.zoom.max || 5,
              step: caps.zoom.step || 0.1,
            });
            setZoomLevel(caps.zoom.min || 1);
          } else {
            setZoomCapability(null);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser address bar.'
          : 'Unable to access camera device. Please verify your camera is connected and not in use by another app.'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsPaused(false);
    setIsTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
    } catch {
      setErrorMsg('Flashlight could not be toggled on this camera hardware.');
    }
  };

  const handleZoomChange = async (newZoom: number) => {
    setZoomLevel(newZoom);
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    try {
      await (track as any).applyConstraints({
        advanced: [{ zoom: newZoom }],
      });
    } catch {}
  };

  const flipCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    decodeImageBlob(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setErrorMsg(null);
      decodeImageBlob(file);
    }
  };

  const handleCopy = (text: string) => {
    playTactileClick();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resumeScanning = () => {
    playTactileClick();
    setIsPaused(false);
    setScanResult(null);
    setParsedData(null);
  };

  // Transfer scanned payload to Generator Studio
  const handleSendToGenerator = () => {
    if (!scanResult) return;
    playTactileClick();
    let qrType: QRType = 'url';
    if (parsedData?.type === 'wifi') qrType = 'wifi';
    else if (parsedData?.type === 'vcard') qrType = 'vcard';
    else if (parsedData?.type === 'whatsapp') qrType = 'whatsapp';
    else if (parsedData?.type === 'email') qrType = 'email';
    else if (parsedData?.type === 'crypto') qrType = 'crypto';
    else if (parsedData?.type === 'text') qrType = 'text';

    if (onLoadToGenerator) {
      onLoadToGenerator(scanResult, qrType);
    }
  };

  // CSV Export
  const exportHistoryToCSV = () => {
    if (scanHistory.length === 0) return;
    const headers = 'ID,Type,Date,Timestamp,Payload\n';
    const rows = scanHistory
      .map((entry) => `"${entry.id}","${entry.type}","${entry.date}","${entry.timestamp}","${entry.raw.replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strix-qr-scans-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check if payload is a Strix Dynamic QR Code
  const isStrixDynamic = scanResult && (
    scanResult.includes('/r/') ||
    scanResult.includes('qr.strixdevs.com/r/') ||
    scanResult.startsWith('/r/')
  );

  // Filter history
  const filteredHistory = scanHistory.filter((item) => {
    const matchesFilter = historyFilter === 'all' || item.type === historyFilter;
    const matchesSearch = !historySearch || item.raw.toLowerCase().includes(historySearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* 1. Main Scanner Studio Capsule */}
      <div className="p-4 sm:p-8 rounded-3xl bg-zinc-900/90 border border-white/[0.08] shadow-2xl backdrop-blur-2xl relative space-y-5 sm:space-y-6">
        
        {/* Subtle luminous accent glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        {/* Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser Optical Decoder
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Optical QR & 2D Matrix Scanner
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Real-time hardware-accelerated decoding. Zero cloud frames transmitted.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
            {/* Mode Toggle: Single vs Continuous Batch */}
            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-950 border border-white/[0.08] shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setScanMode('single');
                  setBatchCount(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none ${
                  scanMode === 'single'
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Single Scan
              </button>
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setScanMode('batch');
                  setBatchCount(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 select-none ${
                  scanMode === 'batch'
                    ? 'bg-[#38bdf8] text-[#09090b] shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Batch Mode</span>
                {batchCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-400/30 text-cyan-100 text-[10px] font-bold">
                    {batchCount}
                  </span>
                )}
              </button>
            </div>

            {/* History Toggle Button */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowHistory(!showHistory);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap select-none ${
                showHistory
                  ? 'bg-zinc-800 border-white/[0.2] text-white shadow-sm'
                  : 'bg-zinc-950 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>History</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                {scanHistory.length}
              </span>
            </button>
          </div>
        </div>

        {/* 2. Interactive Camera Viewport with Cyberpunk HUD */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative min-h-[260px] sm:min-h-[340px] aspect-[4/3] sm:aspect-video rounded-2xl bg-zinc-950 border overflow-hidden flex items-center justify-center transition-all ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-400/40'
              : 'border-white/[0.08]'
          }`}
        >
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Active Camera Viewfinder Overlay */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              
              {/* Precision Targeting Reticle */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64">
                {/* Luminous Reticle Brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg shadow-[0_0_12px_rgba(34,211,238,0.5)]" />

                {/* Corner Targeting Crosshairs */}
                <div className="absolute top-1/2 left-2 w-2 h-[1px] bg-cyan-400/60" />
                <div className="absolute top-1/2 right-2 w-2 h-[1px] bg-cyan-400/60" />
                <div className="absolute top-2 left-1/2 h-2 w-[1px] bg-cyan-400/60" />
                <div className="absolute bottom-2 left-1/2 h-2 w-[1px] bg-cyan-400/60" />

                {/* Animated Laser Scanning Beam (Only when scanning) */}
                {!isPaused && (
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_#38bdf8] animate-laser pointer-events-none" />
                )}

                {/* Captured State Backdrop */}
                {isPaused && scanMode === 'single' && (
                  <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                    <span className="px-3.5 py-1.5 bg-zinc-900/90 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-full shadow-xl flex items-center gap-1.5 animate-pop-in">
                      <Check className="w-4 h-4 text-cyan-400" /> Target Captured
                    </span>
                  </div>
                )}
              </div>

              {/* Status Pill Footer */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-zinc-900/85 backdrop-blur-md border border-white/[0.1] text-[11px] text-zinc-300 flex items-center gap-2 shadow-lg">
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                <span>
                  {isPaused
                    ? 'Scanning paused'
                    : scanMode === 'batch'
                    ? `Continuous Batch: ${batchCount} scanned`
                    : 'Position QR code within targeting brackets'}
                </span>
              </div>
            </div>
          )}

          {/* Quick HUD Tool Controls (When camera is live) */}
          {cameraActive && (
            <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto">
              {hasTorchCapability && (
                <button
                  onClick={toggleTorch}
                  className={`p-2 rounded-xl border backdrop-blur-md text-xs transition cursor-pointer ${
                    isTorchOn
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/20'
                      : 'bg-zinc-900/80 border-white/[0.1] text-zinc-300 hover:text-white'
                  }`}
                  title="Toggle Flashlight / Torch"
                >
                  {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                </button>
              )}

              <button
                onClick={flipCamera}
                className="p-2 rounded-xl bg-zinc-900/80 border border-white/[0.1] text-zinc-300 hover:text-white backdrop-blur-md text-xs transition cursor-pointer"
                title="Flip Camera (Front / Rear)"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border backdrop-blur-md text-xs transition cursor-pointer ${
                  soundEnabled
                    ? 'bg-zinc-900/80 border-white/[0.1] text-zinc-300 hover:text-white'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
                title={soundEnabled ? 'Mute Beep Sound' : 'Enable Beep Sound'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setHapticEnabled(!hapticEnabled)}
                className={`p-2 rounded-xl border backdrop-blur-md text-xs transition cursor-pointer ${
                  hapticEnabled
                    ? 'bg-zinc-900/80 border-white/[0.1] text-zinc-300 hover:text-white'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
                title={hapticEnabled ? 'Disable Vibration Haptics' : 'Enable Vibration Haptics'}
              >
                <Vibrate className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Zoom Slider Control (If supported) */}
          {cameraActive && zoomCapability && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/[0.1] text-xs pointer-events-auto">
              <span className="text-[10px] text-zinc-400 font-mono">1x</span>
              <input
                type="range"
                min={zoomCapability.min}
                max={zoomCapability.max}
                step={zoomCapability.step}
                value={zoomLevel}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-cyan-400 font-mono font-bold">
                {zoomLevel.toFixed(1)}x
              </span>
            </div>
          )}

          {/* Idle Camera Placeholder */}
          {!cameraActive && (
            <div
              onClick={startCamera}
              className="text-center p-5 sm:p-8 space-y-3 sm:space-y-4 max-w-sm cursor-pointer group select-none transition-transform active:scale-[0.98]"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-200">
                <Camera className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Live Camera Paused
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Tap here or click <strong>Start Camera Feed</strong> below to begin. Drag-and-drop an image or paste with <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/[0.1] text-zinc-300 font-mono text-[10px]">Ctrl+V</kbd>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. Action Buttons & File Dropzone Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {cameraActive ? (
            <Button
              variant="danger"
              fullWidth
              onClick={stopCamera}
              className="cursor-pointer"
            >
              Stop Camera Feed
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              onClick={startCamera}
              className="cursor-pointer"
            >
              Start Camera Feed
            </Button>
          )}

          {/* Image Upload Input */}
          <label className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl border border-white/[0.1] hover:border-white/[0.2] bg-zinc-950 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 cursor-pointer flex items-center justify-center gap-2 transition active:scale-[0.98]">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Image File</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center animate-pop-in">
            {errorMsg}
          </div>
        )}
      </div>

      {/* 4. Smart Recognized Payload Action Card */}
      {scanResult && parsedData && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-cyan-500/40 shadow-2xl space-y-4 animate-fadeIn">
          
          {/* Card Action Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Recognized {parsedData.type.toUpperCase()} Payload
              </span>
              {isStrixDynamic && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold tracking-tight">
                  Strix Dynamic QR
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Transfer to Generator Action */}
              <button
                onClick={handleSendToGenerator}
                className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="Transfer payload to Studio Generator to restyle and download vectors"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open in Studio</span>
              </button>

              {isPaused && (
                <button
                  onClick={resumeScanning}
                  className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Next Code</span>
                </button>
              )}
            </div>
          </div>

          {/* PAYLOAD TYPE 1: URL with Anti-Quishing Phishing Defense */}
          {parsedData.type === 'url' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">{parsedData.protocol}</span>
                    <h4 className="text-sm sm:text-base font-bold text-white truncate">{parsedData.hostname}</h4>
                  </div>
                  <p className="text-xs font-mono text-zinc-300 break-all mt-1.5 bg-zinc-900/80 p-2.5 rounded-xl border border-white/[0.06]">
                    {parsedData.url}
                  </p>
                </div>

                {/* Safety Badge */}
                {parsedData.safety.level === 'safe' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Clean URL
                  </span>
                )}
                {parsedData.safety.level === 'caution' && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shrink-0 flex items-center gap-1.5">
                    <ShieldQuestion className="w-4 h-4" />
                    Caution
                  </span>
                )}
                {parsedData.safety.level === 'warning' && (
                  <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold shrink-0 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Suspicious
                  </span>
                )}
              </div>

              {/* Safety Advisory Reasons */}
              {parsedData.safety.reasons.length > 0 && (
                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/[0.08] space-y-1.5">
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">
                    Anti-Quishing Security Analysis:
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                    {parsedData.safety.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <Button
                  variant="secondary"
                  onClick={() => handleCopy(parsedData.url)}
                  className="w-full sm:flex-1 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  Copy URL
                </Button>
                <a
                  href={parsedData.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Proceed to Site
                </a>
              </div>
            </div>
          )}

          {/* PAYLOAD TYPE 2: Wi-Fi Auto Connect */}
          {parsedData.type === 'wifi' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">{parsedData.ssid}</h4>
                  <p className="text-xs text-zinc-400">
                    Security: {parsedData.encryption} {parsedData.hidden && '(Hidden Network)'}
                  </p>
                </div>
              </div>

              {parsedData.password && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/[0.08]">
                  <div className="text-xs font-mono text-zinc-300">
                    <span className="text-zinc-500 mr-2">Network Key:</span>
                    {showPassword ? parsedData.password : '••••••••••••'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      {showPassword ? 'Hide' : 'Reveal'}
                    </button>
                    <button
                      onClick={() => handleCopy(parsedData.password || '')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAYLOAD TYPE 3: vCard Digital Business Card */}
          {parsedData.type === 'vcard' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">{parsedData.name}</h4>
                  <p className="text-xs text-zinc-400">
                    {parsedData.title} {parsedData.company && `at ${parsedData.company}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {parsedData.phone && (
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] flex items-center justify-between">
                    <span className="text-zinc-400">Phone: {parsedData.phone}</span>
                    <a href={`tel:${parsedData.phone}`} className="text-cyan-400 hover:text-cyan-300 font-semibold">
                      Call ↗
                    </a>
                  </div>
                )}
                {parsedData.email && (
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] flex items-center justify-between">
                    <span className="text-zinc-400 truncate mr-2">{parsedData.email}</span>
                    <a href={`mailto:${parsedData.email}`} className="text-cyan-400 hover:text-cyan-300 font-semibold shrink-0">
                      Email ↗
                    </a>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={() => downloadVCard(parsedData.raw, `${parsedData.name.replace(/\s+/g, '_')}.vcf`)}
                className="cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                Save to Phone Contacts (.vcf)
              </Button>
            </div>
          )}

          {/* PAYLOAD TYPE 4: WhatsApp Direct Message */}
          {parsedData.type === 'whatsapp' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">WhatsApp Direct Chat</h4>
                  <p className="text-xs text-zinc-400">Recipient: +{parsedData.phone}</p>
                </div>
              </div>
              {parsedData.message && (
                <p className="text-xs text-zinc-300 italic bg-zinc-900 p-3 rounded-xl border border-white/[0.08]">
                  &ldquo;{parsedData.message}&rdquo;
                </p>
              )}
              <a
                href={scanResult}
                target="_blank"
                rel="noreferrer"
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                Launch WhatsApp Chat
              </a>
            </div>
          )}

          {/* PAYLOAD TYPE 5: Email Compose */}
          {parsedData.type === 'email' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">Email Pre-fill</h4>
                  <p className="text-xs text-zinc-400">{parsedData.email}</p>
                </div>
              </div>
              {parsedData.subject && (
                <div className="text-xs text-zinc-300 bg-zinc-900 p-2.5 rounded-xl border border-white/[0.08]">
                  <span className="text-zinc-500 mr-2">Subject:</span>
                  {parsedData.subject}
                </div>
              )}
              <a
                href={scanResult}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]"
              >
                <Mail className="w-4 h-4" />
                Compose in Mail Client
              </a>
            </div>
          )}

          {/* PAYLOAD TYPE 6: Crypto Wallet Address */}
          {parsedData.type === 'crypto' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">{parsedData.currency} Wallet Address</h4>
                  {parsedData.amount && <p className="text-xs text-zinc-400">Amount: {parsedData.amount} {parsedData.currency}</p>}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.08] font-mono text-xs text-zinc-300 break-all">
                {parsedData.address}
              </div>
              <Button variant="primary" fullWidth onClick={() => handleCopy(parsedData.address)} className="cursor-pointer">
                {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1.5" />}
                Copy Wallet Address
              </Button>
            </div>
          )}

          {/* PAYLOAD TYPE 7: Raw Text */}
          {parsedData.type === 'text' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">Raw Text Data</span>
                <button
                  onClick={() => handleCopy(parsedData.text)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              </div>
              <pre className="text-xs font-mono text-zinc-200 whitespace-pre-wrap break-all bg-zinc-900 p-3 rounded-xl border border-white/[0.08]">
                {parsedData.text}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 5. Persistent Scan History Drawer */}
      {showHistory && (
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/[0.08] shadow-2xl backdrop-blur-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              Scan History Vault ({scanHistory.length})
            </h3>

            {scanHistory.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={exportHistoryToCSV}
                  className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    playTactileClick();
                    saveHistory([]);
                  }}
                  className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* History Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <div className="relative w-full sm:flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scanned payloads..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              {['all', 'url', 'wifi', 'vcard', 'text'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setHistoryFilter(filterType)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition cursor-pointer ${
                    historyFilter === filterType
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>
          </div>

          {/* History Entries List */}
          {filteredHistory.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              No matching QR codes found in history.
            </p>
          ) : (
            <div className="divide-y divide-white/[0.06] max-h-72 overflow-y-auto pr-1">
              {filteredHistory.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-cyan-400 border border-white/[0.06]">
                        {item.type}
                      </span>
                      <span className="text-[11px] text-zinc-500">{item.timestamp}</span>
                      <span className="text-[10px] text-zinc-600">• {item.date}</span>
                    </div>
                    <p className="text-xs font-mono text-zinc-300 truncate mt-1">
                      {item.raw}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        handleCopy(item.raw);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                      title="Copy payload"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {onLoadToGenerator && (
                      <button
                        onClick={() => {
                          playTactileClick();
                          onLoadToGenerator(item.raw, item.type as QRType);
                        }}
                        className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                        title="Load into Studio Generator"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
