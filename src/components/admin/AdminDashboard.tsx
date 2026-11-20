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
  Package,
  Key,
  ShoppingBag,
} from 'lucide-react';
import { PackageManager } from './PackageManager';
import { LicenseManager } from './LicenseManager';
import { PackageOrdersManager } from './PackageOrdersManager';
import { AnalyticsConfig } from './AnalyticsConfig';
import { AdSenseManager } from './AdSenseManager';
import { DynamicQRMgr } from './DynamicQRMgr';
import { SponsorCRM } from './SponsorCRM';
import { db } from '../../services/db';
import { playTactileClick } from '../../utils/audioFeedback';

export const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<'packages' | 'licenses' | 'orders' | 'dynamic' | 'ads' | 'analytics'>('packages');

  // Compute live admin platform telemetry
  const platformStats = useMemo(() => {
    const users = db.getUsers();
    const allQRs = db.getAllQRs();
    const dynamicQRs = allQRs.filter((q) => q.isDynamic);
    const totalScans = dynamicQRs.reduce((acc, q) => acc + (q.dynamicConfig?.currentScans || 0), 0);
    const packages = db.getPackages();
    const licenseCodes = db.getLicenseCodes();
    const totalSeatsIssued = licenseCodes.reduce((acc, c) => acc + (c.maxUses === 9999 ? 0 : c.maxUses), 0);
    const totalSeatsClaimed = licenseCodes.reduce((acc, c) => acc + c.usedCount, 0);
    const orders = db.getPackageOrders();
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const adSlots = db.getAdSlots();
    const activeSponsors = adSlots.filter((s) => s.directSponsor?.isActive).length;

    return {
      totalUsers: users.length,
      totalQRs: allQRs.length,
      dynamicCount: dynamicQRs.length,
      totalScans,
      packagesCount: packages.length,
      licenseCodesCount: licenseCodes.length,
      totalSeatsIssued,
      totalSeatsClaimed,
      ordersCount: orders.length,
      pendingOrders,
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
      packages: db.getPackages(),
      licenseCodes: db.getLicenseCodes(),
      packageOrders: db.getPackageOrders(),
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

      {/* 2. Platform KPI Metrics Row (6 KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Metric 1: Packages */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Packages</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {platformStats.packagesCount}
            </div>
            <div className="text-[10px] text-zinc-400">
              Active Matrix Plans
            </div>
          </div>
        </div>

        {/* Metric 2: License Codes */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">License Keys</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Key className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {platformStats.licenseCodesCount}
            </div>
            <div className="text-[10px] text-zinc-400">
              {platformStats.totalSeatsClaimed} Claimed
            </div>
          </div>
        </div>

        {/* Metric 3: Orders Pending */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Orders</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {platformStats.ordersCount}
            </div>
            <div className="text-[10px] text-zinc-400">
              {platformStats.pendingOrders} Needs Action
            </div>
          </div>
        </div>

        {/* Metric 4: Global Matrix Codes */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">QR Matrix</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {platformStats.totalQRs}
            </div>
            <div className="text-[10px] text-zinc-400">
              {platformStats.dynamicCount} Dynamic
            </div>
          </div>
        </div>

        {/* Metric 5: Active Scans */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Scans</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {platformStats.totalScans}
            </div>
            <div className="text-[10px] text-zinc-400">
              Zero Intermediary
            </div>
          </div>
        </div>

        {/* Metric 6: Direct Sponsors & CRM */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Sponsors</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {platformStats.activeSponsors} / {platformStats.adSlotsCount}
            </div>
            <div className="text-[10px] text-zinc-400">
              Active Zones
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="p-1 bg-zinc-950/80 rounded-2xl border border-white/[0.08] flex flex-wrap items-center gap-1.5 shadow-lg">
          {[
            { id: 'packages', label: 'Packages & Pricing', icon: Package, color: 'text-indigo-400' },
            { id: 'licenses', label: 'Redeem & Team Codes', icon: Key, color: 'text-emerald-400' },
            { id: 'orders', label: 'Purchase Orders CRM', icon: ShoppingBag, color: 'text-blue-400' },
            { id: 'dynamic', label: 'Dynamic QR Telemetry', icon: Radio, color: 'text-purple-400' },
            { id: 'ads', label: 'AdSense & Sponsors', icon: DollarSign, color: 'text-amber-400' },
            { id: 'analytics', label: 'Analytics & GTM Pipeline', icon: LineChart, color: 'text-sky-400' },
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
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-[0.97] ${
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
      {tab === 'packages' && <PackageManager />}
      {tab === 'licenses' && <LicenseManager />}
      {tab === 'orders' && <PackageOrdersManager />}
      {tab === 'dynamic' && <DynamicQRMgr />}
      {tab === 'ads' && <AdSenseManager />}
      {tab === 'analytics' && <AnalyticsConfig />}
    </div>
  );
};
