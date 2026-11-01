import React from 'react';
import { QrCode, Shield, ExternalLink, Heart, Code2, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Strix<span className="text-indigo-400">QR</span></span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              A high-utility, non-expiring QR code engine built by <strong className="text-slate-200">StrixDevs</strong>. Serving businesses, restaurants, and digital agencies across Chicago, New York, Toronto, and worldwide with 100% free lifetime static codes.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                📍 Chicago, IL
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                📍 New York, NY
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                📍 Toronto, CA
              </span>
            </div>
          </div>

          {/* StrixDevs Agency Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-400" />
              StrixDevs Products & Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="https://strixdevs.com" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition flex items-center gap-1">
                  Custom Web & App Development <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="flex items-center gap-1 text-slate-400">
                <Lock className="w-3 h-3 text-cyan-400" /> Strix Password Vault <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1 rounded">Coming Soon</span>
              </li>
              <li>
                <a href="#sponsor-section" className="hover:text-indigo-400 transition">
                  Corporate Sponsorships
                </a>
              </li>
              <li>
                <a href="/llms.txt" target="_blank" className="hover:text-indigo-400 transition">
                  AI Documentation (llms.txt)
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance & Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Trust & Compliance
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Compliant with Google AdSense Policies, GDPR, and CCPA standards. 100% client-side data privacy with zero server logging.
            </p>
            <div className="text-[11px] text-slate-500">
              Protected by Reed-Solomon Error Correction Code (Level H / Q).
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} StrixDevs (strix-devs). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> by{' '}
            <a href="https://strixdevs.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              StrixDevs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
