import React, { useState, useEffect } from 'react';
import { playTactileClick } from '../../utils/audioFeedback';

export interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
  allowTransparent?: boolean;
  className?: string;
}

export const ColorField: React.FC<ColorFieldProps> = ({
  label,
  value,
  onChange,
  description,
  allowTransparent = false,
  className = '',
}) => {
  const [localText, setLocalText] = useState(value);

  useEffect(() => {
    setLocalText(value === 'transparent' ? 'TRANS' : value);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.trim();
    if (input.toLowerCase() === 'transparent' || input.toLowerCase() === 'trans') {
      if (allowTransparent) {
        setLocalText('TRANS');
        onChange('transparent');
        return;
      }
    }
    if (!input.startsWith('#') && input.length > 0) {
      input = '#' + input;
    }
    setLocalText(input);
    if (/^#[0-9A-Fa-f]{6}$/.test(input) || /^#[0-9A-Fa-f]{3}$/.test(input)) {
      onChange(input);
    }
  };

  const handleBlur = () => {
    if (localText === 'TRANS' && allowTransparent) {
      return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(localText) && !/^#[0-9A-Fa-f]{3}$/.test(localText)) {
      setLocalText(value === 'transparent' ? 'TRANS' : value);
    }
  };

  const isTransparent = value === 'transparent';

  const validHexForPicker =
    value.startsWith('#') && (value.length === 7 || value.length === 4)
      ? value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value
      : '#ffffff';

  return (
    <div
      className={`p-3 rounded-xl bg-zinc-950/60 border border-white/[0.08] hover:border-[#38bdf8]/30 transition-all flex items-center justify-between gap-3 ${className}`}
    >
      <div className="min-w-0 flex-1">
        <span className="text-xs text-zinc-300 font-medium block truncate">{label}</span>
        {description && <span className="text-[10px] text-zinc-500 block truncate">{description}</span>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {allowTransparent && (
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onChange(isTransparent ? '#ffffff' : 'transparent');
            }}
            className={`px-2 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
              isTransparent
                ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-white/10'
            }`}
            title="Toggle transparent canvas background"
          >
            {isTransparent ? 'Clear' : 'Trans'}
          </button>
        )}

        <label
          className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shrink-0 ring-1 ring-black/40"
          title="Open native color picker"
        >
          <input
            type="color"
            value={validHexForPicker}
            onChange={(e) => {
              playTactileClick();
              onChange(e.target.value);
            }}
            className="absolute -inset-2 w-16 h-16 opacity-0 cursor-pointer"
          />
          {isTransparent ? (
            <div className="w-full h-full bg-[linear-gradient(45deg,#475569_25%,transparent_25%),linear-gradient(-45deg,#475569_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#475569_75%),linear-gradient(-45deg,transparent_75%,#475569_75%)] [background-size:6px_6px] [background-position:0_0,0_3px,3px_-3px,-3px_0px] bg-zinc-800" />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: value }} />
          )}
        </label>
        <input
          type="text"
          value={localText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder="#000000"
          maxLength={7}
          spellCheck={false}
          className="w-20 px-2 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-zinc-200 uppercase tracking-wider focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/40 transition-all text-center"
        />
      </div>
    </div>
  );
};
