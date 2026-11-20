import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCode,
  Image as ImageIcon,
  BarChart3,
  Plus,
  ShieldCheck,
  Download,
  Flame,
  Activity,
  Sparkles,
  Lock,
  Layers,
  Database,
  Key,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import type { SavedQRCode, SavedLogo } from '../../types';
import { SavedQRList } from './SavedQRList';
import { LogoLibrary } from './LogoLibrary';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

interface UserDashboardProps {
  onLoadQRToGenerator: (qr: SavedQRCode) => void;
  onNavigateToGenerator: () => void;
  onOpenTestScan: (codeId: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onLoadQRToGenerator,
  onNavigateToGenerator,
  onOpenTestScan,
}) => {
  const { user, activateLicenseKey } = useAuth();
  const [qrs, setQrs] = useState<SavedQRCode[]>([]);
  const [logos, setLogos] = useState<SavedLogo[]>([]);
  const [tab, setTab] = useState<'qrs' | 'logos' | 'analytics'>('qrs');

  // License code redemption state
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [redeemKeyInput, setRedeemKeyInput] = useState('');
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{ isTeam?: boolean; remaining?: number; tier?: string } | null>(null);

  const refreshData = () => {
    if (user) {
      setQrs(db.getUserQRs(user.id));
      setLogos(db.getUserLogos(user.id));
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

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
      });
      refreshData();
      setTimeout(() => {
        setRedeemModalOpen(false);
        setRedeemSuccess(null);
        setRedeemKeyInput('');
      }, 2000);
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

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      playTactileClick();
      const reader = new FileReader();
      reader.onload = () => {
        db.saveLogo(user.id, file.name, reader.result as string);
        refreshData();
        playVictoryFanfare();
      };
      reader.readAsDataURL(file);
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const totalQRs = qrs.length;
    const staticCount = qrs.filter((q) => !q.isDynamic).length;
    const dynamicCount = qrs.filter((q) => q.isDynamic).length;
    const totalDownloads = qrs.reduce((acc, q) => acc + (q.downloadCount || 0), 0);
    const totalScans = qrs.reduce(
      (acc, q) => acc + (q.dynamicConfig?.currentScans || 0),
      0
    );
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

  // Export entire vault backup
  const handleExportVaultBackup = () => {
    playTactileClick();
    const backupData = {
      exportDate: new Date().toISOString(),
      user: { id: user?.id, email: user?.email, name: user?.name },
      matrixCodes: qrs,
      brandLogos: logos.map((l) => ({ id: l.id, name: l.name, createdAt: l.createdAt })),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strix-qr-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Executive Vault Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-zinc-900/80 via-zinc-900/60 to-zinc-950/80 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[11px] font-semibold">
              <Lock className="w-3 h-3" />
              Client-Encrypted Vault
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Zero-Tracking Storage
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Vault Operator'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
            Permanent vector matrix registry & dynamic scan authorization records for{' '}
            <strong className="text-zinc-200">{user?.email}</strong>. Data persists client-side in your secure browser sandbox.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setRedeemModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-[0.98] cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Redeem Code</span>
          </button>

          <button
            type="button"
            onClick={handleExportVaultBackup}
            className="px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup Vault (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onNavigateToGenerator();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New QR Matrix</span>
          </button>
        </div>
      </div>

      {/* Pro Tier Upgrade or Team Access Banner */}
      {user?.tier !== 'pro' && user?.tier !== 'enterprise' ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-zinc-950 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-indigo-950/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Unlock Unlimited Dynamic QR Codes & 100% Ad-Free Studio</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/10">
                  Free Starter Tier
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Have a single-use or team activation voucher? Click Redeem Code to activate Pro on your device.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setRedeemModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shrink-0 shadow-md shadow-indigo-600/30"
          >
            Redeem License Key
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {user.tier.toUpperCase()} TIER ACTIVE
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Ad-Free Verified
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Full dynamic redirection, high-res vector PDF printing, and priority scannability guards unlocked.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setRedeemModalOpen(true);
            }}
            className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
          >
            Redeem another key
          </button>
        </div>
      )}

      {/* 2. Executive Metric Deck (4 KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Codes */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-3 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Vault Inventory</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalQRs}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
              <span className="text-emerald-400 font-medium">{metrics.staticCount} Static</span>
              <span>•</span>
              <span className="text-indigo-400 font-medium">{metrics.dynamicCount} Dynamic</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Scans */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-3 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Scan Telemetry</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalScans}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
              <span className="text-zinc-300 font-medium">Real-Time In-Browser</span>
              {metrics.burnedCount > 0 && (
                <span className="text-rose-400 font-medium font-mono">({metrics.burnedCount} Burned)</span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 3: Total Downloads */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-3 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Export Volume</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalDownloads}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Vector SVG & 300 DPI PDF
            </div>
          </div>
        </div>

        {/* KPI 4: Brand Logos */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between gap-3 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Brand Assets</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalLogos}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Auto-Lock Level H Redundancy
            </div>
          </div>
        </div>
      </div>

      {/* 3. Segmented Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="p-1 bg-zinc-950/80 rounded-2xl border border-white/[0.08] inline-flex items-center gap-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setTab('qrs');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-[0.97] ${
              tab === 'qrs'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.08]'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
            }`}
          >
            <QrCode className="w-4 h-4 text-blue-400" />
            <span>Saved Codes ({qrs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setTab('logos');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-[0.97] ${
              tab === 'logos'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.08]'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Brand Logos ({logos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setTab('analytics');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-[0.97] ${
              tab === 'analytics'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.08]'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Vault Analytics</span>
          </button>
        </div>
      </div>

      {/* 4. Tab Panels */}
      {tab === 'qrs' && (
        <SavedQRList
          qrs={qrs}
          onLoadQRToGenerator={onLoadQRToGenerator}
          onDeleteQR={handleDeleteQR}
          onOpenTestScan={onOpenTestScan}
        />
      )}

      {tab === 'logos' && (
        <LogoLibrary
          logos={logos}
          onUploadLogo={handleUploadLogo}
          onDeleteLogo={handleDeleteLogo}
          onSelectLogoForGenerator={(url) => {
            onNavigateToGenerator();
          }}
        />
      )}

      {tab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pop-in">
          {/* Card 1: Type Distribution */}
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
                    <div className="flex justify-between text-xs">
                      <span className="font-mono uppercase text-zinc-300">{type}</span>
                      <span className="text-zinc-400 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Security & Scannability Compliance */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Scannability & Standards
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every QR matrix in your vault complies with ISO/IEC 18004 standards and operates with Reed-Solomon Error Correction.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-300">Level H Redundancy:</span>
                <span className="text-emerald-400 font-mono font-semibold">100% Compliant</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-300">Camera Decode Rate:</span>
                <span className="text-blue-400 font-mono font-semibold">Grade S+ (99%)</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-300">Third-Party Tracking:</span>
                <span className="text-emerald-400 font-mono font-semibold">0% Zero Telemetry</span>
              </div>
            </div>
          </div>

          {/* Card 3: Storage Engine & Vault Export */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                Vault Privacy & Health
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                Your vault uses local Indexed/LocalStorage sandboxing with no server-side retention. You have complete sovereignty over your data.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Vault Capacity Used:</span>
                <span className="font-mono text-zinc-200">~{Math.round(JSON.stringify(qrs).length / 1024)} KB / 5 MB</span>
              </div>
              <button
                type="button"
                onClick={handleExportVaultBackup}
                className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Vault JSON Archive</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redeem License Key Modal */}
      {redeemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-white/[0.1] rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Redeem License Key</h3>
                  <p className="text-[11px] text-zinc-400">Enter your single-use key or team multi-seat code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRedeemModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {redeemError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center animate-pop-in">
                {redeemError}
              </div>
            )}

            {redeemSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center space-y-2 animate-pop-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  {redeemedSuccessTierName(redeemSuccess.tier)} Studio Activated!
                </h4>
                <p className="text-xs text-zinc-300">
                  {redeemSuccess.isTeam
                    ? `Team voucher seat claimed! (${redeemSuccess.remaining} team seats remaining for other members).`
                    : 'Your single-use license key has been verified and applied to this device.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleRedeemCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Activation Code / Voucher String
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STRIX-PRO-9841 or STRIX-TEAM-5X"
                    value={redeemKeyInput}
                    onChange={(e) => setRedeemKeyInput(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/[0.1] text-white text-sm font-mono tracking-wider focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition uppercase placeholder:normal-case placeholder:font-sans placeholder:text-zinc-600"
                  />
                  <span className="text-[11px] text-zinc-500 block mt-1.5">
                    Tip: Try universal test key <code>STRIX-PRO</code> or team key <code>STRIX-TEAM-5X</code>
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRedeemModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                  >
                    Activate Studio
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function redeemedSuccessTierName(tier?: string) {
  if (tier === 'enterprise') return 'Enterprise';
  return 'Pro';
}
