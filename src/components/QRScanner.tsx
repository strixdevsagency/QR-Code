import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(tick);
      }
    } catch {
      setErrorMessage('Camera access was not granted or is unavailable.');
      setIsScanning(false);
    }
  };

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
            setErrorMessage('Could not decode QR code from this image.');
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
    <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold text-white tracking-tight">QR Code Scanner</h2>
        <p className="text-xs text-slate-400 mt-1">Scan via webcam or upload an image.</p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Viewport */}
      <div className="relative aspect-video max-w-sm mx-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
        <video ref={videoRef} className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`} />
        <canvas ref={canvasRef} className="hidden" />

        {!isScanning && (
          <div className="text-center p-4">
            <span className="text-xs text-slate-400">Camera idle</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-3">
        {!isScanning ? (
          <button
            onClick={startCamera}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Stop
          </button>
        )}

        <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs cursor-pointer transition">
          <span>Upload Image</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Decoded Output */}
      {scanResult && (
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400">Decoded Result</span>
            <button
              onClick={handleCopy}
              className="text-xs text-indigo-400 hover:underline"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-xs text-slate-200 break-all select-all">
            {scanResult}
          </div>

          {isUrl && (
            <a
              href={scanResult}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
            >
              Open Link →
            </a>
          )}
        </div>
      )}
    </div>
  );
};
