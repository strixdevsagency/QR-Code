import React from 'react';
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
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Security & Expiration Policy
        </label>
        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          100% Free
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => setExpiryMode('lifetime')}
          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
            expiryMode === 'lifetime'
              ? 'border-indigo-500 bg-indigo-500/15 text-white ring-1 ring-indigo-500'
              : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-emerald-400">● Permanent Static</span>
            {expiryMode === 'lifetime' && <span className="text-xs text-indigo-400 font-bold">✓</span>}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Direct raw data. Never expires, zero servers. Ideal for print runs.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setExpiryMode('one_time')}
          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
            expiryMode === 'one_time'
              ? 'border-amber-500 bg-amber-500/15 text-white ring-1 ring-amber-500'
              : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-amber-400">▲ One-Time Scan</span>
            {expiryMode === 'one_time' && <span className="text-xs text-amber-400 font-bold">✓</span>}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Burns after 1 scan. Self-destructs for VIP coupons or secret access.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setExpiryMode('time_limited')}
          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
            expiryMode === 'time_limited'
              ? 'border-cyan-500 bg-cyan-500/15 text-white ring-1 ring-cyan-500'
              : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-cyan-400">⏱ Time-Limited</span>
            {expiryMode === 'time_limited' && <span className="text-xs text-cyan-400 font-bold">✓</span>}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Expires after selected duration. Ideal for flash promos and events.
          </p>
        </button>
      </div>

      {expiryMode === 'time_limited' && (
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Expire After:</span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setTimeLimitPreset(preset.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                timeLimitPreset === preset.id
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
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
