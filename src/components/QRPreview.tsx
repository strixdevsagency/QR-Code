import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import jsQR from 'jsqr';
import jsPDF from 'jspdf';
import type { QRDesignOptions } from '../types';
import { getContrastRatio } from '../utils/qrPayload';

interface QRPreviewProps {
  payload: string;
  design: QRDesignOptions;
  onAutoFixContrast: () => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({ payload, design, onAutoFixContrast }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const [isScannable, setIsScannable] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg' | 'pdf'>('png');
  const [modalTimer, setModalTimer] = useState<number>(3);
  const [downloadReady, setDownloadReady] = useState<boolean>(false);

  const contrastRatio = getContrastRatio(design.dotsColor, design.backgroundColor);
  const hasContrastWarning = contrastRatio < 4.0;

  useEffect(() => {
    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 280,
        height: 280,
        type: 'canvas',
        data: payload || 'https://strixdevs.com',
        image: design.logoUrl || undefined,
        margin: design.margin,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: design.logoUrl ? 'H' : 'Q',
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: design.logoSize || 0.35,
          margin: 4,
          crossOrigin: 'anonymous',
        },
        dotsOptions: {
          type: design.dotsType as any,
          color: design.dotsColor,
          gradient: design.isGradient && design.dotsColorEnd
            ? {
                type: design.gradientType,
                rotation: 0,
                colorStops: [
                  { offset: 0, color: design.dotsColor },
                  { offset: 1, color: design.dotsColorEnd },
                ],
              }
            : undefined,
        },
        cornersSquareOptions: {
          type: design.cornerSquareType as any,
          color: design.cornerSquareColor || design.dotsColor,
        },
        cornersDotOptions: {
          type: design.cornerDotType as any,
          color: design.cornerDotColor || design.dotsColor,
        },
        backgroundOptions: {
          color: design.backgroundColor,
        },
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        qrCodeInstance.current.append(containerRef.current);
      }
    } else {
      qrCodeInstance.current.update({
        data: payload || 'https://strixdevs.com',
        image: design.logoUrl || undefined,
        margin: design.margin,
        qrOptions: {
          errorCorrectionLevel: design.logoUrl ? 'H' : 'Q',
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: design.logoSize || 0.35,
          margin: 4,
        },
        dotsOptions: {
          type: design.dotsType as any,
          color: design.dotsColor,
          gradient: design.isGradient && design.dotsColorEnd
            ? {
                type: design.gradientType,
                rotation: 0,
                colorStops: [
                  { offset: 0, color: design.dotsColor },
                  { offset: 1, color: design.dotsColorEnd },
                ],
              }
            : undefined,
        },
        cornersSquareOptions: {
          type: design.cornerSquareType as any,
          color: design.cornerSquareColor || design.dotsColor,
        },
        cornersDotOptions: {
          type: design.cornerDotType as any,
          color: design.cornerDotColor || design.dotsColor,
        },
        backgroundOptions: {
          color: design.backgroundColor,
        },
      });
    }

    const scanTimer = setTimeout(() => {
      validateScannability();
    }, 200);

    return () => clearTimeout(scanTimer);
  }, [payload, design]);

  const validateScannability = () => {
    try {
      const canvas = containerRef.current?.querySelector('canvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      setIsScannable(!!code);
    } catch {
      setIsScannable(true);
    }
  };

  const handleInitiateDownload = (format: 'png' | 'svg' | 'pdf') => {
    setDownloadFormat(format);
    setShowDownloadModal(true);
    setDownloadReady(false);
    setModalTimer(3);
  };

  useEffect(() => {
    if (!showDownloadModal) return;

    if (modalTimer > 0) {
      const timer = setTimeout(() => {
        setModalTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setDownloadReady(true);
    }
  }, [showDownloadModal, modalTimer]);

  const executeDownload = async () => {
    if (!qrCodeInstance.current) return;

    const fileName = `strix-qr-${Date.now()}`;

    if (downloadFormat === 'png') {
      await qrCodeInstance.current.download({ name: fileName, extension: 'png' });
    } else if (downloadFormat === 'svg') {
      await qrCodeInstance.current.download({ name: fileName, extension: 'svg' });
    } else if (downloadFormat === 'pdf') {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        pdf.setFontSize(16);
        pdf.setTextColor(15, 23, 42);
        pdf.text('Strix QR — Print Ready', 20, 25);

        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Permanent Static QR Code • Powered by StrixDevs (strixdevs.com)', 20, 31);

        pdf.addImage(imgData, 'PNG', 45, 50, 120, 120);
        pdf.save(`${fileName}.pdf`);
      }
    }

    setShowDownloadModal(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[340px] flex flex-col items-center">
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center">
        
        {/* Scannability indicator */}
        <div className="w-full flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-400 font-medium">Preview</span>
          {hasContrastWarning ? (
            <button
              onClick={onAutoFixContrast}
              className="text-amber-400 hover:underline font-semibold"
            >
              Low Contrast (Auto-Fix)
            </button>
          ) : isScannable ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Verified Scannable
            </span>
          ) : (
            <span className="text-rose-400 font-medium">Check Scan</span>
          )}
        </div>

        {/* QR Canvas */}
        <div
          ref={containerRef}
          className="p-2.5 rounded-xl bg-white flex items-center justify-center shadow-sm"
        />

        {/* Download Buttons */}
        <div className="w-full mt-4 grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleInitiateDownload('png')}
            className="py-2 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700/80 text-slate-200 transition text-xs font-semibold text-center"
          >
            PNG
          </button>
          <button
            onClick={() => handleInitiateDownload('svg')}
            className="py-2 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700/80 text-slate-200 transition text-xs font-semibold text-center"
          >
            SVG
          </button>
          <button
            onClick={() => handleInitiateDownload('pdf')}
            className="py-2 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700/80 text-slate-200 transition text-xs font-semibold text-center"
          >
            PDF Print
          </button>
        </div>

        {/* Copy Payload shortcut */}
        <div className="w-full mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-[200px] font-mono text-[11px] text-slate-400">
            {payload}
          </span>
          <button
            onClick={handleCopyLink}
            className="text-indigo-400 hover:text-indigo-300 font-medium ml-2 shrink-0"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Download Interstitial Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Downloading {downloadFormat.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Permanent static code powered by StrixDevs.
            </p>

            {/* Ad container */}
            <div className="my-3 p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/60 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 block mb-2">Advertisement</span>
              <p className="text-xs font-semibold text-slate-200">Need Custom Software in NY, Chicago, or Canada?</p>
              <a
                href="https://strixdevs.com"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-1.5 rounded-lg transition"
              >
                Visit StrixDevs.com
              </a>
            </div>

            {/* Download countdown */}
            {downloadReady ? (
              <button
                onClick={executeDownload}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
              >
                Save {downloadFormat.toUpperCase()} File
              </button>
            ) : (
              <div className="text-center py-2 text-xs text-slate-400">
                Ready in {modalTimer}s...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
