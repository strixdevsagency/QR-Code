import React from 'react';
import { StrixLogo } from '../StrixLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#09090b] py-14 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <StrixLogo className="h-8 w-auto" />
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
              A high-utility, permanent vector QR code & 2D matrix engine by <strong className="text-zinc-200">StrixDevs</strong>. Built for developers, designers, and modern products with 100% client-side matrix rendering.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-zinc-400">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                Zero Tracking
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                100% Client-Side
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                Vector SVG / 300 DPI
              </span>
            </div>
          </div>

          {/* StrixDevs Engineering Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
              Explore & Resources
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <a href="#use-cases" className="hover:text-[#38bdf8] transition-colors">
                  Industry Solutions
                </a>
              </li>
              <li>
                <a href="#why-expire" className="hover:text-[#38bdf8] transition-colors">
                  Static vs. Redirect Architecture
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#38bdf8] transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#38bdf8] transition-colors">
                  Contact & Enterprise Support
                </a>
              </li>
              <li>
                <a href="/llms.txt" target="_blank" className="hover:text-[#38bdf8] transition-colors">
                  AI Context (llms.txt)
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance & Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
              Trust & Standards
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              ISO/IEC 18004 compliant 2D symbology with <span className="whitespace-nowrap">Reed-Solomon</span> Error Correction. Zero middleman telemetry and zero server data retention.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.08] text-[11px] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Reed-Solomon Level H Matrix</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} StrixDevs. All rights reserved.</p>
          <p>
            Engineered by{' '}
            <a href="https://strixdevs.com" target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-white font-medium transition">
              StrixDevs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
