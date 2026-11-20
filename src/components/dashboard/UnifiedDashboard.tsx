import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCode,
  Image as ImageIcon,
  BarChart3,
  Plus,
  Shield,
  ShieldCheck,
  Download,
  Activity,
  Layers,
  Key,
  Users,
  Package,
  ShoppingBag,
  Radio,
  DollarSign,
  LineChart,
  LayoutDashboard,
  Menu,
  X,
  Server,
  ExternalLink,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import type { SavedQRCode, SavedLogo } from '../../types';
import { SavedQRList } from './SavedQRList';
import { LogoLibrary } from './LogoLibrary';
import { UserManager } from '../admin/UserManager';
import { PackageManager } from '../admin/PackageManager';
import { LicenseManager } from '../admin/LicenseManager';
import { PackageOrdersManager } from '../admin/PackageOrdersManager';
import { AnalyticsConfig } from '../admin/AnalyticsConfig';
import { AdSenseManager } from '../admin/AdSenseManager';
import { DynamicQRMgr } from '../admin/DynamicQRMgr';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

export type DashboardSection =
  | 'qrs'
  | 'logos'
  | 'analytics'
  | 'overview'
  | 'users'
  | 'packages'
  | 'licenses'
  | 'orders'
  | 'dynamic'
  | 'ads'
  | 'config';

