import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { ColorField } from '../ui/ColorField';
import { playTactileClick } from '../../utils/audioFeedback';
import type { QRDesignOptions, DotType, CornerSquareType, CornerDotType } from '../../types';

interface StyleControlsProps {
  design: QRDesignOptions;
  setDesign: React.Dispatch<React.SetStateAction<QRDesignOptions>>;
}

const COLOR_PRESETS = [
  { name: 'Strix Cyan', dots: '#38bdf8', bg: '#09090b' },
  { name: 'Strix Black', dots: '#09090b', bg: '#ffffff' },
  { name: 'Royal Navy', dots: '#1e3a8a', bg: '#ffffff' },
  { name: 'Emerald Tech', dots: '#065f46', bg: '#ffffff' },
  { name: 'Imperial Violet', dots: '#581c87', bg: '#ffffff' },
  { name: 'Crimson Ruby', dots: '#991b1b', bg: '#ffffff' },
  { name: 'Cyber Teal', dots: '#0e7490', bg: '#ffffff' },
  { name: 'Sunset Amber', dots: '#b45309', bg: '#ffffff' },
];

export const StyleControls: React.FC<StyleControlsProps> = ({ design, setDesign }) => {
  const dotPatterns: { id: DotType; label: string }[] = [
    { id: 'rounded', label: 'Rounded' },
    { id: 'dots', label: 'Dots' },
    { id: 'classy', label: 'Classy' },
    { id: 'square', label: 'Square' },
    { id: 'extra-rounded', label: 'Smooth' },
  ];

  const cornerSquares: { id: CornerSquareType; label: string }[] = [
    { id: 'extra-rounded', label: 'Rounded' },
    { id: 'dot', label: 'Circle' },
    { id: 'square', label: 'Square' },
  ];

  const cornerDots: { id: CornerDotType; label: string }[] = [
    { id: 'dot', label: 'Circle Dot' },
    { id: 'square', label: 'Square Dot' },
  ];

  const handleSwapColors = () => {
    playTactileClick();
    setDesign((p) => ({
      ...p,
      dotsColor: p.backgroundColor,
      backgroundColor: p.dotsColor,
      cornerSquareColor: p.customEyeColors ? p.cornerSquareColor : p.backgroundColor,
      cornerDotColor: p.customEyeColors ? p.cornerDotColor : p.backgroundColor,
    }));
  };

  const handleDotsColorChange = (newColor: string) => {
    setDesign((p) => ({
      ...p,
      dotsColor: newColor,
      cornerSquareColor: p.customEyeColors ? p.cornerSquareColor : newColor,
      cornerDotColor: p.customEyeColors ? p.cornerDotColor : newColor,
    }));
  };

  return (
    <div className="space-y-5">
      {/* 1. Body Pattern */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Body Pattern Matrix
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {dotPatterns.map((pt) => (
            <button
              key={pt.id}
              type="button"
              onClick={() => {
                playTactileClick();
                setDesign((prev) => ({ ...prev, dotsType: pt.id }));
              }}
              className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition cursor-pointer text-center ${
                design.dotsType === pt.id
                  ? 'border-[#38bdf8]/50 bg-[#38bdf8]/15 text-[#38bdf8] shadow-sm ring-1 ring-[#38bdf8]/25 font-semibold'
                  : 'border-white/[0.08] bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:border-white/[0.15]'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Eye Corner Styles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Corner Eye Frame
          </label>
          <div className="grid grid-cols-3 gap-2">
            {cornerSquares.map((sq) => (
              <button
                key={sq.id}
                type="button"
                onClick={() => {
                  playTactileClick();
                  setDesign((prev) => ({ ...prev, cornerSquareType: sq.id }));
                }}
                className={`py-2 px-2 rounded-xl border text-xs font-medium transition cursor-pointer text-center ${
                  design.cornerSquareType === sq.id
                    ? 'border-[#38bdf8]/50 bg-[#38bdf8]/15 text-[#38bdf8] shadow-sm ring-1 ring-[#38bdf8]/25 font-semibold'
                    : 'border-white/[0.08] bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:border-white/[0.15]'
                }`}
              >
                {sq.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Corner Center Dot
          </label>
          <div className="grid grid-cols-2 gap-2">
            {cornerDots.map((cd) => (
              <button
                key={cd.id}
                type="button"
                onClick={() => {
                  playTactileClick();
                  setDesign((prev) => ({ ...prev, cornerDotType: cd.id }));
                }}
                className={`py-2 px-2 rounded-xl border text-xs font-medium transition cursor-pointer text-center ${
                  design.cornerDotType === cd.id
                    ? 'border-[#38bdf8]/50 bg-[#38bdf8]/15 text-[#38bdf8] shadow-sm ring-1 ring-[#38bdf8]/25 font-semibold'
                    : 'border-white/[0.08] bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:border-white/[0.15]'
                }`}
              >
                {cd.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Colors Section */}
      <div className="pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Color Customization
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 font-medium">
              Hex & Swatch
            </span>
          </div>
          <button
            type="button"
            onClick={handleSwapColors}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Swap foreground and background colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" />
            Invert
          </button>
        </div>

        {/* 1-Click Curated Palettes */}
        <div className="mb-3.5 p-2.5 rounded-xl bg-zinc-950/40 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-300">
              1-Click Brand Themes
            </span>
            <span className="text-[10px] text-zinc-500">Instant contrast verified</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {COLOR_PRESETS.map((preset) => {
              const isSelected =
                design.dotsColor.toLowerCase() === preset.dots.toLowerCase() &&
                design.backgroundColor.toLowerCase() === preset.bg.toLowerCase();
              return (
                <button
                  key={preset.name}
                  type="button"
                  title={preset.name}
                  onClick={() => {
                    playTactileClick();
                    setDesign((p) => ({
                      ...p,
                      dotsColor: preset.dots,
                      backgroundColor: preset.bg,
                      cornerSquareColor: p.customEyeColors ? p.cornerSquareColor : preset.dots,
                      cornerDotColor: p.customEyeColors ? p.cornerDotColor : preset.dots,
                    }));
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 active:scale-95 ${
                    isSelected
                      ? 'border-[#38bdf8] bg-[#38bdf8]/15 ring-1 ring-[#38bdf8]/40 shadow-sm shadow-[#38bdf8]/20'
                      : 'border-white/[0.08] bg-zinc-900/60 hover:bg-zinc-850 hover:border-white/[0.18]'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-black/30 shadow-inner flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: preset.bg }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: preset.dots }}
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 font-medium truncate w-full">
                    {preset.name.split(' ')[1] || preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Foreground & Background Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ColorField
            label="QR Dots Matrix"
            description="Foreground body modules"
            value={design.dotsColor}
            onChange={handleDotsColorChange}
          />
          <ColorField
            label="Canvas Background"
            description="Backdrop canvas surface"
            value={design.backgroundColor}
            onChange={(color) => setDesign((p) => ({ ...p, backgroundColor: color }))}
            allowTransparent
          />
        </div>

        {/* Separate Eye Color Controls */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="customEyeToggle"
              checked={Boolean(design.customEyeColors)}
              onChange={(e) => {
                const checked = e.target.checked;
                setDesign((p) => ({
                  ...p,
                  customEyeColors: checked,
                  cornerSquareColor: checked ? (p.cornerSquareColor || p.dotsColor) : p.dotsColor,
                  cornerDotColor: checked ? (p.cornerDotColor || p.dotsColor) : p.dotsColor,
                }));
              }}
              className="rounded bg-zinc-900 border-white/20 text-[#38bdf8] focus:ring-[#38bdf8] cursor-pointer accent-[#38bdf8]"
            />
            <label htmlFor="customEyeToggle" className="text-xs text-zinc-300 font-medium cursor-pointer select-none">
              Customize Finder Eye Colors Separately
            </label>
          </div>

          {design.customEyeColors && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5 border-l-2 border-[#38bdf8]/40 animate-pop-in">
              <ColorField
                label="Eye Outer Frame"
                description="3 corner square borders"
                value={design.cornerSquareColor || design.dotsColor}
                onChange={(color) => setDesign((p) => ({ ...p, cornerSquareColor: color }))}
              />
              <ColorField
                label="Eye Inner Center"
                description="3 corner center nodes"
                value={design.cornerDotColor || design.dotsColor}
                onChange={(color) => setDesign((p) => ({ ...p, cornerDotColor: color }))}
              />
            </div>
          )}
        </div>

        {/* Gradient Options */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="gradientToggle"
                checked={Boolean(design.isGradient)}
                onChange={(e) => setDesign((p) => ({ ...p, isGradient: e.target.checked }))}
                className="rounded bg-zinc-900 border-white/20 text-[#38bdf8] focus:ring-[#38bdf8] cursor-pointer accent-[#38bdf8]"
              />
              <label htmlFor="gradientToggle" className="text-xs text-zinc-300 font-medium cursor-pointer select-none">
                2-Color Gradient Effect
              </label>
            </div>

            {design.isGradient && (
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => setDesign((p) => ({ ...p, gradientType: 'linear' }))}
                  className={`px-2 py-0.5 rounded transition ${
                    design.gradientType !== 'radial' ? 'bg-[#38bdf8]/20 text-[#38bdf8] font-bold' : 'text-zinc-400'
                  }`}
                >
                  Linear
                </button>
                <button
                  type="button"
                  onClick={() => setDesign((p) => ({ ...p, gradientType: 'radial' }))}
                  className={`px-2 py-0.5 rounded transition ${
                    design.gradientType === 'radial' ? 'bg-[#38bdf8]/20 text-[#38bdf8] font-bold' : 'text-zinc-400'
                  }`}
                >
                  Radial
                </button>
              </div>
            )}
          </div>

          {design.isGradient && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 animate-pop-in">
              <ColorField
                label="Gradient Start"
                description="Primary dot tone"
                value={design.dotsColor}
                onChange={handleDotsColorChange}
              />
              <ColorField
                label="Gradient End"
                description="Secondary dot tone"
                value={design.dotsColorEnd || '#0284c7'}
                onChange={(color) => setDesign((p) => ({ ...p, dotsColorEnd: color }))}
              />
            </div>
          )}
        </div>

        {/* Quiet Zone Margin */}
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Print Safe Margin (Quiet Zone):</span>
            <span className="font-mono text-zinc-300 font-semibold">{design.margin}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={design.margin}
            onChange={(e) => setDesign((p) => ({ ...p, margin: Number(e.target.value) }))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
          />
        </div>
      </div>
    </div>
  );
};
