import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  activeView: 'generator' | 'scanner' | 'dashboard' | 'admin';
  setActiveView: (view: 'generator' | 'scanner' | 'dashboard' | 'admin') => void;
  onOpenAuth: () => void;
  onNavigateToSection: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenAuth,
  onNavigateToSection,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-[#090d16] sticky top-0 z-50">
      {/* Top corporate micro-bar */}
      <div className="bg-[#060910] border-b border-slate-800/80 py-1.5 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-medium text-[11px] border border-emerald-800/40">
              Free Lifetime Static Codes
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-300">
              Official StrixDevs Utility • Trusted by Businesses Worldwide
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">By</span>
            <a
              href="https://strixdevs.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-white font-semibold transition"
            >
              StrixDevs ↗
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div
          onClick={() => setActiveView('generator')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            SQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">StrixQR</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Official
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Direct static encoding • No expiration</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-[#111827] border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('generator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeView === 'generator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Generate QR
          </button>
          <button
            onClick={() => setActiveView('scanner')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeView === 'scanner'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Scan Camera
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Dashboard
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin Panel
            </button>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToSection('why-expire')}
            className="hidden lg:inline text-xs text-slate-400 hover:text-slate-200 transition font-medium cursor-pointer"
          >
            Why Competitors Expire
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToSection('sponsor-section')}
            className="hidden sm:inline-flex"
          >
            Sponsor / Advertise
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-semibold text-slate-300">
                {user?.name?.split(' ')[0]}
              </span>
              <Button variant="danger" size="sm" onClick={logout}>
                Log Out
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={onOpenAuth}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
