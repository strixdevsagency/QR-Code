import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  format: 'png' | 'svg' | 'pdf';
  canvas: HTMLCanvasElement | null;
  payload: string;
}

export const DownloadDialog: React.FC<DownloadDialogProps> = ({
  isOpen,
  onClose,
  format,
  canvas,
  payload,
}) => {
  const [timer, setTimer] = useState<number>(3);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setTimer(3);
    setReady(false);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleDownload = () => {
    if (!canvas) return;
    const fileName = `strix-qr-${Date.now()}`;

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (format === 'svg') {
      // Create SVG wrapper with embedded image or canvas data
      const imgData = canvas.toDataURL('image/png');
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><image href="${imgData}" width="300" height="300"/></svg>`;
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${fileName}.svg`;
      link.href = url;
      link.click();
    } else if (format === 'pdf') {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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
      pdf.text('• Print-tested for business cards, restaurant menus, table tents, and storefront windows.', 25, 207);
      pdf.text('• Guaranteed direct permanent encoding. Never expires, requires no subscription.', 25, 214);
      pdf.save(`${fileName}.pdf`);
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Preparing Your Print-Ready Export">
      <div className="space-y-4 text-center py-2">
        <p className="text-xs text-slate-400">
          Compiling high-resolution <strong className="text-indigo-400 uppercase">{format}</strong> package.
        </p>

        {/* Sponsor/Ad notice within modal */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
          <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 block mb-1">
            Sponsored by StrixDevs
          </span>
          <p className="text-slate-300">Need custom web apps or software? StrixDevs builds digital products for North American businesses.</p>
        </div>

        <div className="pt-2">
          {ready ? (
            <Button variant="primary" fullWidth onClick={handleDownload}>
              Download {format.toUpperCase()} Now
            </Button>
          ) : (
            <Button variant="secondary" fullWidth disabled>
              Ready in {timer}s...
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
