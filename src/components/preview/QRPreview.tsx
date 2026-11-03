import React, { useState } from 'react';
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

  // Status configuration
  const statusConfig = {
    lifetime: { text: 'Active Free • Lifetime Guarantee', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    one_time: { text: 'One-Time Scan • Self-Destructs', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    time_limited: { text: `Time-Limited • Expires in ${timeLimitPreset}`, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  }[expiryMode];

  const handleSaveToAccount = () => {
    if (!isAuthenticated || !user) {
      onOpenAuth();
      return;
    }

    const isDynamic = expiryMode !== 'lifetime';
    const expiresAt = expiryMode === 'time_limited'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const saved = db.saveQRCode({
      userId: user.id,
      title: `${payloadType.toUpperCase()} Code (${expiryMode})`,
      qrType: payloadType,
      payload,
      design,
      isDynamic,
      dynamicConfig: isDynamic ? {
        mode: expiryMode,
        maxScans: expiryMode === 'one_time' ? 1 : undefined,
        currentScans: 0,
        isBurned: false,
        expiresAt,
        destinationType: payloadType,
        destinationPayload: payload,
      } : undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    if (isDynamic && onTriggerDynamicResolver) {
      onTriggerDynamicResolver(saved.id);
    }
  };

  return (
    <div className="w-full max-w-[380px] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-indigo-950/30 flex flex-col items-center">
      {/* Expiry / Security Mode Status Badge */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80 text-xs">
        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusConfig.color}`}>
          {statusConfig.text}
        </span>
        <span className="text-[11px] text-slate-400 font-mono">Level H</span>
      </div>

      {/* Render Canvas */}
      <QRCanvas payload={payload} design={design} onCanvasReady={setCanvas} />

      {/* Scannability and Contrast Guard */}
      <ScannabilityGuard
        canvas={canvas}
        dotsColor={design.dotsColor}
        backgroundColor={design.backgroundColor}
        onAutoFixContrast={onAutoFixContrast}
      />

      {/* Export Action Buttons */}
      <div className="w-full mt-5 space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDownloadFormat('png')}>
            PNG
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setDownloadFormat('svg')}>
            SVG
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setDownloadFormat('pdf')}>
            PDF
          </Button>
        </div>

        <Button
          variant={saveSuccess ? 'outline' : 'primary'}
          fullWidth
          onClick={handleSaveToAccount}
          className={saveSuccess ? 'border-emerald-500 text-emerald-400' : ''}
        >
          {saveSuccess ? '✓ Saved to Your Account' : 'Save to My Account'}
        </Button>
      </div>

      {/* Download Countdown Dialog */}
      {downloadFormat && (
        <DownloadDialog
          isOpen={Boolean(downloadFormat)}
          onClose={() => setDownloadFormat(null)}
          format={downloadFormat}
          canvas={canvas}
          payload={payload}
        />
      )}
    </div>
  );
};
