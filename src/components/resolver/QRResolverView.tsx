import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { analytics } from '../../services/analytics';
import type { SavedQRCode } from '../../types';
import { Button } from '../ui/Button';
import { BurnedState, ExpiredState, RevokedState, NotFoundState } from './ResolverStates';

interface QRResolverViewProps {
  codeId: string;
  onClose: () => void;
}

export const QRResolverView: React.FC<QRResolverViewProps> = ({ codeId, onClose }) => {
  const [resolution, setResolution] = useState<{
    status: 'loading' | 'success' | 'burned' | 'expired' | 'revoked' | 'not_found';
    qr?: SavedQRCode;
    destination?: string;
    destinationType?: SavedQRCode['qrType'];
    burnTimestamp?: string;
  }>({ status: 'loading' });

  const [countdown, setCountdown] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    const result = db.recordScan(codeId);
    setResolution(result);
    analytics.trackEvent('qr_scan_resolved', { code_id: codeId, status: result.status });
  }, [codeId]);

  useEffect(() => {
    if (resolution.status !== 'success' || !resolution.destination || isPaused) return;
    const isUrl = resolution.destination.startsWith('http://') || resolution.destination.startsWith('https://');
    if (!isUrl) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      window.location.href = resolution.destination;
    }
  }, [resolution, countdown, isPaused]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
          <span className="font-bold text-white tracking-tight">StrixQR Cryptographic Resolver</span>
          <span className="font-mono text-[10px] text-emerald-400">SECURE VERIFIED</span>
        </div>

        {resolution.status === 'loading' && (
          <div className="py-12 text-center text-slate-400 text-sm">Verifying QR validity...</div>
        )}

        {resolution.status === 'success' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center">
              ✓ Verified Active Access Destination
            </div>

            <h3 className="text-xl font-bold text-white text-center">{resolution.qr?.title || 'Scan Ready'}</h3>

            {resolution.destination?.startsWith('http') ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-400 break-all font-mono">
                  {resolution.destination}
                </div>
                <div className="flex items-center gap-2">
                  <a href={resolution.destination} className="flex-1">
                    <Button variant="primary" fullWidth>Proceed ({countdown}s) →</Button>
                  </a>
                  <Button variant="secondary" onClick={() => setIsPaused(!isPaused)}>
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase font-mono">Decrypted Content</span>
                  <button onClick={() => handleCopy(resolution.destination || '')} className="text-indigo-400 underline">
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap break-all font-mono">
                  {resolution.destination}
                </pre>
                <Button variant="secondary" fullWidth onClick={onClose}>Done</Button>
              </div>
            )}
          </div>
        )}

        {resolution.status === 'burned' && <BurnedState onClose={onClose} burnTimestamp={resolution.burnTimestamp} />}
        {resolution.status === 'expired' && <ExpiredState onClose={onClose} />}
        {resolution.status === 'revoked' && <RevokedState onClose={onClose} />}
        {resolution.status === 'not_found' && <NotFoundState onClose={onClose} codeId={codeId} />}
      </div>
    </div>
  );
};

