import React, { useState } from 'react';
import {
  Calendar,
  EyeOff,
  ShieldCheck,
  Building2,
  Sparkles,
  Layout,
  Check,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import type { AdSlotConfig, AnalyticsConfig } from '../../types';
import { db } from '../../services/db';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

export const AdSenseManager: React.FC = () => {
  const [analyticsConfig, setAnalyticsConfig] = useState<AnalyticsConfig>(() => db.getAnalyticsConfig());
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>(() => db.getAdSlots());
  const [activeWireframeSlot, setActiveWireframeSlot] = useState<string>('leaderboard');
  const [saved, setSaved] = useState<boolean>(false);

  const handleUpdateSlot = (id: string, updates: Partial<AdSlotConfig>) => {
    setAdSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleUpdateDirectSponsor = (id: string, updates: any) => {
    setAdSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const currentSponsor = s.directSponsor || {
          sponsorName: '',
          sponsorUrl: '',
          imageUrl: '',
          customHtml: '',
          endDate: '',
          isActive: false,
        };
        return {
          ...s,
          directSponsor: { ...currentSponsor, ...updates },
        };
      })
    );
  };

  const handleSaveAll = () => {
    playTactileClick();
    db.saveAnalyticsConfig(analyticsConfig);
    adSlots.forEach((slot) => db.updateAdSlot(slot.id, slot));
    setSaved(true);
    playVictoryFanfare();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-pop-in">
      
      {/* 1. Placement Wireframe & Interactive Map */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase tracking-wider">
              Visual Topology
            </span>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              Interactive Ad Placement Wireframe
            </h3>
            <p className="text-xs text-zinc-400">
              Click any placement to inspect and configure its live banner dimensions and direct sponsorship overrides.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-3 py-1 rounded-xl border border-white/[0.06] shrink-0">
            Selected: <strong className="text-blue-400">{activeWireframeSlot}</strong>
          </span>
        </div>

        {/* Miniature Site Layout Schematic */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.08] space-y-3">
          {/* Header wireframe bar */}
          <div className="w-full h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-between px-3 text-[10px] text-zinc-400 font-mono">
            <span>[Header · Strix QR]</span>
            <span>qr.strixdevs.com</span>
          </div>

          {/* Slot 1: Leaderboard */}
          <button
            type="button"
            onClick={() => setActiveWireframeSlot('leaderboard')}
            className={`w-full py-2.5 px-3 rounded-lg border text-xs font-mono font-semibold flex items-center justify-between transition cursor-pointer ${
              activeWireframeSlot === 'leaderboard'
                ? 'border-blue-500 bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/30'
                : 'border-dashed border-white/20 bg-zinc-900/50 text-zinc-400 hover:border-white/40'
            }`}
          >
            <span>Top Header Leaderboard (728x90)</span>
            <span className="text-[10px] uppercase font-bold text-emerald-400">Above Fold</span>
          </button>

          {/* Main 2-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Left 2 cols: Generator & Infeed */}
            <div className="md:col-span-2 space-y-3">
              <div className="h-28 rounded-lg bg-zinc-900 border border-white/10 p-3 text-[11px] text-zinc-400 flex flex-col justify-between">
                <span>[Main Generator Workspace — Payload, Style, Logo]</span>
                <span className="text-[10px] text-zinc-500 font-mono">Interactive Form & Live Matrix</span>
              </div>

              {/* Slot 3: Infeed Banner */}
              <button
                type="button"
                onClick={() => setActiveWireframeSlot('infeed')}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-mono font-semibold flex items-center justify-between transition cursor-pointer ${
                  activeWireframeSlot === 'infeed'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/30'
                    : 'border-dashed border-white/20 bg-zinc-900/50 text-zinc-400 hover:border-white/40'
                }`}
              >
                <span>Mid-Page In-Feed Banner (Responsive)</span>
                <span className="text-[10px] uppercase text-zinc-400">Mid-Fold</span>
              </button>
            </div>

            {/* Right 1 col: Preview & Sidebar Slot */}
            <div className="space-y-3">
              <div className="h-28 rounded-lg bg-zinc-900 border border-white/10 p-3 text-[11px] text-zinc-400 flex flex-col justify-between">
                <span>[Live QR Preview Canvas]</span>
                <span className="text-[10px] text-emerald-400 font-mono">Grade S+ Guard</span>
              </div>

              {/* Slot 2: Sidebar Slot */}
              <button
                type="button"
                onClick={() => setActiveWireframeSlot('sidebar')}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-mono font-semibold flex items-center justify-between transition cursor-pointer ${
                  activeWireframeSlot === 'sidebar'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/30'
                    : 'border-dashed border-white/20 bg-zinc-900/50 text-zinc-400 hover:border-white/40'
                }`}
              >
                <span>Preview Sticky Sidebar (300x250)</span>
                <span className="text-[10px] uppercase text-indigo-400">High CTR</span>
              </button>
            </div>
          </div>

          {/* Slot 4: Interstitial Modal */}
          <button
            type="button"
            onClick={() => setActiveWireframeSlot('modal')}
            className={`w-full py-2 px-3 rounded-lg border text-xs font-mono font-semibold flex items-center justify-between transition cursor-pointer ${
              activeWireframeSlot === 'modal'
                ? 'border-blue-500 bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/30'
                : 'border-dashed border-white/20 bg-zinc-900/50 text-zinc-400 hover:border-white/40'
            }`}
          >
            <span>Download Compilation Countdown Interstitial (300x250 Modal)</span>
            <span className="text-[10px] uppercase text-amber-400">High Engagement</span>
          </button>
        </div>
      </div>

      {/* 2. Global Google AdSense Network Toggle Card */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Automated Monetization Fallback
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Google AdSense Network Engine
            </h3>
            <p className="text-xs text-zinc-400">
              When direct paid sponsors are inactive or expired, slots automatically fall back to Google AdSense script tags.
            </p>
          </div>

          <label className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-white/[0.08] text-xs font-semibold text-zinc-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={analyticsConfig.adSenseEnabled}
              onChange={(e) => {
                playTactileClick();
                setAnalyticsConfig({ ...analyticsConfig, adSenseEnabled: e.target.checked });
              }}
              className="rounded border-white/20 text-blue-600 accent-blue-500 cursor-pointer"
            />
            <span>Enable AdSense Fallback</span>
          </label>
        </div>

        <div className="pt-2">
          <Input
            label="AdSense Publisher Client ID"
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            value={analyticsConfig.adSensePublisherId}
            onChange={(e) =>
              setAnalyticsConfig({ ...analyticsConfig, adSensePublisherId: e.target.value })
            }
            hint="Found in your Google AdSense account under Account > Settings > Account Information."
          />
        </div>
      </div>

      {/* 3. Individual Ad Slots & Direct Sponsor Campaigns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Slot Configurations & Direct Paid Sponsorships
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            {adSlots.length} Configured Placements
          </span>
        </div>

        {adSlots.map((slot) => {
          const sponsor = slot.directSponsor;
          const isExpired = sponsor?.endDate ? new Date(sponsor.endDate).getTime() < Date.now() : false;
          const isHighlighted = activeWireframeSlot === slot.id;

          return (
            <div
              key={slot.id}
              className={`p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border transition-all space-y-5 shadow-xl ${
                isHighlighted
                  ? 'border-blue-500/60 ring-2 ring-blue-500/20'
                  : 'border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white tracking-tight">{slot.name}</h4>
                    <span className="text-xs text-blue-400 font-mono px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                      {slot.dimensions}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{slot.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* Hide if no sponsor switch */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-white/[0.08] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={slot.hideWhenNoSponsor || false}
                      onChange={(e) => {
                        playTactileClick();
                        handleUpdateSlot(slot.id, { hideWhenNoSponsor: e.target.checked });
                      }}
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300 font-medium">Hide if No Sponsor</span>
                  </label>

                  {/* Slot Enabled switch */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-white/[0.08] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={slot.enabled}
                      onChange={(e) => {
                        playTactileClick();
                        handleUpdateSlot(slot.id, { enabled: e.target.checked });
                      }}
                      className="rounded accent-blue-500 cursor-pointer"
                    />
                    <span className="text-zinc-200 font-medium">Slot Enabled</span>
                  </label>
                </div>
              </div>

              {/* Direct Sponsor Campaign Card (NO TEXT COLLISIONS) */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/80 border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Direct Paid Sponsor Campaign
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Takes priority over Google AdSense when active
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-semibold cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={sponsor?.isActive || false}
                      onChange={(e) => {
                        playTactileClick();
                        handleUpdateDirectSponsor(slot.id, { isActive: e.target.checked });
                      }}
                      className="rounded accent-emerald-500 cursor-pointer"
                    />
                    <span className={sponsor?.isActive ? 'text-emerald-400' : 'text-zinc-400'}>
                      {sponsor?.isActive ? '● Sponsor Active' : '○ Inactive'}
                    </span>
                  </label>
                </div>

                {sponsor?.isActive && (
                  <div className="space-y-4 pt-1 animate-pop-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Sponsor Company Name"
                        placeholder="e.g. Apex POS Systems Inc."
                        value={sponsor?.sponsorName || ''}
                        onChange={(e) => handleUpdateDirectSponsor(slot.id, { sponsorName: e.target.value })}
                      />
                      <Input
                        label="Click Destination URL"
                        placeholder="https://sponsor.example.com?ref=strixqr"
                        value={sponsor?.sponsorUrl || ''}
                        onChange={(e) => handleUpdateDirectSponsor(slot.id, { sponsorUrl: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Banner Graphic URL"
                        placeholder="https://example.com/assets/banner.png"
                        value={sponsor?.imageUrl || ''}
                        onChange={(e) => handleUpdateDirectSponsor(slot.id, { imageUrl: e.target.value })}
                      />

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span>Campaign Expiration (Auto-Shutoff Date)</span>
                        </label>
                        <input
                          type="date"
                          value={sponsor?.endDate ? sponsor.endDate.split('T')[0] : ''}
                          onChange={(e) =>
                            handleUpdateDirectSponsor(slot.id, {
                              endDate: e.target.value ? new Date(e.target.value).toISOString() : '',
                            })
                          }
                          className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {sponsor?.endDate && (
                      <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] text-xs font-mono flex items-center justify-between">
                        <span className="text-zinc-400">Campaign Schedule:</span>
                        {isExpired ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            EXPIRED on {new Date(sponsor.endDate).toLocaleDateString()} (Auto-Hidden)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            Active through {new Date(sponsor.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Standard AdSense Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="AdSense Client Tag ID"
                  placeholder="ca-pub-XXXXXXXXXXXX"
                  value={slot.adClient}
                  onChange={(e) => handleUpdateSlot(slot.id, { adClient: e.target.value })}
                />
                <Input
                  label="AdSense Slot ID"
                  placeholder="1234567890"
                  value={slot.adSlot}
                  onChange={(e) => handleUpdateSlot(slot.id, { adSlot: e.target.value })}
                />
              </div>

              {/* Raw HTML / Embed Code */}
              <Textarea
                label="Custom Raw HTML / Script Tag (Optional)"
                rows={2}
                placeholder="<a href='https://partner.com'><img src='...' /></a>"
                value={slot.customHtml || ''}
                onChange={(e) => handleUpdateSlot(slot.id, { customHtml: e.target.value })}
              />
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          onClick={handleSaveAll}
          className="py-3 px-6 font-bold text-sm shadow-xl shadow-[#38bdf8]/20 active:scale-[0.99] cursor-pointer"
        >
          {saved ? '✓ Monetization & Sponsor Settings Saved!' : 'Save Monetization & Sponsor Configurations'}
        </Button>
      </div>
    </div>
  );
};
