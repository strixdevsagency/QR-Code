import React, { useState } from 'react';
import type { AnalyticsConfig as IAnalyticsConfig } from '../../types';
import { db } from '../../services/db';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const AnalyticsConfig: React.FC = () => {
  const [config, setConfig] = useState<IAnalyticsConfig>(() => db.getAnalyticsConfig());
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    db.saveAnalyticsConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Google Analytics 4 & Google Tag Manager Integration
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Connect your tracking and tag containers to gather privacy-compliant traffic telemetry.
        </p>
      </div>

      {/* GA4 */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200">Google Analytics 4 (GA4)</label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.googleAnalyticsEnabled}
              onChange={(e) => setConfig({ ...config, googleAnalyticsEnabled: e.target.checked })}
              className="rounded text-indigo-600 cursor-pointer"
            />
            <span>Enable GA4</span>
          </label>
        </div>
        <Input
          placeholder="G-XXXXXXXXXX"
          value={config.googleAnalyticsId}
          onChange={(e) => setConfig({ ...config, googleAnalyticsId: e.target.value })}
          hint="Measurement ID from Google Analytics Admin > Data Streams."
        />
      </div>

      {/* GTM */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200">Google Tag Manager (GTM)</label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.googleTagManagerEnabled}
              onChange={(e) => setConfig({ ...config, googleTagManagerEnabled: e.target.checked })}
              className="rounded text-indigo-600 cursor-pointer"
            />
            <span>Enable GTM</span>
          </label>
        </div>
        <Input
          placeholder="GTM-XXXXXXX"
          value={config.googleTagManagerId}
          onChange={(e) => setConfig({ ...config, googleTagManagerId: e.target.value })}
          hint="Container ID from Google Tag Manager dashboard."
        />
      </div>

      <Button variant="primary" onClick={handleSave}>
        {saved ? '✓ Analytics Saved' : 'Save Google Analytics & GTM Settings'}
      </Button>
    </div>
  );
};

