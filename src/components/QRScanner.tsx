import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, Upload, Copy, Check, ExternalLink, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

export const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : 'Unable to start camera. You can also upload a photo or screenshot of a QR code below.'
      );
      setIsScanning(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Frame processing loop with jsQR
  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            setScanResult(code.data);
            stopCamera();
            return;
          }
        }
      }
    }

    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle Image File Upload for Scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            setScanResult(code.data);
          } else {
            setErrorMessage('Could not find or decode a QR code in this image. Please try a clearer picture.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isUrl = scanResult?.startsWith('http://') || scanResult?.startsWith('https://');

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <Camera className="w-6 h-6 text-indigo-400" />
          <span>In-Browser QR Scanner</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Scan any QR code using your device camera or upload a picture. 100% private, client-side decoding.
        </p>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Camera Viewport */}
      <div className="relative aspect-video max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
        <video ref={videoRef} className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`} />
        <canvas ref={canvasRef} className="hidden" />

        {!isScanning && (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Camera is currently idle</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Click start below to scan via webcam/phone camera, or drop an image file.
            </p>
          </div>
        )}

        {/* Scan Reticle Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-indigo-400/80 rounded-2xl relative animate-pulse">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-400 -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-400 -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-400 -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-400 -mb-1 -mr-1"></div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {!isScanning ? (
          <button
            onClick={startCamera}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/30"
          >
            <Camera className="w-4 h-4" />
            <span>Start Camera Scanner</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              Stop Camera
            </button>
            <button
              onClick={() => {
                stopCamera();
                setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                setTimeout(() => startCamera(), 100);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Flip Camera</span>
            </button>
          </div>
        )}

        {/* Upload file button */}
        <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm cursor-pointer transition">
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>Upload Image File</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Scan Results Output */}
      {scanResult && (
        <div className="mt-8 p-5 rounded-2xl bg-slate-950 border border-indigo-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Decoded Payload
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm text-slate-200 break-all select-all">
            {scanResult}
          </div>

          {isUrl && (
            <div className="mt-4">
              <a
                href={scanResult}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                <span>Open URL in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
