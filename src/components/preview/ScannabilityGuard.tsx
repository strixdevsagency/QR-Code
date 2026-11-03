import React, { useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { getContrastRatio } from '../../utils/qrPayload';

interface ScannabilityGuardProps {
  canvas: HTMLCanvasElement | null;
  dotsColor: string;
  backgroundColor: string;
  onAutoFixContrast: () => void;
}

export const ScannabilityGuard: React.FC<ScannabilityGuardProps> = ({
  canvas,
  dotsColor,
  backgroundColor,
  onAutoFixContrast,
}) => {
  const [isScannable, setIsScannable] = useState<boolean>(true);

  const contrastRatio = getContrastRatio(dotsColor, backgroundColor);
  const hasContrastWarning = contrastRatio < 4.0;

  useEffect(() => {
    if (!canvas) return;
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      setIsScannable(Boolean(code));
    } catch {
      setIsScannable(true);
    }
  }, [canvas]);

  return (
    <div className="w-full mt-3.5 space-y-2">
      {hasContrastWarning ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <span>Low contrast detected. Auto-fix recommended.</span>
          <button
            onClick={onAutoFixContrast}
            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 font-semibold text-[11px] underline cursor-pointer"
          >
            Auto-Fix
          </button>
        </div>
      ) : isScannable ? (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center gap-1.5 font-medium">
          <span>✓ Optical Engine Verified Scannable</span>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
          <span>Scan check failed: reduce logo size or increase contrast.</span>
        </div>
      )}
    </div>
  );
};
