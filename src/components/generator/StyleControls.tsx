import React from 'react';
import type { QRDesignOptions, DotType, CornerSquareType, CornerDotType } from '../../types';

interface StyleControlsProps {
  design: QRDesignOptions;
  setDesign: React.Dispatch<React.SetStateAction<QRDesignOptions>>;
}

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

  return (
    <div className="space-y-5">
      {/* 1. Body Pattern */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Body Pattern Matrix
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {dotPatterns.map((pt) => (
            <button
              key={pt.id}
              type="button"
              onClick={() => setDesign((prev) => ({ ...prev, dotsType: pt.id }))}
              className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                design.dotsType === pt.id
                  ? 'border-blue-600 bg-blue-950/40 text-white'
                  : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-slate-200'
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
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Corner Eye Frame
          </label>
          <div className="grid grid-cols-3 gap-2">
            {cornerSquares.map((sq) => (
              <button
                key={sq.id}
                type="button"
                onClick={() => setDesign((prev) => ({ ...prev, cornerSquareType: sq.id }))}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                  design.cornerSquareType === sq.id
                    ? 'border-blue-600 bg-blue-950/40 text-white'
                    : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-slate-200'
                }`}
              >
                {sq.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Corner Center Dot
          </label>
          <div className="grid grid-cols-2 gap-2">
            {cornerDots.map((cd) => (
              <button
                key={cd.id}
                type="button"
                onClick={() => setDesign((prev) => ({ ...prev, cornerDotType: cd.id }))}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                  design.cornerDotType === cd.id
                    ? 'border-blue-600 bg-blue-950/40 text-white'
                    : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-slate-200'
                }`}
              >
                {cd.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Color Palettes & Contrast */}
      <div className="pt-3 border-t border-slate-800">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Color Scheme
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">QR Dots & Eyes:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={design.dotsColor}
                onChange={(e) =>
                  setDesign((p) => ({
                    ...p,
                    dotsColor: e.target.value,
                    cornerSquareColor: e.target.value,
                    cornerDotColor: e.target.value,
                  }))
                }
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-300">{design.dotsColor}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Canvas Background:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={design.backgroundColor}
                onChange={(e) => setDesign((p) => ({ ...p, backgroundColor: e.target.value }))}
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-300">{design.backgroundColor}</span>
            </div>
          </div>
        </div>

        {/* Gradient Switch */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={design.isGradient}
              onChange={(e) => setDesign((p) => ({ ...p, isGradient: e.target.checked }))}
              className="rounded border-slate-700 text-blue-600 cursor-pointer"
            />
            <span>2-Color Linear Gradient</span>
          </label>
          {design.isGradient && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Gradient End:</span>
              <input
                type="color"
                value={design.dotsColorEnd || '#2563eb'}
                onChange={(e) => setDesign((p) => ({ ...p, dotsColorEnd: e.target.value }))}
                className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Quiet Zone Margin */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Print Safe Margin (Quiet Zone):</span>
            <span className="font-mono text-blue-400">{design.margin}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={design.margin}
            onChange={(e) => setDesign((p) => ({ ...p, margin: Number(e.target.value) }))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
};
