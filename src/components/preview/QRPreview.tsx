import React, { useState } from 'react';
import { Download, Bookmark, Check } from 'lucide-react';
import type { QRDesignOptions, QRType, ExpiryMode } from '../../types';
import { QRCanvas } from './QRCanvas';
import { ScannabilityGuard } from './ScannabilityGuard';
import { DownloadDialog } from './DownloadDialog';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';

interface QRPreviewProps {
  payload: string;
  payloadType: QRType;
  design: QRDesignOptions;
  expiryMode: ExpiryMode;
  timeLimitPreset: string;
  onAutoFixContrast: () => void;
  onOpenAuth: () => void;
  onTriggerDynamicResolver?: (codeId: string) => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  payload,
  payloadType,
  design,
  expiryMode,
  timeLimitPreset,
  onAutoFixContrast,
  onOpenAuth,
  onTriggerDynamicResolver,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg' | 'pdf' | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [dynamicCodeId, setDynamicCodeId] = useState<string | null>(null);

  // Status configuration
  const statusConfig = {
    lifetime: { text: 'Direct Matrix • Lifetime', color: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30' },
    one_time: { text: 'One-Time Scan • Auto-Destructs', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    time_limited: { text: `Time-Limited • Expires ${timeLimitPreset}`, color: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30' },
  }[expiryMode];

  // Helper to ensure an ephemeral dynamic record exists in db for download or save
  const ensureDynamicRecord = (targetUserId: string) => {
    const isOneTime = expiryMode === 'one_time';
    const expiresAt = expiryMode === 'time_limited'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const saved = db.saveQRCode({
      userId: targetUserId,
      title: `${payloadType.toUpperCase()} Code (${expiryMode === 'one_time' ? '1-Time' : 'Time-Limited'})`,
      qrType: payloadType,
      payload,
      design,
      isDynamic: true,
      dynamicConfig: {
        mode: expiryMode,
        maxScans: isOneTime ? 1 : undefined,
        currentScans: 0,
        isBurned: false,
        expiresAt,
        destinationType: payloadType,
        destinationPayload: payload,
      },
    });

    setDynamicCodeId(saved.id);
    return saved;
  };

  const handleSaveToAccount = () => {
    if (!isAuthenticated || !user) {
      onOpenAuth();
      return;
    }

    const isDynamic = expiryMode !== 'lifetime';
    let savedId = dynamicCodeId;

    if (isDynamic) {
      const saved = ensureDynamicRecord(user.id);
      savedId = saved.id;
    } else {
      db.saveQRCode({
        userId: user.id,
        title: `${payloadType.toUpperCase()} Code (Static)`,
        qrType: payloadType,
        payload,
        design,
        isDynamic: false,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    if (isDynamic && savedId && onTriggerDynamicResolver) {
      onTriggerDynamicResolver(savedId);
    }
  };

  const handleInitiateDownload = (format: 'png' | 'svg' | 'pdf') => {
    if (expiryMode !== 'lifetime' && !dynamicCodeId) {
      ensureDynamicRecord(user?.id || 'guest');
      setTimeout(() => setDownloadFormat(format), 100);
      return;
    }
    setDownloadFormat(format);
  };

  const effectivePayload = React.useMemo(() => {
    if (expiryMode === 'lifetime') return payload;
    if (dynamicCodeId) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://strixdevs.com';
      return `${origin}/r/${dynamicCodeId}`;
    }
    return payload;
  }, [expiryMode, dynamicCodeId, payload]);

  return (
    <div className="w-full max-w-[390px] bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-2xl border border-white/[0.1] shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-7 flex flex-col items-center">
      {/* Expiry / Security Mode Status Badge */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08] text-xs">
        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusConfig.color}`}>
          {statusConfig.text}
        </span>
        <span className="text-[11px] text-zinc-400 font-mono">Reed-Solomon Level H</span>
      </div>

      {/* Render Canvas */}
      <QRCanvas payload={effectivePayload} design={design} onCanvasReady={setCanvas} />

      {/* Scannability and Contrast Guard */}
      <ScannabilityGuard
        canvas={canvas}
        dotsColor={design.dotsColor}
        backgroundColor={design.backgroundColor}
        design={design}
        payload={effectivePayload}
        onAutoFixContrast={onAutoFixContrast}
      />

      {/* Export Action Controls */}
      <div className="w-full mt-5 space-y-2.5">
        {/* Primary Heroic Export Action */}
        <Button
          variant="primary"
          fullWidth
          size="md"
          onClick={() => handleInitiateDownload('svg')}
          className="gap-2 shadow-lg shadow-white/5 active:scale-[0.98] cursor-pointer font-bold"
        >
          <Download className="w-4 h-4 text-zinc-950" />
          <span>Download Vector SVG</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950/15 text-zinc-900 font-bold uppercase tracking-wider ml-1">
            Print Ready
          </span>
        </Button>

        {/* Secondary Format Options */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleInitiateDownload('png')}
            className="gap-1.5 border border-white/[0.08] hover:border-white/20 bg-zinc-900/80 hover:bg-zinc-800"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>PNG Raster</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleInitiateDownload('pdf')}
            className="gap-1.5 border border-white/[0.08] hover:border-white/20 bg-zinc-900/80 hover:bg-zinc-800"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>PDF (300 DPI)</span>
          </Button>
        </div>

        {/* Save to Vault (Auxiliary Action) */}
        <button
          type="button"
          onClick={handleSaveToAccount}
          className={`w-full py-2 px-3 rounded-xl border text-xs font-medium transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] ${
            saveSuccess
              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
              : 'border-white/[0.08] hover:border-white/15 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {saveSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saved to My Vault</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
              <span>Save Code to Vault</span>
            </>
          )}
        </button>
      </div>

      {/* Download Countdown Dialog */}
      {downloadFormat && (
        <DownloadDialog
          isOpen={Boolean(downloadFormat)}
          onClose={() => setDownloadFormat(null)}
          format={downloadFormat}
          canvas={canvas}
          payload={effectivePayload}
        />
      )}
    </div>
  );
};
