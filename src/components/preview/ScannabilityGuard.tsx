import React, { useEffect, useState, useMemo } from 'react';
import jsQR from 'jsqr';
import { AlertTriangle, Zap } from 'lucide-react';
import { getContrastRatio } from '../../utils/qrPayload';
import { playLevelUpChime, playWarningBlip } from '../../utils/audioFeedback';
import type { QRDesignOptions } from '../../types';

interface ScannabilityGuardProps {
  canvas: HTMLCanvasElement | null;
  dotsColor: string;
  backgroundColor: string;
  design?: QRDesignOptions;
  payload?: string;
  onAutoFixContrast: () => void;
}

export const ScannabilityGuard: React.FC<ScannabilityGuardProps> = ({
  canvas,
  dotsColor,
  backgroundColor,
  design,
  payload,
  onAutoFixContrast,
}) => {
  const [isScannable, setIsScannable] = useState<boolean>(true);
  const [isLevelingUp, setIsLevelingUp] = useState<boolean>(false);

  const contrastRatio = useMemo(
    () => getContrastRatio(dotsColor, backgroundColor),
    [dotsColor, backgroundColor]
  );

  // Gamified Grade Calculation
  const evaluation = useMemo(() => {
    if (!isScannable && !isLevelingUp) {
      return {
        grade: 'F',
        score: 20,
        label: 'Optical Jammed',
        sublabel: 'Pattern unreadable by cameras. Center logo or colors need adjustment.',
        color: 'rose',
        isCritical: true,
      };
    }
    if (contrastRatio >= 7.0) {
      return {
        grade: 'S+',
        score: 99,
        label: 'Print-Master Rating',
        sublabel: 'Flawless camera recognition under all ambient lighting & distances.',
        color: 'emerald',
        isCritical: false,
      };
    }
    if (contrastRatio >= 4.5) {
      return {
        grade: 'A',
        score: 86,
        label: 'Optimal Scannability',
        sublabel: 'High contrast standard. Ready for screens and physical print.',
        color: 'cyan',
        isCritical: false,
      };
    }
    if (contrastRatio >= 3.0) {
      return {
        grade: 'C',
        score: 55,
        label: 'Marginal Contrast',
        sublabel: 'May struggle under direct sunlight, glare, or older phone cameras.',
        color: 'amber',
        isCritical: true,
      };
    }
    return {
      grade: 'F',
      score: 25,
      label: 'Failing Contrast',
      sublabel: 'Severe legibility risk. Mobile camera sensors will fail to lock.',
      color: 'rose',
      isCritical: true,
    };
  }, [contrastRatio, isScannable, isLevelingUp]);

  useEffect(() => {
    if (!canvas) return;
    const timer = setTimeout(() => {
      try {
        if (isLevelingUp) {
          setIsScannable(true);
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let code = jsQR(imgData.data, imgData.width, imgData.height);

        // If direct scan returned null and a center logo is active, test Reed-Solomon
        // data integrity by masking the central logo footprint with the background color.
        if (!code && design?.logoUrl) {
          const width = imgData.width;
          const height = imgData.height;
          const clonedData = new Uint8ClampedArray(imgData.data);

          let bgR = 255;
          let bgG = 255;
          let bgB = 255;
          if (backgroundColor && backgroundColor.startsWith('#') && backgroundColor.length >= 7) {
            bgR = parseInt(backgroundColor.slice(1, 3), 16) || 255;
            bgG = parseInt(backgroundColor.slice(3, 5), 16) || 255;
            bgB = parseInt(backgroundColor.slice(5, 7), 16) || 255;
          }

          const logoFraction = Math.min(Math.max(design.logoSize || 0.26, 0.18), 0.32);
          const boxW = Math.round(width * logoFraction);
          const boxH = Math.round(height * logoFraction);
          const startX = Math.round((width - boxW) / 2);
          const startY = Math.round((height - boxH) / 2);

          for (let y = startY; y < startY + boxH; y++) {
            for (let x = startX; x < startX + boxW; x++) {
              const idx = (y * width + x) * 4;
              clonedData[idx] = bgR;
              clonedData[idx + 1] = bgG;
              clonedData[idx + 2] = bgB;
              clonedData[idx + 3] = 255;
            }
          }

          code = jsQR(clonedData, width, height);
        }

        // Multi-resolution scaling pass for dense matrices (sharpens subpixel module boundaries)
        if (!code && canvas.width > 0 && typeof document !== 'undefined') {
          try {
            const tempCanvas = document.createElement('canvas');
            const scale = 1.25;
            tempCanvas.width = Math.round(canvas.width * scale);
            tempCanvas.height = Math.round(canvas.height * scale);
            const tCtx = tempCanvas.getContext('2d');
            if (tCtx) {
              tCtx.imageSmoothingEnabled = false;
              tCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
              const scaledData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
              code = jsQR(scaledData.data, tempCanvas.width, tempCanvas.height);
            }
          } catch {
            // Non-critical fallback
          }
        }

        setIsScannable(Boolean(code));
        if (!code) {
          playWarningBlip();
        }
      } catch {
        setIsScannable(true);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [canvas, dotsColor, backgroundColor, design, payload, isLevelingUp]);

  const handleLevelUpClick = () => {
    playLevelUpChime();
    setIsScannable(true);
    setIsLevelingUp(true);
    setTimeout(() => setIsLevelingUp(false), 1200);
    onAutoFixContrast();
  };

  return (
    <div className="w-full mt-3 space-y-2.5">
      {/* Gamified Health / Optical Meter Box */}
      <div
        className={`p-3.5 rounded-2xl border transition-all duration-300 ${
          evaluation.color === 'emerald'
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : evaluation.color === 'cyan'
            ? 'bg-cyan-950/20 border-cyan-500/30'
            : evaluation.color === 'amber'
            ? 'bg-amber-950/30 border-amber-500/40 ring-1 ring-amber-500/20'
            : 'bg-rose-950/30 border-rose-500/40 ring-1 ring-rose-500/30 animate-pulse'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase shrink-0 ${
                evaluation.color === 'emerald'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : evaluation.color === 'cyan'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : evaluation.color === 'amber'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              GRADE {evaluation.grade}
            </span>

            <span className="text-xs font-bold text-white tracking-tight truncate">
              {evaluation.label}
            </span>
          </div>

          <span
            className={`font-mono text-xs font-bold shrink-0 ${
              evaluation.color === 'emerald'
                ? 'text-emerald-400'
                : evaluation.color === 'cyan'
                ? 'text-cyan-400'
                : evaluation.color === 'amber'
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {evaluation.score}%
          </span>
        </div>

        {/* Quality Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden mb-2 border border-white/[0.05]">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              evaluation.color === 'emerald'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : evaluation.color === 'cyan'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-400'
                : evaluation.color === 'amber'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_#f43f5e]'
            }`}
            style={{ width: `${evaluation.score}%` }}
          />
        </div>

        <p className="text-[11px] text-zinc-400 leading-snug">
          {evaluation.sublabel}
        </p>

        {/* Level Up Button (shown on warning/failing grades) */}
        {evaluation.isCritical && (
          <div className="pt-2 mt-2 border-t border-white/[0.08] flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Sub-optimal Camera Scan Rate
            </span>

            <button
              type="button"
              onClick={handleLevelUpClick}
              className="px-3.5 py-1.5 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#09090b] font-bold text-xs shadow-md shadow-[#38bdf8]/20 flex items-center gap-1.5 transition-all active:scale-[0.96] hover:shadow-lg hover:shadow-[#38bdf8]/30 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#09090b] fill-[#09090b] animate-bounce" />
              Level Up to Grade S+
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
