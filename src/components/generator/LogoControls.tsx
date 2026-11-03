import React from 'react';
import type { QRDesignOptions } from '../../types';

interface LogoControlsProps {
  design: QRDesignOptions;
  setDesign: React.Dispatch<React.SetStateAction<QRDesignOptions>>;
}

export const LogoControls: React.FC<LogoControlsProps> = ({ design, setDesign }) => {
  const presetLogos = [
    { label: 'WiFi', url: 'https://cdn-icons-png.flaticon.com/512/93/93158.png' },
    { label: 'WhatsApp', url: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png' },
    { label: 'Instagram', url: 'https://cdn-icons-png.flaticon.com/512/3955/3955024.png' },
    { label: 'Google Maps', url: 'https://cdn-icons-png.flaticon.com/512/854/854878.png' },
    { label: 'Star / Review', url: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png' },
  ];

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setDesign((prev) => ({
          ...prev,
          logoUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Preset Quick Logos
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {presetLogos.map((lg) => (
            <button
              key={lg.label}
              type="button"
              onClick={() => setDesign((p) => ({ ...p, logoUrl: lg.url }))}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                design.logoUrl === lg.url
                  ? 'border-blue-600 bg-blue-950/40 text-blue-300 ring-1 ring-blue-600'
                  : 'border-slate-800 bg-[#090d16] text-slate-300 hover:border-slate-700'
              }`}
            >
              <img src={lg.url} alt={lg.label} className="w-5 h-5 object-contain" />
              <span className="text-[11px] font-medium">{lg.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Or Upload Company Brand Logo (PNG / SVG)
        </label>
        <div className="flex items-center gap-3">
          <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-white cursor-pointer transition">
            Choose Logo File
            <input
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={handleCustomLogoUpload}
              className="hidden"
            />
          </label>

          {design.logoUrl && (
            <button
              type="button"
              onClick={() => setDesign((p) => ({ ...p, logoUrl: undefined }))}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
            >
              Remove Logo
            </button>
          )}
        </div>
      </div>

      {design.logoUrl && (
        <div className="pt-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Logo Proportion:</span>
            <span className="font-mono text-blue-400">{Math.round(design.logoSize * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={0.38}
            step={0.02}
            value={design.logoSize}
            onChange={(e) => setDesign((p) => ({ ...p, logoSize: Number(e.target.value) }))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Auto-locks to Error Correction Level H (30% redundancy) to guarantee scannability.
          </p>
        </div>
      )}
    </div>
  );
};
