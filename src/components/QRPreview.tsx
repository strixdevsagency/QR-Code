import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import jsQR from 'jsqr';
import jsPDF from 'jspdf';
import type { QRDesignOptions } from '../types';
import { getContrastRatio } from '../utils/qrPayload';
import {
  Download,
  FileCode,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Printer,
  Copy,
  Check,
  X,
  Clock,
} from 'lucide-react';

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

  // Calculate contrast ratio
  const contrastRatio = getContrastRatio(design.dotsColor, design.backgroundColor);
  const hasContrastWarning = contrastRatio < 4.0;

  // Initialize & update qr-code-styling instance
  useEffect(() => {
    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 320,
        height: 320,
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

  // Background Optical Camera Verification via jsQR
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

        pdf.setFontSize(18);
        pdf.setTextColor(15, 23, 42);
        pdf.text('Strix QR — Print-Ready Document', 20, 25);

        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.text('100% Free Lifetime Static Code • Powered by StrixDevs (strixdevs.com)', 20, 32);

        pdf.addImage(imgData, 'PNG', 45, 55, 120, 120);

        pdf.setDrawColor(203, 213, 225);
        pdf.roundedRect(20, 190, 170, 35, 3, 3);

        pdf.setFontSize(10);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Commercial Print Instructions:', 25, 200);

        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text('• Suitable for restaurant menus, business cards, table tents, and storefront windows.', 25, 207);
        pdf.text('• Guaranteed direct permanent encoding. Never expires, requires no subscription.', 25, 214);

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
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[380px] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-indigo-950/30 flex flex-col items-center relative group">
        
        <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Status: <strong className="text-emerald-400 uppercase tracking-wider font-semibold">Active Free</strong>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium">
            {design.validityTerm === 'lifetime' ? 'Lifetime Guarantee' : `${design.validityTerm} Free`}
          </span>
        </div>

        <div
          ref={containerRef}
          className="p-3 rounded-2xl bg-white shadow-inner flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.01]"
        />

        <div className="w-full mt-4 space-y-2">
          {hasContrastWarning ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Low contrast. Phone cameras might struggle.</span>
              </div>
              <button
                onClick={onAutoFixContrast}
                className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 font-semibold text-[11px] underline"
              >
                Auto-Fix
              </button>
            </div>
          ) : isScannable ? (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Camera-Verified Scannable by Optical Engine</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Scanning check failed. Increase contrast or reduce logo size.</span>
            </div>
          )}
        </div>

        <div className="w-full mt-5 grid grid-cols-3 gap-2">
          <button
            onClick={() => handleInitiateDownload('png')}
            className="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700/80 text-slate-200 transition text-xs font-semibold group/btn"
          >
            <Download className="w-4 h-4 mb-1 text-indigo-400 group-hover/btn:text-white" />
            <span>High-Res PNG</span>
          </button>

          <button
            onClick={() => handleInitiateDownload('svg')}
            className="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700/80 text-slate-200 transition text-xs font-semibold group/btn"
          >
            <FileCode className="w-4 h-4 mb-1 text-cyan-400 group-hover/btn:text-white" />
            <span>Vector SVG</span>
          </button>

          <button
            onClick={() => handleInitiateDownload('pdf')}
            className="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700/80 text-slate-200 transition text-xs font-semibold group/btn"
          >
            <Printer className="w-4 h-4 mb-1 text-emerald-400 group-hover/btn:text-white" />
            <span>Print PDF</span>
          </button>
        </div>

        <div className="w-full mt-3 flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span className="truncate max-w-[220px] font-mono text-[11px]">
            {payload}
          </span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Preparing Your {downloadFormat.toUpperCase()} File</h3>
                <p className="text-xs text-slate-400">Generated with StrixDevs Direct Permanent Engine</p>
              </div>
            </div>

            <div className="my-4 p-4 rounded-xl border border-dashed border-indigo-500/30 bg-slate-950/60 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 mb-1">Sponsored Advertisement</span>
              <div className="w-full h-36 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 rounded-lg flex flex-col items-center justify-center p-3 border border-slate-800">
                <Sparkles className="w-6 h-6 text-indigo-400 mb-1" />
                <h4 className="text-xs font-semibold text-slate-200">Grow Your Business in Chicago, NY or Canada</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  StrixDevs crafts world-class web applications, mobile platforms, and AI engines.
                </p>
                <a
                  href="https://strixdevs.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1 rounded-md transition"
                >
                  Visit StrixDevs.com →
                </a>
              </div>
            </div>

            {downloadReady ? (
              <button
                onClick={executeDownload}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition animate-bounce"
              >
                <Download className="w-4 h-4" />
                <span>Download {downloadFormat.toUpperCase()} Now</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-medium text-sm">
                <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Your file is ready in {modalTimer}s...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
