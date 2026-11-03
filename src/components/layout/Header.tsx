import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top micro-bar for local market authority */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-slate-800/80 py-1.5 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium text-[11px] border border-emerald-500/20">
              100% Free Lifetime Guarantee
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-300 font-medium">
              Trusted by Businesses across Chicago, New York & Canada
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">A Product by</span>
            <a
              href="https://strixdevs.com"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-semibold tracking-wide transition"
            >
              strix-devs ↗
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
            SQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Strix<span className="text-indigo-400">QR</span>
              </span>
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
            onClick={() => setActiveView('generator')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeView === 'generator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Generate QR
          </button>
          <button
            onClick={() => setActiveView('scanner')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeView === 'scanner'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scan Camera
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              Admin
            </button>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer text-xs"
            title={`Toggle Theme`}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>

          <button
            onClick={() => onNavigateToSection('why-expire')}
            className="hidden lg:inline text-xs text-slate-300 hover:text-indigo-300 transition font-medium cursor-pointer"
          >
            Why Competitors Expire
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToSection('sponsor-section')}
            className="hidden sm:inline-flex"
          >
            Sponsor & Advertise
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