interface UnifiedDashboardProps {
  onLoadQRToGenerator: (qr: SavedQRCode) => void;
  onNavigateToGenerator: () => void;
  onOpenTestScan: (codeId: string) => void;
  onOpenPricing?: () => void;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  onLoadQRToGenerator,
  onNavigateToGenerator,
  onOpenTestScan,
  onOpenPricing,
}) => {
  const { user, isAdmin, activateLicenseKey } = useAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>(() =>
    isAdmin ? 'overview' : 'qrs'
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // User Vault Data
  const [qrs, setQrs] = useState<SavedQRCode[]>([]);
  const [logos, setLogos] = useState<SavedLogo[]>([]);

  // License redemption state
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [redeemKeyInput, setRedeemKeyInput] = useState('');
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{ isTeam?: boolean; remaining?: number; tier?: string; durationDays?: number } | null>(null);

  const refreshData = async () => {
    if (user) {
      setQrs(db.getUserQRs(user.id));
      setLogos(db.getUserLogos(user.id));

      try {
        const [cloudQRs, cloudLogos] = await Promise.all([
          db.fetchUserQRs(user.id),
          db.fetchUserLogos(user.id),
        ]);
        setQrs(cloudQRs);
        setLogos(cloudLogos);
      } catch (err) {
        console.warn('Cloud sync deferred/offline:', err);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Handle license code redemption
  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemKeyInput.trim()) {
      setRedeemError('Please enter your license key.');
      return;
    }

    setRedeemError(null);
    const result = activateLicenseKey(redeemKeyInput.trim());

    if (result.success) {
      playVictoryFanfare();
      setRedeemSuccess({
        isTeam: result.isTeamCode,
        remaining: result.remainingUses,
        tier: result.tier,
        durationDays: result.durationDays,
      });
      refreshData();
      setTimeout(() => {
        setRedeemModalOpen(false);
        setRedeemSuccess(null);
        setRedeemKeyInput('');
      }, 2500);
    } else {
      setRedeemError(result.error || 'Invalid code.');
    }
  };

  const handleDeleteQR = (id: string) => {
    db.deleteQRCode(id);
    refreshData();
  };

  const handleDeleteLogo = (id: string) => {
    db.deleteLogo(id);
    refreshData();
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      playTactileClick();
      try {
        await db.uploadUserLogo(user.id, file);
        await refreshData();
        playVictoryFanfare();
      } catch (err) {
        console.error('Logo upload error:', err);
      }
    }
  };

  // Metrics computation for user vault
  const userMetrics = useMemo(() => {
    const totalQRs = qrs.length;
    const staticCount = qrs.filter((q) => !q.isDynamic).length;
    const dynamicCount = qrs.filter((q) => q.isDynamic).length;
    const totalDownloads = qrs.reduce((acc, q) => acc + (q.downloadCount || 0), 0);
    const totalScans = qrs.reduce((acc, q) => acc + (q.dynamicConfig?.currentScans || 0), 0);
    const burnedCount = qrs.filter((q) => q.dynamicConfig?.isBurned).length;

    return {
      totalQRs,
      staticCount,
      dynamicCount,
      totalDownloads,
      totalScans,
      burnedCount,
      totalLogos: logos.length,
    };
  }, [qrs, logos]);

  // Platform Stats for Admin
  const platformStats = useMemo(() => {
    if (!isAdmin) return null;
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
  }, [isAdmin]);

  // Export entire vault backup (JSON)
  const handleExportVaultBackup = () => {
    playTactileClick();
    const backupData = {
      exportDate: new Date().toISOString(),
      user: { id: user?.id, email: user?.email, name: user?.name, tier: user?.tier },
      matrixCodes: qrs,
      brandLogos: logos.map((l) => ({ id: l.id, name: l.name, createdAt: l.createdAt })),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strix-qr-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export full system audit (Admin only)
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
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strix-qr-system-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sidebar navigation structure
  const navGroups = useMemo(() => {
    const groups: {
      group: string;
      items: {
        id: DashboardSection;
        label: string;
        icon: any;
        badge?: string | null;
        badgeColor?: string;
      }[];
    }[] = [
      {
        group: 'USER SERVICES',
        items: [
          { id: 'qrs', label: 'QR Matrix Vault', icon: QrCode, badge: `${qrs.length}` },
          { id: 'logos', label: 'Brand Assets (Cloud)', icon: ImageIcon, badge: `${logos.length}` },
          { id: 'analytics', label: 'Scan Telemetry', icon: BarChart3, badge: `${userMetrics.totalScans}` },
        ],
      },
    ];

    if (isAdmin && platformStats) {
      groups.push({
        group: 'ADMINISTRATION SERVICES',
        items: [
          { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard, badge: null },
          { id: 'users', label: 'Users & Permissions', icon: Users, badge: `${platformStats.totalUsers}` },
          { id: 'packages', label: 'Packages & Pricing', icon: Package, badge: `${platformStats.packagesCount}` },
          { id: 'licenses', label: 'License & Team Codes', icon: Key, badge: `${platformStats.licenseCodesCount}` },
          {
            id: 'orders',
            label: 'Customer Orders CRM',
            icon: ShoppingBag,
            badge: platformStats.pendingOrders > 0 ? `${platformStats.pendingOrders} pending` : null,
            badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          },
          { id: 'dynamic', label: 'Dynamic QR Registry', icon: Radio, badge: `${platformStats.dynamicCount}` },
          { id: 'ads', label: 'AdSense & Sponsors', icon: DollarSign, badge: `${platformStats.activeSponsors}/${platformStats.adSlotsCount}` },
          { id: 'config', label: 'Analytics & GTM Pipeline', icon: LineChart, badge: null },
        ],
      });
    }

    return groups;
  }, [isAdmin, qrs.length, logos.length, userMetrics.totalScans, platformStats]);

  let currentSectionLabel = 'Console';
  for (const g of navGroups) {
    const match = g.items.find((i) => i.id === activeSection);
    if (match) {
      currentSectionLabel = match.label;
      break;
    }
  }

  const renderSidebar = () => (
    <div className="flex flex-col h-full w-full bg-zinc-950 select-none">
      {/* Brand & Console Header */}
      <div className="shrink-0 p-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 border border-white/20 shrink-0">
            {isAdmin ? <Shield className="w-5 h-5 text-white" /> : <LayoutDashboard className="w-5 h-5 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">STRIX</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#38bdf8]/15 text-[#38bdf8] font-bold border border-[#38bdf8]/30">
                {isAdmin ? 'ADMIN' : (user?.tier || 'FREE').toUpperCase()}
              </span>
            </div>
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

      {/* Navigation Sections */}
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
                        ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 shadow-md shadow-[#38bdf8]/10'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#38bdf8]' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                          item.badgeColor || (isActive ? 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/30' : 'bg-zinc-800/80 text-zinc-400 border-white/[0.08]')
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

        {/* Quick Utilities Group */}
        <div className="pt-2 px-1 space-y-2">
          <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
            QUICK ACTIONS
          </h4>
          {!isAdmin && user?.tier === 'free' && (
            <button
              onClick={() => {
                playTactileClick();
                setRedeemModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#38bdf8] hover:text-[#38bdf8] bg-[#38bdf8]/10 hover:bg-[#38bdf8]/15 border border-[#38bdf8]/20 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5" />
                <span>Redeem License Key</span>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold">Code</span>
            </button>
          )}

          <button
            onClick={handleExportVaultBackup}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-900 border border-white/[0.06] hover:border-white/[0.12] transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Backup Vault JSON</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Save</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleExportSystemAudit}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-900 border border-white/[0.06] hover:border-white/[0.12] transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Full System Audit</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Operator Card & Open Studio Footer */}
      <div className="shrink-0 p-4 border-t border-white/[0.08] bg-zinc-950 space-y-3">
        <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-white/[0.08] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white border border-white/20 shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Strix Operator'}</p>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 font-semibold">
                {isAdmin ? 'Admin' : (user?.tier || 'Free')}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
              <p className="truncate">{user?.email}</p>
              {user?.tierExpiresAt && (
                <span className="text-[9px] font-mono text-emerald-400 shrink-0 ml-1">
                  {Math.max(0, Math.ceil((new Date(user.tierExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d left
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playTactileClick();
            onNavigateToGenerator();
          }}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New QR Matrix (Studio)</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex overflow-hidden bg-zinc-950">
      
      {/* 1. Desktop Left Fixed/Sticky Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 h-full border-r border-white/[0.08] bg-zinc-950 z-30 select-none">
        {renderSidebar()}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-slideRight">
            {renderSidebar()}
          </div>
        </div>
      )}

      {/* 2. Main Content Stage Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-zinc-900/30">
        {/* Top Operations Header */}
        <header className="shrink-0 px-6 py-3.5 border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-zinc-300 hover:text-white"
              aria-label="Open Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 font-mono">Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-white font-bold tracking-tight">{currentSectionLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onNavigateToGenerator();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>QR Studio</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* Main Stage Panel */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* USER SERVICE: QR Codes List */}
          {activeSection === 'qrs' && (
            <div className="space-y-6">
              {/* Pro Tier Banner if on Free Tier */}
              {!isAdmin && user?.tier !== 'pro' && user?.tier !== 'enterprise' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-zinc-900 to-zinc-950 border border-[#38bdf8]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">Unlock Unlimited Dynamic QR Codes & 100% Ad-Free Studio</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/10">Free Starter</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Have a license key voucher? Click Redeem to activate Pro instantly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onOpenPricing && (
                      <button
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          onOpenPricing();
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold transition cursor-pointer shrink-0 shadow-md shadow-sky-500/20"
                      >
                        Upgrade to Pro
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setRedeemModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-white/10 transition cursor-pointer shrink-0"
                    >
                      Redeem Code
                    </button>
                  </div>
                </div>
              )}

              {/* Metric KPI Deck */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Vault Inventory</span>
                    <QrCode className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{userMetrics.totalQRs}</div>
                    <div className="text-[10px] text-zinc-400">{userMetrics.staticCount} Static · {userMetrics.dynamicCount} Dynamic</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Scan Telemetry</span>
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{userMetrics.totalScans}</div>
                    <div className="text-[10px] text-zinc-400">Real-Time In-Browser</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Export Volume</span>
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{userMetrics.totalDownloads}</div>
                    <div className="text-[10px] text-zinc-400">SVG & 300 DPI PDF</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-2 shadow-lg">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Brand Assets</span>
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white">{userMetrics.totalLogos}</div>
                    <div className="text-[10px] text-zinc-400">Cloud Storage Bucket</div>
                  </div>
                </div>
              </div>

              <SavedQRList
                qrs={qrs}
                onLoadQRToGenerator={onLoadQRToGenerator}
                onDeleteQR={handleDeleteQR}
                onOpenTestScan={onOpenTestScan}
              />
            </div>
          )}

          {/* USER SERVICE: Logo Library */}
          {activeSection === 'logos' && (
            <LogoLibrary
              logos={logos}
              onUploadLogo={handleUploadLogo}
              onDeleteLogo={handleDeleteLogo}
              onSelectLogoForGenerator={(_url) => {
                onNavigateToGenerator();
              }}
            />
          )}

          {/* USER SERVICE: Analytics Breakdown */}
          {activeSection === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pop-in">
              <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Payload Distribution
                </h3>
                <div className="space-y-3 pt-2">
                  {(['url', 'wifi', 'vcard', 'text', 'sms', 'email'] as const).map((type) => {
                    const count = qrs.filter((q) => q.qrType === type).length;
                    const pct = qrs.length > 0 ? Math.round((count / qrs.length) * 100) : 0;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="uppercase text-zinc-300 font-mono font-medium">{type}</span>
                          <span className="text-zinc-400 font-mono">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Scan Telemetry Performance
                </h3>
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Total Scans:</span>
                    <span className="text-lg font-bold text-white font-mono">{userMetrics.totalScans}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Dynamic Active:</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">{userMetrics.dynamicCount}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Burned (One-Time):</span>
                    <span className="text-lg font-bold text-rose-400 font-mono">{userMetrics.burnedCount}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Security & Integrity
                </h3>
                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] space-y-1">
                    <p className="text-zinc-300 font-semibold">ISO/IEC 18004 Verification</p>
                    <p className="text-zinc-400">Real-time contrast ratio & quiet zone scannability verification guard active.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] space-y-1">
                    <p className="text-zinc-300 font-semibold">Cloud Storage Active</p>
                    <p className="text-zinc-400">Cloud assets and vector vaults synchronized.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN SERVICE: Executive Overview */}
          {activeSection === 'overview' && isAdmin && platformStats && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-sky-950/30 to-zinc-950 border border-[#38bdf8]/25 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 text-[11px] font-mono font-bold">
                      ADMIN CONSOLE
                    </span>
                    <span className="text-xs text-zinc-400">Enterprise Core v3.2</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Executive Operations & Governance
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
                    <Users className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform" />
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
                    <Package className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
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

              {/* Security & Packages Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
                      <span>Security & Infrastructure Status</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Cryptographic access controls, server-verified roles, global CDN distribution, and secure automated provisioning.
                  </p>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Access Control & Security</span>
                      <span className="text-[#38bdf8] font-mono font-bold">Hardware-Hardened</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Dynamic Base Domain</span>
                      <span className="text-sky-400 font-mono font-bold">qr.strixdevs.com</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Brand Asset Cloud Storage</span>
                      <span className="text-[#38bdf8] font-mono font-bold">Global CDN Bucket</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Payment Webhook Signatures</span>
                      <span className="text-[#38bdf8] font-mono font-bold">HMAC-SHA256 Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN SERVICES: Sub-Managers */}
          {activeSection === 'users' && isAdmin && <UserManager />}
          {activeSection === 'packages' && isAdmin && <PackageManager />}
          {activeSection === 'licenses' && isAdmin && <LicenseManager />}
          {activeSection === 'orders' && isAdmin && <PackageOrdersManager />}
          {activeSection === 'dynamic' && isAdmin && <DynamicQRMgr />}
          {activeSection === 'ads' && isAdmin && <AdSenseManager />}
          {activeSection === 'config' && isAdmin && <AnalyticsConfig />}
          </div>
        </main>
      </div>

      {/* License Code Redemption Modal */}
      {redeemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-white/[0.1] rounded-2xl p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Redeem License Key</h3>
              </div>
              <button
                onClick={() => {
                  setRedeemModalOpen(false);
                  setRedeemError(null);
                  setRedeemSuccess(null);
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRedeemCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Enter Your License Key or Team Code
                </label>
                <input
                  type="text"
                  value={redeemKeyInput}
                  onChange={(e) => setRedeemKeyInput(e.target.value)}
                  placeholder="e.g. STRIX-PRO-9842"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.1] text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              {redeemError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {redeemError}
                </div>
              )}

              {redeemSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">
                      Successfully unlocked <strong>{(redeemSuccess.tier || 'PRO').toUpperCase()}</strong>!
                    </p>
                    <p className="text-[11px] text-emerald-400 mt-0.5">
                      Session duration: {redeemSuccess.durationDays === 0 ? 'Lifetime permanent access' : `${redeemSuccess.durationDays || 30} days active access`}
                      {redeemSuccess.isTeam && ` · (${redeemSuccess.remaining} team seats remaining)`}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRedeemModalOpen(false);
                    setRedeemError(null);
                    setRedeemSuccess(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Activate License
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
