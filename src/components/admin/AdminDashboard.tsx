import React, { useState, useMemo } from 'react';
import {
  Shield,
  DollarSign,
  LineChart,
  Radio,
  Users,
  Layers,
  Download,
  Package,
  Key,
  ShoppingBag,
  LayoutDashboard,
  ArrowLeft,
  Menu,
  X,
  Server,
  Database,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { UserManager } from './UserManager';
import { PackageManager } from './PackageManager';
import { LicenseManager } from './LicenseManager';
import { PackageOrdersManager } from './PackageOrdersManager';
import { AnalyticsConfig } from './AnalyticsConfig';
import { AdSenseManager } from './AdSenseManager';
import { DynamicQRMgr } from './DynamicQRMgr';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { playTactileClick } from '../../utils/audioFeedback';

export type AdminSection =
  | 'overview'
  | 'users'
  | 'packages'
  | 'licenses'
  | 'orders'
  | 'dynamic'
  | 'ads'
  | 'analytics';

interface AdminDashboardProps {
  onNavigateToStudio?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateToStudio }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Compute live platform telemetry
  const platformStats = useMemo(() => {
    const users = db.getUsers();
    const adminsCount = users.filter((u) => u.role === 'admin').length;
    const paidUsersCount = users.filter((u) => u.tier === 'pro' || u.tier === 'enterprise').length;
    const allQRs = db.getAllQRs();
    const dynamicQRs = allQRs.filter((q) => q.isDynamic);
    const totalScans = dynamicQRs.reduce((acc, q) => acc + (q.dynamicConfig?.currentScans || 0), 0);
    const packages = db.getPackages();
    const licenseCodes = db.getLicenseCodes();
    const totalSeatsIssued = licenseCodes.reduce((acc, c) => (c.maxUses === 9999 ? 0 : c.maxUses), 0);
    const totalSeatsClaimed = licenseCodes.reduce((acc, c) => acc + c.usedCount, 0);
    const orders = db.getPackageOrders();
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const adSlots = db.getAdSlots();
    const activeSponsors = adSlots.filter((s) => s.directSponsor?.isActive).length;

    return {
      totalUsers: users.length,
      adminsCount,
      paidUsersCount,
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
      operator: user?.email || 'admin@strixdevs.com',
      stats: platformStats,
      users: db.getUsers(),
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

  const navGroups = [
    {
      group: 'GOVERNANCE & MONETIZATION',
      items: [
        { id: 'overview' as AdminSection, label: 'Operations Overview', icon: LayoutDashboard, badge: null },
        { id: 'users' as AdminSection, label: 'Users & Permissions', icon: Users, badge: `${platformStats.totalUsers}` },
        { id: 'packages' as AdminSection, label: 'Packages & Pricing', icon: Package, badge: `${platformStats.packagesCount}` },
        { id: 'licenses' as AdminSection, label: 'License & Team Codes', icon: Key, badge: `${platformStats.licenseCodesCount}` },
        {
          id: 'orders' as AdminSection,
          label: 'Customer Orders CRM',
          icon: ShoppingBag,
          badge: platformStats.pendingOrders > 0 ? `${platformStats.pendingOrders} pending` : null,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        },
      ],
    },
    {
      group: 'INFRASTRUCTURE & ADS',
      items: [
        { id: 'dynamic' as AdminSection, label: 'Dynamic QR Registry', icon: Radio, badge: `${platformStats.dynamicCount}` },
        { id: 'ads' as AdminSection, label: 'AdSense & Sponsors', icon: DollarSign, badge: `${platformStats.activeSponsors}/${platformStats.adSlotsCount}` },
        { id: 'analytics' as AdminSection, label: 'Analytics & GTM Pipeline', icon: LineChart, badge: null },
      ],
    },
  ];

  let currentSectionLabel = 'Console';
  for (const g of navGroups) {
    const match = g.items.find((i) => i.id === activeSection);
    if (match) {
      currentSectionLabel = match.label;
      break;
    }
  }

  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-zinc-950/95 border-r border-white/[0.08] backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 border border-white/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">STRIX</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              PostgreSQL Connected
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              {group.group}
            </h4>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playTactileClick();
                      setActiveSection(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-600/10'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                          item.badgeColor || (isActive ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-zinc-800/80 text-zinc-400 border-white/[0.08]')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Audit Export Shortcut */}
        <div className="pt-2 px-1">
          <button
            onClick={handleExportSystemAudit}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-900 border border-white/[0.06] hover:border-white/[0.12] transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Full System Audit JSON</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Save</span>
          </button>
        </div>
      </div>

      {/* Operator Card & Return to Studio Footer */}
      <div className="p-4 border-t border-white/[0.08] bg-zinc-950 space-y-3">
        <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-white/[0.08] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white border border-white/20 shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Lead Administrator'}</p>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">{user?.email || 'admin@strixdevs.com'}</p>
          </div>
        </div>

        {onNavigateToStudio && (
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onNavigateToStudio();
            }}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to QR Studio</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full -mt-2 -mb-8 flex min-h-[calc(100vh-120px)] rounded-3xl overflow-hidden border border-white/[0.08] bg-zinc-950/80 shadow-2xl shadow-black/80 animate-in fade-in duration-200">
      
      {/* 1. Desktop Left Fixed/Sticky Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
        {renderSidebar()}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-full z-10 animate-slideRight">
            {renderSidebar()}
          </div>
        </div>
      )}

      {/* 2. Main Administration Stage Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-900/30">
        {/* Top Executive Operations Bar */}
        <header className="px-6 py-4 border-b border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-zinc-300 hover:text-white"
              aria-label="Open Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 font-mono">Console</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-white font-bold tracking-tight">{currentSectionLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold">
              <Server className="w-3 h-3" />
              PostgreSQL Active · RLS Enforced
            </span>

            {onNavigateToStudio && (
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  onNavigateToStudio();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <span>Studio</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </header>

        {/* Main Stage Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Overview Dashboard View */}
          {activeSection === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Hero Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-950 border border-indigo-500/20 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold">
                      SYSTEM LIVE
                    </span>
                    <span className="text-xs text-zinc-400">Enterprise v3.2 Core</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Executive Operations Center
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                    Live management of database packages, user access control lists, license key redemption quotas, purchase orders, dynamic QR routing registries, and AdSense sponsorship zones.
                  </p>
                </div>
              </div>

              {/* KPI Deck */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <div
                  onClick={() => setActiveSection('users')}
                  className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 transition border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Users</span>
                    <Users className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{platformStats.totalUsers}</div>
                    <div className="text-[10px] text-zinc-400">{platformStats.adminsCount} Admins</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('packages')}
                  className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 transition border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Packages</span>
                    <Package className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{platformStats.packagesCount}</div>
                    <div className="text-[10px] text-zinc-400">Active Plans</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('licenses')}
                  className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 transition border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Licenses</span>
                    <Key className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{platformStats.licenseCodesCount}</div>
                    <div className="text-[10px] text-zinc-400">{platformStats.totalSeatsClaimed} Claimed</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('orders')}
                  className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 transition border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Orders</span>
                    <ShoppingBag className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{platformStats.ordersCount}</div>
                    <div className="text-[10px] text-rose-400 font-semibold">{platformStats.pendingOrders} Pending</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('dynamic')}
                  className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 transition border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Dynamic QRs</span>
                    <Radio className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{platformStats.dynamicCount}</div>
                    <div className="text-[10px] text-zinc-400">{platformStats.totalQRs} Total</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('dynamic')}
                  className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 transition border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Scans</span>
                    <TrendingUp className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{platformStats.totalScans}</div>
                    <div className="text-[10px] text-zinc-400">Cloud Resolved</div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('ads')}
                  className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 transition border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Sponsors</span>
                    <DollarSign className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{platformStats.activeSponsors}</div>
                    <div className="text-[10px] text-zinc-400">Active Slots</div>
                  </div>
                </div>
              </div>

              {/* Quick Launchpad Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel 1: Packages & Monetization */}
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-400" />
                      <span>Commercial Packages & Pricing</span>
                    </h3>
                    <button
                      onClick={() => setActiveSection('packages')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      Manage Plans →
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Configure customer plan prices, annual discounts, dynamic QR limits, custom logo storage allowances, and smart routing flags.
                  </p>
                  <div className="space-y-2">
                    {db.getPackages().map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{pkg.name}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">${pkg.priceMonthly}/mo · ${pkg.priceAnnual}/mo billed annually</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pkg.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                          {pkg.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 2: Infrastructure & Security Health */}
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>Security & Infrastructure Status</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      HARDENED
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Cryptographic access controls, server-verified roles, Row Level Security, and Supabase Cloud Storage.
                  </p>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Row Level Security (RLS)</span>
                      <span className="text-emerald-400 font-mono font-bold">Enabled (All Tables)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Dynamic Base Domain</span>
                      <span className="text-indigo-400 font-mono font-bold">qr.strixdevs.com</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Logo Cloud Storage Bucket</span>
                      <span className="text-emerald-400 font-mono font-bold">logos (Supabase CDN)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Payment Webhook Signatures</span>
                      <span className="text-emerald-400 font-mono font-bold">HMAC-SHA256 Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Sub-Managers */}
          {activeSection === 'users' && <UserManager />}
          {activeSection === 'packages' && <PackageManager />}
          {activeSection === 'licenses' && <LicenseManager />}
          {activeSection === 'orders' && <PackageOrdersManager />}
          {activeSection === 'dynamic' && <DynamicQRMgr />}
          {activeSection === 'ads' && <AdSenseManager />}
          {activeSection === 'analytics' && <AnalyticsConfig />}
        </main>
      </div>
    </div>
  );
};
