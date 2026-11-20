import React, { useState, useEffect } from 'react';
import { Sparkles, Download } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { playVictoryFanfare } from '../../utils/audioFeedback';
import { useAuth } from '../../context/AuthContext';

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  format: 'png' | 'svg' | 'pdf';
  canvas: HTMLCanvasElement | null;
  payload?: string;
}

export const DownloadDialog: React.FC<DownloadDialogProps> = ({
  isOpen,
  onClose,
  format,
  canvas,
}) => {
  const { user, isAdmin } = useAuth();
  const isProOrAdmin = isAdmin || user?.tier === 'pro' || user?.tier === 'enterprise';

  const [timer, setTimer] = useState<number>(isProOrAdmin ? 0 : 3);
  const [ready, setReady] = useState<boolean>(isProOrAdmin);

  useEffect(() => {
    if (!isOpen) return;

    if (isProOrAdmin) {
      setTimer(0);
      setReady(true);
      return;
    }

    setTimer(3);
    setReady(false);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setReady(true);
          playVictoryFanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isProOrAdmin]);

  const handleDownload = async () => {
    if (!canvas) return;
    const fileName = `strix-qr-${Date.now()}`;

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (format === 'svg') {
      const imgData = canvas.toDataURL('image/png');
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><image href="${imgData}" width="300" height="300"/></svg>`;
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${fileName}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const { default: jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.setFontSize(18);
      pdf.setTextColor(15, 23, 42);
      pdf.text('Strix QR — Print-Ready Document', 20, 25);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Vector Matrix Output • Engineered by StrixDevs (strixdevs.com)', 20, 32);
      pdf.addImage(imgData, 'PNG', 45, 55, 120, 120);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(20, 190, 170, 35, 3, 3);
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Commercial Print Instructions:', 25, 200);
      pdf.setFontSize(8.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text('• Print-tested for business cards, restaurant menus, table tents, and storefront windows.', 25, 207);
      pdf.text('• Guaranteed direct permanent encoding. Never expires, zero server dependency.', 25, 214);
      pdf.save(`${fileName}.pdf`);
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compiling Print-Ready Package">
      <div className="space-y-4 text-center py-2">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping" />
          <p className="text-xs text-slate-300 font-semibold">
            Compiling Vector <strong className="text-[#38bdf8] uppercase">{format}</strong> Package
          </p>
        </div>

        {/* Sponsor highlight for free users */}
        {!isProOrAdmin && (
          <div className="p-4 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/[0.1] text-xs text-zinc-300 text-left space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#38bdf8] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Direct Partner Highlight
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Free Starter Tool</span>
            </div>
            <p className="text-sm font-bold text-white">
              Need Custom Mobile Apps or Scalable Cloud Infrastructure?
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              StrixDevs builds production web platforms, mobile apps, and vector imaging systems for startups and enterprises worldwide.
            </p>
            <a
              href="https://strixdevs.com"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-1 text-xs text-[#38bdf8] hover:underline font-semibold"
            >
              Explore StrixDevs Solutions ↗
            </a>
          </div>
        )}

        <div className="pt-2">
          {ready ? (
            <Button
              variant="primary"
              fullWidth
              onClick={handleDownload}
              className="py-3 font-bold text-sm shadow-xl flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download {format.toUpperCase()} Package Now
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-white/[0.08]">
                <div
                  className="bg-[#38bdf8] h-full transition-all duration-1000"
                  style={{ width: `${((3 - timer) / 3) * 100}%` }}
                />
              </div>
              <Button variant="secondary" fullWidth disabled className="py-2.5 text-xs text-zinc-400">
                Finalizing vector file in {timer}s...
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
