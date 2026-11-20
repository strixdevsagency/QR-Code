import React from 'react';
import { Ban, Wifi, MapPin, ShieldCheck, Star } from 'lucide-react';
import { playTactileClick } from '../../utils/audioFeedback';
import { generatePresetLogoSvg } from '../../utils/presetBadges';
import { ColorField } from '../ui/ColorField';
import type { QRDesignOptions, PresetLogoId } from '../../types';

interface LogoControlsProps {
  design: QRDesignOptions;
  setDesign: React.Dispatch<React.SetStateAction<QRDesignOptions>>;
}

interface PresetBadgeOption {
  id: PresetLogoId;
  label: string;
  renderIcon: (className: string) => React.ReactNode;
}

const PRESET_BADGES: PresetBadgeOption[] = [
  {
    id: 'wifi',
    label: 'Wi-Fi',
    renderIcon: (cls) => <Wifi className={cls} />,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.15c-.24.67-1.39 1.28-1.93 1.34-.51.06-1.16.1-3.34-.8-2.63-1.07-4.32-3.78-4.45-3.96-.13-.18-1.06-1.41-1.06-2.69s.66-1.91.9-2.17c.24-.26.52-.33.7-.33.17 0 .35.01.51.01.17 0 .4-.06.62.47.24.6.82 2 .89 2.15.07.15.12.31.02.51-.1.2-.15.3-.29.47-.14.17-.3.37-.43.51-.15.15-.29.3-.12.59.17.29.75 1.23 1.6 1.99 1.1 1 2.03 1.3 2.32 1.45.29.15.46.12.63-.07.17-.2.72-.85.92-1.14.19-.29.39-.24.65-.15.27.1 1.69.8 1.98.94.29.14.48.22.56.34.07.12.07.71-.17 1.38z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    id: 'maps',
    label: 'Maps',
    renderIcon: (cls) => <MapPin className={cls} aria-hidden="true" />,
  },
];

export const LogoControls: React.FC<LogoControlsProps> = ({ design, setDesign }) => {
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playTactileClick();
      const reader = new FileReader();
      reader.onload = () => {
        setDesign((prev) => ({
          ...prev,
          presetLogoId: null,
          logoUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (presetId: PresetLogoId) => {
    playTactileClick();
    const svg = generatePresetLogoSvg(
      presetId,
      design.dotsColor,
      design.backgroundColor,
      design.isGradient,
      design.dotsColorEnd,
      design.badgeColor
    );
    setDesign((p) => ({
      ...p,
      presetLogoId: presetId,
      logoUrl: svg,
    }));
  };

  const handleRemoveLogo = () => {
    playTactileClick();
    setDesign((p) => ({
      ...p,
      presetLogoId: null,
      badgeColor: undefined,
      logoUrl: undefined,
    }));
  };

  const hasActiveLogo = Boolean(design.logoUrl || design.presetLogoId);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Center Brand Badge
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Matches QR Ink
            </span>
          </div>
          {hasActiveLogo && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Ban className="w-3 h-3" />
              Clear Badge
            </button>
          )}
        </div>

        <p className="text-[11px] text-zinc-400 mb-3">
          Presets automatically adapt to your QR matrix ink color for an integrated monochrome aesthetic. For multi-color logos, upload below.
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {/* None / Reset option */}
          <button
            type="button"
            onClick={handleRemoveLogo}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.96] ${
              !hasActiveLogo
                ? 'border-white/30 bg-zinc-800 text-white shadow-md ring-1 ring-white/20'
                : 'border-white/[0.08] bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:border-white/[0.15]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                !hasActiveLogo
                  ? 'bg-zinc-700 text-white shadow-inner'
                  : 'bg-zinc-900 border border-white/[0.1] text-zinc-400'
              }`}
            >
              <Ban className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-medium ${!hasActiveLogo ? 'text-white font-semibold' : ''}`}>
              None
            </span>
          </button>

          {PRESET_BADGES.map((preset) => {
            const isSelected = design.presetLogoId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.96] ${
                  isSelected
                    ? 'border-[#38bdf8]/60 bg-[#38bdf8]/15 text-[#38bdf8] ring-1 ring-[#38bdf8]/40 shadow-lg shadow-[#38bdf8]/10'
                    : 'border-white/[0.08] bg-zinc-950/60 text-zinc-300 hover:text-white hover:border-white/[0.18] hover:bg-zinc-900/50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#38bdf8] text-[#09090b] shadow-md shadow-[#38bdf8]/20'
                      : 'bg-zinc-900 border border-white/10 text-zinc-200 hover:text-white'
                  }`}
                >
                  {preset.renderIcon('w-4 h-4')}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${isSelected ? 'text-[#38bdf8] font-semibold' : 'text-zinc-400'}`}>
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Upload Custom Brand Logo (PNG / SVG)
          </label>
          <span className="text-[10px] text-zinc-500">Supports full multi-color</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/[0.1] text-xs font-semibold text-white cursor-pointer transition-all shadow-sm active:scale-[0.98]">
            Choose Logo File
            <input
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={handleCustomLogoUpload}
              className="hidden"
            />
          </label>

          {design.logoUrl && !design.presetLogoId && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
            >
              Remove Logo
            </button>
          )}
        </div>

        {design.logoUrl && !design.presetLogoId && (
          <div className="mt-2.5 flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={design.logoUrl} alt="Custom Logo Preview" className="w-6 h-6 rounded object-contain bg-white/5 p-0.5" />
            <span className="text-[11px] text-zinc-300 font-medium">Custom multi-color logo loaded</span>
          </div>
        )}
      </div>

      {hasActiveLogo && design.presetLogoId && (
        <div className="pt-3 border-t border-white/[0.08] animate-pop-in">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Badge Ink Customization
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!design.badgeColor}
                onChange={(e) => {
                  playTactileClick();
                  if (e.target.checked) {
                    setDesign((p) => ({ ...p, badgeColor: undefined }));
                  } else {
                    setDesign((p) => ({ ...p, badgeColor: p.dotsColor }));
                  }
                }}
                className="rounded border-white/[0.15] text-blue-600 cursor-pointer accent-blue-500"
              />
              <span>Auto-match QR Ink</span>
            </label>
          </div>

          {design.badgeColor && (
            <div className="mt-2 animate-pop-in">
              <ColorField
                label="Custom Badge Fill Color"
                description="Overrides default QR matrix ink for center emblem"
                value={design.badgeColor}
                onChange={(color) => setDesign((p) => ({ ...p, badgeColor: color }))}
              />
            </div>
          )}
        </div>
      )}

      {hasActiveLogo && (
        <div className="pt-2 animate-pop-in">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Badge Proportion:</span>
            <span className="font-mono text-zinc-300 font-semibold">{Math.round(design.logoSize * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.16}
            max={0.30}
            step={0.02}
            value={design.logoSize || 0.26}
            onChange={(e) => setDesign((p) => ({ ...p, logoSize: Number(e.target.value) }))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Auto-locks to Reed-Solomon Level H (30% error redundancy) to guarantee instant scannability.
          </p>
        </div>
      )}
    </div>
  );
};
