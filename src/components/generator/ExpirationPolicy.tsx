import React from 'react';
import { ShieldCheck, Zap, Clock, Check } from 'lucide-react';
import { playTactileClick } from '../../utils/audioFeedback';
import type { ExpiryMode } from '../../types';

interface ExpirationPolicyProps {
  expiryMode: ExpiryMode;
  setExpiryMode: (mode: ExpiryMode) => void;
  timeLimitPreset: string;
  setTimeLimitPreset: (val: string) => void;
}

export const ExpirationPolicy: React.FC<ExpirationPolicyProps> = ({
  expiryMode,
  setExpiryMode,
  timeLimitPreset,
  setTimeLimitPreset,
}) => {
  const presets = [
    { id: '10m', label: '10 Mins' },
    { id: '1h', label: '1 Hour' },
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
  ];

  return (
    <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.08] space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Security & Expiration Policy
        </label>
        <span className="text-[11px] font-medium text-[#38bdf8] bg-[#38bdf8]/10 px-2.5 py-0.5 rounded-full border border-[#38bdf8]/20 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
          Client Encoded
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setExpiryMode('lifetime');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.98] hover:-translate-y-0.5 ${
            expiryMode === 'lifetime'
              ? 'border-[#38bdf8]/40 bg-[#38bdf8]/10 text-white ring-1 ring-[#38bdf8]/30 shadow-md shadow-[#38bdf8]/10'
              : 'border-white/[0.08] bg-zinc-900/40 text-zinc-300 hover:border-white/[0.15] hover:bg-zinc-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-xs text-[#38bdf8] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Permanent Static</span>
            </span>
            {expiryMode === 'lifetime' && <Check className="w-3.5 h-3.5 text-[#38bdf8] font-bold" />}
          </div>
          <p className="text-[11px] text-zinc-400 leading-snug">
            Direct raw data. Unlimited & permanent. Never expires, zero server dependencies.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setExpiryMode('one_time');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.98] hover:-translate-y-0.5 ${
            expiryMode === 'one_time'
              ? 'border-amber-500/40 bg-amber-500/10 text-white ring-1 ring-amber-500/30 shadow-md shadow-amber-500/10'
              : 'border-white/[0.08] bg-zinc-900/40 text-zinc-300 hover:border-white/[0.15] hover:bg-zinc-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>One-Time Scan</span>
            </span>
            {expiryMode === 'one_time' && <Check className="w-3.5 h-3.5 text-amber-400 font-bold" />}
          </div>
          <p className="text-[11px] text-zinc-400 leading-snug">
            Dynamic ephemeral token. Self-destructs after 1 scan. Single-use access credentials.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            playTactileClick();
            setExpiryMode('time_limited');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.98] hover:-translate-y-0.5 ${
            expiryMode === 'time_limited'
              ? 'border-sky-500/40 bg-sky-500/10 text-white ring-1 ring-sky-500/30 shadow-md shadow-sky-500/10'
              : 'border-white/[0.08] bg-zinc-900/40 text-zinc-300 hover:border-white/[0.15] hover:bg-zinc-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-xs text-sky-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Time-Limited</span>
            </span>
            {expiryMode === 'time_limited' && <Check className="w-3.5 h-3.5 text-sky-400 font-bold" />}
          </div>
          <p className="text-[11px] text-zinc-400 leading-snug">
            Dynamic redirect token. Automatically revokes after selected duration.
          </p>
        </button>
      </div>

      {expiryMode === 'time_limited' && (
        <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Expire After:</span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setTimeLimitPreset(preset.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                timeLimitPreset === preset.id
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
