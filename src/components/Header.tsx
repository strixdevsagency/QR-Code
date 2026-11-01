import React from 'react';
import { QrCode, Scan, ShieldCheck, Sparkles, Building2, Flame } from 'lucide-react';

interface HeaderProps {
  activeTab: 'generate' | 'scan';
  setActiveTab: (tab: 'generate' | 'scan') => void;
  onNavigateToSection: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onNavigateToSection }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      {/* Top micro-bar for market presence */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-slate-800/80 py-1.5 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium text-[11px] border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> 100% Free Lifetime Guarantee
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-300 font-medium">
              Trusted by Businesses across Chicago, New York & Canada
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">A Product by</span>
            <a
              href="https://strixdevs.com"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-semibold tracking-wide flex items-center gap-1 transition"
            >
              strix-devs <Sparkles className="w-3 h-3 text-amber-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Strix<span className="text-indigo-400">QR</span></span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO FREE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">No trial traps • Direct permanent codes</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'generate'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Generate QR</span>
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'scan'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Scan Camera</span>
          </button>
        </div>

        {/* Action / Sponsor Link */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigateToSection('why-expire')}
            className="text-xs text-slate-300 hover:text-indigo-300 transition font-medium flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Why Competitors Expire
          </button>
          <button
            onClick={() => onNavigateToSection('sponsor-section')}
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-slate-200 px-3.5 py-2 rounded-lg transition font-medium flex items-center gap-1.5 shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sponsor & Advertise</span>
          </button>
        </div>
      </div>
    </header>
  );
};
