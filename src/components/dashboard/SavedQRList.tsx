import React from 'react';
import type { SavedQRCode } from '../../types';
import { Button } from '../ui/Button';

interface SavedQRListProps {
  qrs: SavedQRCode[];
  onLoadQRToGenerator: (qr: SavedQRCode) => void;
  onDeleteQR: (id: string) => void;
  onOpenTestScan: (id: string) => void;
}

export const SavedQRList: React.FC<SavedQRListProps> = ({
  qrs,
  onLoadQRToGenerator,
  onDeleteQR,
  onOpenTestScan,
}) => {
  if (qrs.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800">
        <p className="text-slate-400 text-sm">No saved QR codes found in your account.</p>
      </div>
    );
  }

  const getStatusBadge = (qr: SavedQRCode) => {
    if (!qr.isDynamic || !qr.dynamicConfig) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
          Permanent Static
        </span>
      );
    }

    const { mode, isBurned, currentScans, maxScans, expiresAt } = qr.dynamicConfig;

    if (isBurned || (mode === 'one_time' && currentScans >= (maxScans || 1))) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 text-[11px] font-semibold border border-rose-500/20">
          🔥 Burned (1/1 Scans)
        </span>
      );
    }

    if (mode === 'one_time') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-semibold border border-amber-500/20">
          Ready (0/1 Scans)
        </span>
      );
    }

    if (mode === 'time_limited' && expiresAt) {
      const isExpired = Date.now() > new Date(expiresAt).getTime();
      return isExpired ? (
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px] font-semibold border border-slate-700">
          Expired
        </span>
      ) : (
        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-semibold border border-cyan-500/20">
          Active Time-Limited
        </span>
      );
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {qrs.map((qr) => (
        <div
          key={qr.id}
          className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">{qr.title}</h4>
              {getStatusBadge(qr)}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-mono uppercase text-blue-400">{qr.qrType}</span>
              <span>•</span>
              <span>Downloads: {qr.downloadCount || 0}</span>
              <span>•</span>
              <span>Created: {new Date(qr.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {qr.isDynamic && (
              <Button variant="outline" size="sm" onClick={() => onOpenTestScan(qr.id)}>
                Test Scan
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => onLoadQRToGenerator(qr)}>
              Edit in Generator
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDeleteQR(qr.id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

