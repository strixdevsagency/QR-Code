import React, { useState } from 'react';
import { db } from '../../services/db';
import type { SavedQRCode } from '../../types';
import { Button } from '../ui/Button';

export const DynamicQRMgr: React.FC = () => {
  const [qrs, setQrs] = useState<SavedQRCode[]>(() =>
    db.getAllQRs().filter((q) => q.isDynamic)
  );

  const handleToggleRevoke = (id: string) => {
    db.toggleRevokeQR(id);
    setQrs(db.getAllQRs().filter((q) => q.isDynamic));
  };

  const handleResetScans = (id: string) => {
    const qr = db.getQRById(id);
    if (qr && qr.dynamicConfig) {
      db.updateQRCode(id, {
        dynamicConfig: {
          ...qr.dynamicConfig,
          currentScans: 0,
          isBurned: false,
          burnedAt: undefined,
        },
      });
      setQrs(db.getAllQRs().filter((q) => q.isDynamic));
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Dynamic & Ephemeral QR Codes Manager
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Monitor all active, burned, and time-limited QR codes with live scan counts and revocation switches.
        </p>
      </div>

      {qrs.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">No dynamic QR codes in system.</p>
      ) : (
        <div className="space-y-3">
          {qrs.map((qr) => {
            const cfg = qr.dynamicConfig;
            return (
              <div
                key={qr.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{qr.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">({qr.id})</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>Mode: <strong className="text-indigo-400 uppercase">{cfg?.mode}</strong></span>
                    <span>•</span>
                    <span>Scans: <strong className="text-white">{cfg?.currentScans || 0}</strong></span>
                    <span>•</span>
                    <span>Status: {cfg?.isBurned ? <span className="text-rose-400 font-bold">Burned</span> : <span className="text-emerald-400">Active</span>}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetScans(qr.id)}
                  >
                    Reset Scans
                  </Button>
                  <Button
                    variant={cfg?.isRevoked ? 'primary' : 'danger'}
                    size="sm"
                    onClick={() => handleToggleRevoke(qr.id)}
                  >
                    {cfg?.isRevoked ? 'Un-revoke' : 'Revoke'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

