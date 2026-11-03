import React, { useRef, useState, useEffect } from 'react';
import jsQR from 'jsqr';
import { Button } from '../ui/Button';

export const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let animationFrameId: number;

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
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code && code.data) {
              setScanResult(code.data);
            }
          }
        }
      }
      if (cameraActive) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (cameraActive) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive]);

  const startCamera = async () => {
    setErrorMsg(null);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setErrorMsg('Camera permission denied or camera not found on this device.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code) {
            setScanResult(code.data);
          } else {
            setErrorMsg('No QR code detected in the uploaded image.');
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

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          In-Browser Optical QR Scanner
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Scan using your webcam/mobile camera or upload a QR image file directly. 100% private, decoded in-browser.
        </p>
      </div>

      <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
        <video ref={videoRef} className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`} playsInline />
        <canvas ref={canvasRef} className="hidden" />

        {!cameraActive && (
          <div className="text-center p-6 space-y-3">
            <p className="text-xs text-slate-400">Camera is currently paused.</p>
            <Button variant="primary" onClick={startCamera}>
              Start Live Camera
            </Button>
          </div>
        )}
      </div>

      {cameraActive && (
        <Button variant="danger" fullWidth onClick={stopCamera}>
          Stop Camera
        </Button>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* File Upload Option */}
      <div className="pt-2 border-t border-slate-800 text-center">
        <label className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-semibold underline">
          Or upload QR image from file
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Scan Results */}
      {scanResult && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Decoded Content</span>
            <button onClick={handleCopy} className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer">
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-all bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            {scanResult}
          </pre>
          {scanResult.startsWith('http') && (
            <a
              href={scanResult}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-1 text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold"
            >
              Open Link in New Tab ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
};

