import React, { useState } from 'react';
import type { AdSlotConfig, AnalyticsConfig } from '../../types';
import { db } from '../../services/db';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';

export const AdSenseManager: React.FC = () => {
  const [analyticsConfig, setAnalyticsConfig] = useState<AnalyticsConfig>(() => db.getAnalyticsConfig());
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>(() => db.getAdSlots());
  const [saved, setSaved] = useState<boolean>(false);

  const handleUpdateSlot = (id: string, updates: Partial<AdSlotConfig>) => {
    setAdSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleSaveAll = () => {
    db.saveAnalyticsConfig(analyticsConfig);
    adSlots.forEach((slot) => db.updateAdSlot(slot.id, slot));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Google AdSense & Ad Space Monetization
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Configure Google AdSense publisher credentials or paste raw custom HTML banners from direct corporate sponsors.
        </p>
      </div>

      {/* Global AdSense Config */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200">Google AdSense Publisher</label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={analyticsConfig.adSenseEnabled}
              onChange={(e) =>
                setAnalyticsConfig({ ...analyticsConfig, adSenseEnabled: e.target.checked })
              }
              className="rounded text-indigo-600 cursor-pointer"
            />
            <span>Enable AdSense Monetization</span>
          </label>
        </div>
        <Input
          placeholder="ca-pub-XXXXXXXXXXXXXXXX"
          value={analyticsConfig.adSensePublisherId}
          onChange={(e) =>
            setAnalyticsConfig({ ...analyticsConfig, adSensePublisherId: e.target.value })
          }
          hint="Your AdSense client ID."
        />
      </div>

      {/* Individual Ad Slots */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Individual Revenue Ad Slots
        </h4>

        {adSlots.map((slot) => (
          <div key={slot.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">{slot.name}</span>
                <span className="text-[11px] text-indigo-400 font-mono ml-2">({slot.dimensions})</span>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slot.enabled}
                  onChange={(e) => handleUpdateSlot(slot.id, { enabled: e.target.checked })}
                  className="rounded text-indigo-600 cursor-pointer"
                />
                <span>Active</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Ad Client ID"
                placeholder="ca-pub-XXXXXXXXXXXX"
                value={slot.adClient}
                onChange={(e) => handleUpdateSlot(slot.id, { adClient: e.target.value })}
              />
              <Input
                label="Ad Slot ID"
                placeholder="1234567890"
                value={slot.adSlot}
                onChange={(e) => handleUpdateSlot(slot.id, { adSlot: e.target.value })}
              />
            </div>

            <Textarea
              label="Custom Sponsor HTML / Banner Tag (Overrides AdSense)"
              rows={2}
              placeholder="<a href='https://partner.com'><img src='...' /></a>"
              value={slot.customHtml || ''}
              onChange={(e) => handleUpdateSlot(slot.id, { customHtml: e.target.value })}
            />
          </div>
        ))}
      </div>

      <Button variant="primary" onClick={handleSaveAll}>
        {saved ? '✓ Monetization Settings Saved' : 'Save AdSense & Monetization Settings'}
      </Button>
    </div>
  );
};

