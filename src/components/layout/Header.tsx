import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  LogOut,
  Shield,
  Menu,
  X,
  Layers,
  ScanLine,
  LayoutDashboard,
  ChevronDown,
  Check,
} from 'lucide-react';
import { StrixLogo } from '../StrixLogo';
import { useAuth } from '../../context/AuthContext';
import { playTactileClick } from '../../utils/audioFeedback';

interface HeaderProps {
  activeView: 'generator' | 'bulk' | 'scanner' | 'dashboard' | 'admin';
  setActiveView: (view: 'generator' | 'bulk' | 'scanner' | 'dashboard' | 'admin') => void;
  onOpenAuth: () => void;
  onOpenPricing?: () => void;
  onNavigateToSection: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenAuth,
  onOpenPricing,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Handle view change with tactile feedback
  const handleNavClick = (view: 'generator' | 'bulk' | 'scanner' | 'dashboard' | 'admin') => {
    playTactileClick();
    setActiveView(view);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-2xl transition-all">
        {/* Subtle luminous accent highlight */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* 1. Brand Identity */}
          <div
            onClick={() => handleNavClick('generator')}
            className="flex items-center cursor-pointer select-none group shrink-0 transition-transform active:scale-[0.98]"
            title="Strix QR"
          >
            <StrixLogo className="h-8 sm:h-8.5 w-auto" />
          </div>

          {/* 2. Desktop Floating Capsule Navigation */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl bg-zinc-900/70 backdrop-blur-2xl border border-white/[0.08] shadow-xl shadow-black/40 ring-1 ring-white/[0.04]">
            <button
              onClick={() => handleNavClick('generator')}
              className={`px-3 lg:px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-[0.96] ${
                activeView === 'generator'
                  ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-md shadow-[#38bdf8]/10 border border-[#38bdf8]/35 ring-1 ring-[#38bdf8]/25 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
              }`}
            >
              <QrCode className={`w-3.5 h-3.5 ${activeView === 'generator' ? 'text-[#38bdf8]' : 'text-zinc-400'}`} aria-hidden="true" />
              <span>Generator</span>
            </button>

            <button
              onClick={() => handleNavClick('bulk')}
              className={`px-3 lg:px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-[0.96] ${
                activeView === 'bulk'
                  ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-md shadow-[#38bdf8]/10 border border-[#38bdf8]/35 ring-1 ring-[#38bdf8]/25 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${activeView === 'bulk' ? 'text-[#38bdf8]' : 'text-zinc-400'}`} aria-hidden="true" />
              <span>Bulk Batch</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40">
                Pro
              </span>
            </button>

            <button
              onClick={() => handleNavClick('scanner')}
              className={`px-3 lg:px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-[0.96] ${
                activeView === 'scanner'
                  ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-md shadow-[#38bdf8]/10 border border-[#38bdf8]/35 ring-1 ring-[#38bdf8]/25 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
              }`}
            >
              <ScanLine className={`w-3.5 h-3.5 ${activeView === 'scanner' ? 'text-[#38bdf8]' : 'text-zinc-400'}`} aria-hidden="true" />
              <span>Scanner</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                onOpenPricing?.();
              }}
              className="px-3 lg:px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-[#38bdf8] hover:bg-zinc-800/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.96]"
            >
              <span>Pricing</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`px-3 lg:px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-[0.96] ${
                  activeView === 'dashboard'
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-md shadow-[#38bdf8]/10 border border-[#38bdf8]/35 ring-1 ring-[#38bdf8]/25 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                }`}
              >
                <LayoutDashboard className={`w-3.5 h-3.5 ${activeView === 'dashboard' ? 'text-[#38bdf8]' : 'text-zinc-400'}`} aria-hidden="true" />
                <span>Vault</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 lg:px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.96] ${
                  activeView === 'admin'
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-md shadow-[#38bdf8]/10 border border-[#38bdf8]/35 ring-1 ring-[#38bdf8]/25 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                }`}
              >
                <Shield className={`w-3.5 h-3.5 ${activeView === 'admin' ? 'text-[#38bdf8]' : 'text-zinc-400'}`} aria-hidden="true" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* 3. Right User Actions (Desktop & Mobile) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Desktop User Status / Account Dropdown */}
            <div className="hidden sm:block">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-white/20 flex items-center justify-center text-[11px] font-bold text-white shadow-inner">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950 absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <span className="text-xs font-medium max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Popover Card */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-900/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl shadow-black/80 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* User Bio Header */}
                      <div className="px-3.5 py-2 border-b border-white/[0.08]">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-white">{user?.name}</p>
                          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {isAdmin ? 'Master' : 'Pro'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user?.email}</p>
                      </div>

                      {/* Navigation Shortcuts */}
                      <div className="py-1 px-1.5 space-y-0.5">
                        <button
                          onClick={() => handleNavClick('dashboard')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-amber-400" />
                          <span>My Saved Vault</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleNavClick('admin')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-indigo-400" />
                            <span>Administrative Control</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            playTactileClick();
                            setIsUserMenuOpen(false);
                            onOpenPricing?.();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span>Plans & Pricing</span>
                          </div>
                          <span className="text-[10px] font-semibold text-blue-400">Upgrade</span>
                        </button>
                      </div>

                      {/* Live System Status Pill */}
                      <div className="mx-2 my-1 px-3 py-1.5 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Engine Status</span>
                        </span>
                        <span className="text-emerald-400 font-mono font-medium">100% Client</span>
                      </div>

                      {/* Logout Action */}
                      <div className="pt-1.5 px-1.5 border-t border-white/[0.08]">
                        <button
                          onClick={() => {
                            playTactileClick();
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out of Strix QR</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    playTactileClick();
                    onOpenAuth();
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-white/[0.12] bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-[#38bdf8] hover:border-[#38bdf8]/40 font-medium text-xs shadow-sm transition-all active:scale-[0.97] cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => {
                playTactileClick();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="md:hidden p-2 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer active:scale-[0.96]"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 4. Mobile Drawer Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-zinc-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => handleNavClick('generator')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                  activeView === 'generator'
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 text-[#38bdf8]" />
                  <span>QR Generator</span>
                </div>
                {activeView === 'generator' && <Check className="w-4 h-4 text-[#38bdf8]" />}
              </button>

              <button
                onClick={() => handleNavClick('bulk')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                  activeView === 'bulk'
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#38bdf8]" />
                  <span>Bulk Batch</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40">
                  Pro
                </span>
              </button>

              <button
                onClick={() => handleNavClick('scanner')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                  activeView === 'scanner'
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ScanLine className="w-4 h-4 text-[#38bdf8]" />
                  <span>Optical Scanner</span>
                </div>
                {activeView === 'scanner' && <Check className="w-4 h-4 text-[#38bdf8]" />}
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                    activeView === 'dashboard'
                      ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-[#38bdf8]" />
                    <span>My Saved Vault</span>
                  </div>
                  {activeView === 'dashboard' && <Check className="w-4 h-4 text-[#38bdf8]" />}
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                    activeView === 'admin'
                      ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-[#38bdf8]" />
                    <span>Admin Suite</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40">
                    Master
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  playTactileClick();
                  setIsMobileMenuOpen(false);
                  onOpenPricing?.();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span>Plans & Pricing</span>
                </div>
                <span className="text-[10px] font-semibold text-blue-400">Pro</span>
              </button>
            </div>

            {/* Mobile User Profile or Sign-in */}
            <div className="pt-3 border-t border-white/[0.08]">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{user?.name}</p>
                      <p className="text-[11px] text-zinc-400">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playTactileClick();
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    playTactileClick();
                    onOpenAuth();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs py-2.5 rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
                >
                  Sign In / Create Free Account
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}
    </>
  );
};
