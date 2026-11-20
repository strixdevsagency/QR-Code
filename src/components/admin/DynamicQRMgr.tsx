import React, { useState, useMemo } from 'react';
import {
  Radio,
  Search,
  Flame,
  Clock,
  RotateCcw,
  Ban,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { db } from '../../services/db';
import type { SavedQRCode } from '../../types';
import { Button } from '../ui/Button';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

export const DynamicQRMgr: React.FC = () => {
  const [qrs, setQrs] = useState<SavedQRCode[]>(() =>
    db.getAllQRs().filter((q) => q.isDynamic)
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'burned' | 'revoked'>('all');

  const refreshList = () => {
    setQrs(db.getAllQRs().filter((q) => q.isDynamic));
  };

  const handleToggleRevoke = (id: string) => {
    playTactileClick();
    db.toggleRevokeQR(id);
    refreshList();
  };

  const handleResetScans = (id: string) => {
    playTactileClick();
    const qr = db.getQRById(id);
    if (qr && qr.dynamicConfig) {
      db.updateQRCode(id, {
        dynamicConfig: {
          ...qr.dynamicConfig,
          currentScans: 0,
          isBurned: false,
          burnedAt: undefined,
        },
      });
      refreshList();
      playVictoryFanfare();
    }
  };

  const filteredQRs = useMemo(() => {
    return qrs.filter((q) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        q.title.toLowerCase().includes(query) ||
        q.id.toLowerCase().includes(query) ||
        (q.dynamicConfig?.destinationPayload || '').toLowerCase().includes(query);

      if (!matchesSearch) return false;

      const cfg = q.dynamicConfig;
      if (statusFilter === 'revoked') return cfg?.isRevoked;
      if (statusFilter === 'burned') return cfg?.isBurned;
      if (statusFilter === 'active') return !cfg?.isBurned && !cfg?.isRevoked;
      return true;
    });
  }, [qrs, search, statusFilter]);

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Header card */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[11px] font-semibold">
          <Radio className="w-3.5 h-3.5" />
          Real-Time Resolution Telemetry
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Ephemeral & Dynamic Token Authority
        </h3>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          Monitor one-time burn codes, self-destructing links, and time-limited QR vouchers. Revoke suspicious tokens instantly or refresh scan counters for testing.
        </p>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tokens by ID, title, or destination URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950/80 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-950/80 rounded-xl border border-white/[0.08]">
          {(
            [
              { id: 'all', label: 'All Tokens' },
              { id: 'active', label: 'Active' },
              { id: 'burned', label: 'Burned' },
              { id: 'revoked', label: 'Revoked' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                playTactileClick();
                setStatusFilter(t.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === t.id
                  ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Token List */}
      {filteredQRs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-white/[0.08]">
          <p className="text-zinc-400 text-xs">No dynamic tokens match the current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredQRs.map((qr) => {
            const cfg = qr.dynamicConfig;
            const max = cfg?.maxScans || 1;
            const cur = cfg?.currentScans || 0;
            const pct = Math.min(100, Math.round((cur / max) * 100));

            return (
              <div
                key={qr.id}
                className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.16] transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-black/20"
              >
                {/* Info & Telemetry */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-tight">{qr.title}</h4>
                    <span className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-950 border border-white/[0.06]">
                      {qr.id}
                    </span>

                    {/* Status Badge */}
                    {cfg?.isRevoked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[11px] font-semibold border border-zinc-700 flex items-center gap-1">
                        <Ban className="w-3 h-3 text-zinc-400" /> Revoked
                      </span>
                    ) : cfg?.isBurned ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 text-[11px] font-semibold border border-rose-500/20 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-400 animate-pulse" /> Burned
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                      </span>
                    )}
                  </div>

                  {/* Destination & Mode */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span>
                      Mode: <strong className="text-indigo-400 font-mono uppercase">{cfg?.mode}</strong>
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-sm font-mono text-zinc-300">
                      Destination: {cfg?.destinationPayload || qr.payload}
                    </span>
                  </div>

                  {/* Scan Progress Bar */}
                  <div className="max-w-xs space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                      <span>Scan Quota:</span>
                      <span className="text-white font-semibold">{cur} / {max} scans ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/[0.06]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          cur >= max ? 'bg-rose-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleResetScans(qr.id)}
                    className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                    title="Reset Scans to 0"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                    <span>Reset Scans</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleRevoke(qr.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-[0.98] cursor-pointer ${
                      cfg?.isRevoked
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {cfg?.isRevoked ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Un-revoke</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
