import React, { useState, useMemo } from 'react';
import {
  Shield,
  DollarSign,
  LineChart,
  Radio,
  Users,
  Activity,
  Layers,
  Sparkles,
  Download,
  CheckCircle2,
  Server,
  Lock,
} from 'lucide-react';
import { AnalyticsConfig } from './AnalyticsConfig';
import { AdSenseManager } from './AdSenseManager';
import { DynamicQRMgr } from './DynamicQRMgr';
import { SponsorCRM } from './SponsorCRM';
import { db } from '../../services/db';
import { playTactileClick } from '../../utils/audioFeedback';

export const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<'ads' | 'analytics' | 'dynamic' | 'leads'>('ads');

  // Compute live admin platform telemetry
  const platformStats = useMemo(() => {
    const users = db.getUsers();
    const allQRs = db.getAllQRs();
    const dynamicQRs = allQRs.filter((q) => q.isDynamic);
    const totalScans = dynamicQRs.reduce((acc, q) => acc + (q.dynamicConfig?.currentScans || 0), 0);
    const leads = db.getLeads();
    const adSlots = db.getAdSlots();
    const activeSponsors = adSlots.filter((s) => s.directSponsor?.isActive).length;

    return {
      totalUsers: users.length,
      totalQRs: allQRs.length,
      dynamicCount: dynamicQRs.length,
      totalScans,
      leadsCount: leads.length,
      activeSponsors,
      adSlotsCount: adSlots.length,
    };
  }, []);

  const handleExportSystemAudit = () => {
    playTactileClick();
    const auditData = {
      timestamp: new Date().toISOString(),
      platform: 'Strix QR (qr.strixdevs.com)',
      operator: 'StrixDevs Administrative Suite',
      stats: platformStats,
      adSlots: db.getAdSlots(),
      analyticsConfig: db.getAnalyticsConfig(),
      leads: db.getLeads(),
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strix-qr-system-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Master Control Operations Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-zinc-900/80 via-zinc-900/60 to-zinc-950/80 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[11px] font-semibold">
              <Shield className="w-3.5 h-3.5" />
              StrixDevs Administrative Suite
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine: 100% Client-Side Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
            Centralized orchestration for monetization ad zones, Google Tag Manager & GA4 data streams, dynamic resolver tokens, and B2B corporate sponsorship leads.
          </p>
        </div>

        {/* Global Action */}
        <div className="relative z-10 shrink-0">
          <button
            type="button"
            onClick={handleExportSystemAudit}
            className="px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Diagnostic Audit (JSON)</span>
          </button>
        </div>
      </div>

      {/* 2. Platform KPI Metrics Row (4 KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Registered Accounts */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-3 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">User Directory</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {platformStats.totalUsers}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Active Partner Accounts
            </div>
          </div>
        </div>

        {/* Metric 2: Global Matrix Codes */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-3 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Matrix Inventory</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {platformStats.totalQRs}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {platformStats.dynamicCount} Dynamic & Ephemeral
            </div>
          </div>
        </div>

        {/* Metric 3: Active Scans */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-3 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolution Scans</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {platformStats.totalScans}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Zero Intermediary Redirection
            </div>
          </div>
        </div>

        {/* Metric 4: Direct Sponsors & CRM */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-3 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Monetization CRM</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {platformStats.activeSponsors} / {platformStats.adSlotsCount}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Active Sponsors ({platformStats.leadsCount} Inbound Leads)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="p-1 bg-zinc-950/80 rounded-2xl border border-white/[0.08] flex flex-wrap items-center gap-1.5 shadow-lg">
          {[
            { id: 'ads', label: 'AdSense & Direct Sponsors', icon: DollarSign, color: 'text-amber-400' },
            { id: 'analytics', label: 'Analytics & GTM Pipeline', icon: LineChart, color: 'text-blue-400' },
            { id: 'dynamic', label: 'Dynamic QR Telemetry', icon: Radio, color: 'text-indigo-400' },
            { id: 'leads', label: 'Sponsorship Leads CRM', icon: Users, color: 'text-emerald-400' },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  playTactileClick();
                  setTab(t.id as any);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-[0.97] ${
                  isSelected
                    ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.08]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${t.color}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tab Panels */}
      {tab === 'ads' && <AdSenseManager />}
      {tab === 'analytics' && <AnalyticsConfig />}
      {tab === 'dynamic' && <DynamicQRMgr />}
      {tab === 'leads' && <SponsorCRM />}
    </div>
  );
};
