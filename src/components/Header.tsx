import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { QrCode, Scan, ShieldCheck, Sparkles, Building2, Flame, Sun, Moon, LayoutDashboard, Shield, LogOut, User as UserIcon } from 'lucide-react';

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
        <div
          onClick={() => setActiveView('generator')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
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
            onClick={() => setActiveView('generator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeView === 'generator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Generate QR</span>
          </button>
          <button
            onClick={() => setActiveView('scanner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeView === 'scanner'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Scan Camera</span>
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Action / Sponsor Link / Theme Toggle / Auth */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={() => onNavigateToSection('why-expire')}
            className="hidden lg:flex text-xs text-slate-300 hover:text-indigo-300 transition font-medium items-center gap-1 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Why Competitors Expire
          </button>

          <button
            onClick={() => onNavigateToSection('sponsor-section')}
            className="hidden sm:flex text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-slate-200 px-3.5 py-2 rounded-lg transition font-medium items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sponsor & Advertise</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-semibold text-slate-300">
                {user?.name?.split(' ')[0]}
              </span>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition border border-transparent hover:border-rose-900 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
