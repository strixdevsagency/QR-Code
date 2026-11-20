import React, { useState } from 'react';
import { Activity, ShieldCheck, Check, AlertCircle, Sparkles } from 'lucide-react';
import type { AnalyticsConfig as IAnalyticsConfig } from '../../types';
import { db } from '../../services/db';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

export const AnalyticsConfig: React.FC = () => {
  const [config, setConfig] = useState<IAnalyticsConfig>(() => db.getAnalyticsConfig());
  const [saved, setSaved] = useState<boolean>(false);

  const isGAValid = Boolean(!config.googleAnalyticsId || /^G-[A-Z0-9]+$/i.test(config.googleAnalyticsId));
  const isGTMValid = Boolean(!config.googleTagManagerId || /^GTM-[A-Z0-9]+$/i.test(config.googleTagManagerId));

  const handleSave = () => {
    playTactileClick();
    db.saveAnalyticsConfig(config);
    setSaved(true);
    playVictoryFanfare();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-pop-in">
      <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[11px] font-semibold">
          <Activity className="w-3.5 h-3.5" />
          Privacy-First Telemetry
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Google Analytics 4 & Google Tag Manager Pipeline
        </h3>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          Embed enterprise measurement tags. Strix QR executes static and dynamic matrix encoding client-side; GA4 collects high-level page views with anonymized IP telemetry.
        </p>
      </div>

      {/* GA4 Card */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h4 className="text-sm font-bold text-white">Google Analytics 4 (GA4) Stream</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Captures organic visitor counts, referral origins, and tool usage events.</p>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-white/[0.08] text-xs font-semibold text-zinc-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.googleAnalyticsEnabled}
              onChange={(e) => {
                playTactileClick();
                setConfig({ ...config, googleAnalyticsEnabled: e.target.checked });
              }}
              className="rounded accent-blue-500 cursor-pointer"
            />
            <span>Enable GA4 Tag</span>
          </label>
        </div>

        <div className="space-y-2">
          <Input
            label="Measurement ID"
            placeholder="G-XXXXXXXXXX"
            value={config.googleAnalyticsId}
            onChange={(e) => setConfig({ ...config, googleAnalyticsId: e.target.value.trim().toUpperCase() })}
            hint="Find in Google Analytics Admin > Data Streams > Web Stream Details."
          />
          {config.googleAnalyticsId && (
            <div className="text-[11px] font-mono flex items-center gap-1.5 pt-1">
              {isGAValid ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Valid GA4 Measurement Format
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Expected format: G-XXXXXXXXXX
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* GTM Card */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h4 className="text-sm font-bold text-white">Google Tag Manager (GTM) Container</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Deploy custom marketing scripts, conversion triggers, or affiliate pixels.</p>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-white/[0.08] text-xs font-semibold text-zinc-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.googleTagManagerEnabled}
              onChange={(e) => {
                playTactileClick();
                setConfig({ ...config, googleTagManagerEnabled: e.target.checked });
              }}
              className="rounded accent-indigo-500 cursor-pointer"
            />
            <span>Enable GTM Container</span>
          </label>
        </div>

        <div className="space-y-2">
          <Input
            label="Container ID"
            placeholder="GTM-XXXXXX"
            value={config.googleTagManagerId}
            onChange={(e) => setConfig({ ...config, googleTagManagerId: e.target.value.trim().toUpperCase() })}
            hint="Find at the top of your Google Tag Manager workspace."
          />
          {config.googleTagManagerId && (
            <div className="text-[11px] font-mono flex items-center gap-1.5 pt-1">
              {isGTMValid ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Valid GTM Container Format
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Expected format: GTM-XXXXXX
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleSave}
        className="py-3.5 font-bold text-sm shadow-xl shadow-blue-600/20 active:scale-[0.99] cursor-pointer"
      >
        {saved ? '✓ Analytics Configurations Saved!' : 'Save Analytics & GTM Settings'}
      </Button>
    </div>
  );
};
