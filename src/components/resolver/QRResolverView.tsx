import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { db } from '../../services/db';
import { analytics } from '../../services/analytics';
import type { SavedQRCode } from '../../types';
import { Button } from '../ui/Button';
import { BurnedState, ExpiredState, RevokedState, NotFoundState, PinRequiredState } from './ResolverStates';
import { inspectUrlSafety } from '../../utils/payloadParser';

interface QRResolverViewProps {
  codeId: string;
  onClose: () => void;
}

export const QRResolverView: React.FC<QRResolverViewProps> = ({ codeId, onClose }) => {
  const [resolution, setResolution] = useState<{
    status: 'loading' | 'success' | 'burned' | 'expired' | 'revoked' | 'not_found' | 'pin_required';
    qr?: SavedQRCode;
    destination?: string;
    destinationType?: SavedQRCode['qrType'];
    burnTimestamp?: string;
  }>({ status: 'loading' });

  const [countdown, setCountdown] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [safetyCheck, setSafetyCheck] = useState<{ level: 'safe' | 'caution' | 'warning'; reasons: string[] } | null>(null);

  const fetchResolution = async (pin?: string): Promise<boolean> => {
    try {
      const pinParam = pin ? `?pin=${encodeURIComponent(pin)}` : '';
      const res = await fetch(`/api/resolve/${codeId}${pinParam}`);
      if (res.ok) {
        const data = await res.json();
        setResolution({
          status: data.status,
          qr: data.record,
          destination: data.destination,
          destinationType: data.destinationType,
          burnTimestamp: data.burnTimestamp,
        });
        if (data.status === 'success' && data.destination && data.destination.startsWith('http')) {
          const safety = inspectUrlSafety(data.destination);
          setSafetyCheck(safety);
          if (safety.level !== 'safe') {
            setIsPaused(true);
          }
        }
        analytics.trackEvent('qr_scan_resolved', { code_id: codeId, status: data.status });
        return true;
      } else if (res.status === 403) {
        setResolution({ status: 'pin_required' });
        return false;
      }
    } catch {
      // Offline fallback
    }

    // Fallback to local db if network unavailable
    const localResult = db.recordScan(codeId, pin ? { pin } : undefined);
    setResolution(localResult);
    if (localResult.status === 'success' && localResult.destination && localResult.destination.startsWith('http')) {
      const safety = inspectUrlSafety(localResult.destination);
      setSafetyCheck(safety);
      if (safety.level !== 'safe') {
        setIsPaused(true);
      }
    }
    analytics.trackEvent('qr_scan_resolved', { code_id: codeId, status: localResult.status });
    return localResult.status === 'success';
  };

  useEffect(() => {
    fetchResolution();
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

  const handleVerifyPin = async (enteredPin: string): Promise<boolean> => {
    return await fetchResolution(enteredPin);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
          <span className="font-bold text-white tracking-tight">Strix QR Cryptographic Resolver</span>
          <span className="font-mono text-[10px] text-emerald-400">SECURE VERIFIED</span>
        </div>

        {resolution.status === 'loading' && (
          <div className="py-12 text-center text-slate-400 text-sm">Verifying QR validity...</div>
        )}

        {resolution.status === 'pin_required' && (
          <PinRequiredState onClose={onClose} onSubmitPin={handleVerifyPin} />
        )}

        {resolution.status === 'success' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Verified Active Access Destination
            </div>

            <h3 className="text-xl font-bold text-white text-center">{resolution.qr?.title || 'Scan Ready'}</h3>

            {resolution.qr?.dynamicConfig?.smartRouting?.enabled && (
              <div className="text-[11px] text-center text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 py-1 px-3 rounded-full w-fit mx-auto">
                ⚡ Context-Aware Smart Route Applied
              </div>
            )}

            {resolution.destination?.startsWith('http') ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-blue-400 break-all font-mono">
                  {resolution.destination}
                </div>

                {/* Anti-Quishing Security Alert for Risky Links */}
                {safetyCheck && safetyCheck.level !== 'safe' && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      {safetyCheck.level === 'warning' ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <ShieldQuestion className="w-4 h-4" />}
                      Anti-Quishing Advisory: Auto-Redirect Paused
                    </div>
                    <ul className="list-disc list-inside text-[11px] text-amber-300/80 space-y-0.5">
                      {safetyCheck.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <a href={resolution.destination} className="flex-1">
                    <Button variant="primary" fullWidth>
                      {isPaused ? 'Proceed to Destination →' : `Proceed (${countdown}s) →`}
                    </Button>
                  </a>
                  <Button variant="secondary" onClick={() => setIsPaused(!isPaused)}>
                    {isPaused ? 'Auto-Countdown' : 'Pause'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase font-mono">Decrypted Content</span>
                  <button onClick={() => handleCopy(resolution.destination || '')} className="text-blue-400 underline cursor-pointer">
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
