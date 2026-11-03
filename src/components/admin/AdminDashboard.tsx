import React, { useState } from 'react';
import { AnalyticsConfig } from './AnalyticsConfig';
import { AdSenseManager } from './AdSenseManager';
import { DynamicQRMgr } from './DynamicQRMgr';
import { SponsorCRM } from './SponsorCRM';

export const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<'ads' | 'analytics' | 'dynamic' | 'leads'>('ads');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
            StrixDevs Administrative Suite
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Platform Control Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage AdSense spaces, Google Tag/Analytics integration, dynamic codes, and corporate sponsor CRM.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ads', label: 'AdSense & Ads' },
          { id: 'analytics', label: 'Google Analytics & GTM' },
          { id: 'dynamic', label: 'Dynamic QR Telemetry' },
          { id: 'leads', label: 'Sponsorship Leads CRM' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              tab === t.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tab === 'ads' && <AdSenseManager />}
      {tab === 'analytics' && <AnalyticsConfig />}
      {tab === 'dynamic' && <DynamicQRMgr />}
      {tab === 'leads' && <SponsorCRM />}
    </div>
  );
};

