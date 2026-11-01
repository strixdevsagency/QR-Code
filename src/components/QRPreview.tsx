import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import jsQR from 'jsqr';
import jsPDF from 'jspdf';
import type { QRDesignOptions, QRType } from '../types';
import { getContrastRatio } from '../utils/qrPayload';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { Bookmark, Check, Download, X, Clock } from 'lucide-react';

interface QRPreviewProps {
  payload: string;
  payloadType: QRType;
  design: QRDesignOptions;
  onAutoFixContrast: () => void;
  onOpenAuth: () => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  payload,
  payloadType,
  design,
  onAutoFixContrast,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const [isScannable, setIsScannable] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [qrTitle, setQrTitle] = useState<string>('My QR Code');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  // Download state
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg' | 'pdf'>('png');
  const [modalTimer, setModalTimer] = useState<number>(3);
  const [downloadReady, setDownloadReady] = useState<boolean>(false);

  const contrastRatio = getContrastRatio(design.dotsColor, design.backgroundColor);
  const hasContrastWarning = contrastRatio < 4.0;

  useEffect(() => {
    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 270,
        height: 270,
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
        pdf.text('Strix QR — Permanent Print Document', 20, 25);

        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text('100% Free Lifetime Static Code • Engineered by StrixDevs (strixdevs.com)', 20, 31);

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

  const handleSaveToAccount = () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    setShowSaveModal(true);
  };

  const confirmSaveQRCode = () => {
    if (user) {
      db.saveQRCode({
        userId: user.id,
        title: qrTitle || 'Untitled QR Code',
        qrType: payloadType,
        payload,
        design,
      });
      setShowSaveModal(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-[360px] flex flex-col items-center">
      {/* Studio Showcase Card */}
      <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-2xl shadow-indigo-500/10 dark:shadow-black/70 flex flex-col items-center transition-all relative overflow-hidden">
        
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Scannability Status Pill */}
        <div className="w-full flex items-center justify-between mb-4 text-xs z-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Live Preview
          </span>
          {hasContrastWarning ? (
            <button
              onClick={onAutoFixContrast}
              className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold hover:underline"
            >
              Low Contrast (Auto-Fix)
            </button>
          ) : isScannable ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Verified Scannable
            </span>
          ) : (
            <span className="text-rose-500 text-[11px] font-bold">Check Scan</span>
          )}
        </div>

        {/* QR Canvas Pedestal */}
        <div
          ref={containerRef}
          className="p-3.5 rounded-3xl bg-white shadow-xl shadow-slate-200/50 dark:shadow-black/60 flex items-center justify-center transition-transform hover:scale-[1.02] duration-300 z-10"
        />

        {/* Download Action Bar */}
        <div className="w-full mt-6 grid grid-cols-3 gap-2 z-10">
          <button
            onClick={() => handleInitiateDownload('png')}
            className="py-2.5 rounded-2xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-100 transition text-xs font-bold text-center cursor-pointer shadow-xs"
          >
            PNG
          </button>
          <button
            onClick={() => handleInitiateDownload('svg')}
            className="py-2.5 rounded-2xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-100 transition text-xs font-bold text-center cursor-pointer shadow-xs"
          >
            Vector SVG
          </button>
          <button
            onClick={() => handleInitiateDownload('pdf')}
            className="py-2.5 rounded-2xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-100 transition text-xs font-bold text-center cursor-pointer shadow-xs"
          >
            Print PDF
          </button>
        </div>

        {/* Save to Vault Action */}
        <div className="w-full mt-3 z-10">
          <button
            onClick={handleSaveToAccount}
            className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
              savedSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to Your Account!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Save to My Account</span>
              </>
            )}
          </button>
        </div>

        {/* Payload preview & Copy */}
        <div className="w-full mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 z-10">
          <span className="truncate max-w-[210px] font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {payload}
          </span>
          <button
            onClick={handleCopyLink}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-[11px] shrink-0 ml-2"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Save to Dashboard</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Give your QR code a title to re-download or edit it anytime.
            </p>

            <input
              type="text"
              value={qrTitle}
              onChange={(e) => setQrTitle(e.target.value)}
              placeholder="e.g. Chicago Cafe Table Menu"
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white text-xs mb-4 focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />

            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl text-slate-500 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveQRCode}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Interstitial Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Preparing {downloadFormat.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Permanent static code engineered by StrixDevs.
            </p>

            {/* Clean Sponsor Callout */}
            <div className="my-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                Featured Partner
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                StrixDevs Enterprise Engineering
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Custom web platforms, mobile apps & AI systems for US & Canadian businesses.
              </p>
              <a
                href="https://strixdevs.com"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition"
              >
                Visit StrixDevs.com →
              </a>
            </div>

            {/* Countdown / Download ready button */}
            {downloadReady ? (
              <button
                onClick={executeDownload}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition animate-bounce cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save {downloadFormat.toUpperCase()} Now</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                <Clock className="w-4 h-4 text-indigo-500 animate-spin" />
                <span>Packing file in {modalTimer}s...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
