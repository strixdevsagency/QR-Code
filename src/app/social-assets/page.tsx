'use client';

import React from 'react';
import { StrixLogo } from '../../components/StrixLogo';
import { Shield, Sparkles, Check, Layers, Zap, ArrowRight, Printer } from 'lucide-react';

export default function SocialAssetsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-16 flex flex-col items-center">
      <div className="text-center max-w-xl">
        <h1 className="text-2xl font-bold text-white">Strix QR — Social Media Launch Assets</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Pixel-perfect marketing cards for LinkedIn, Facebook (1200x630), and Instagram (1080x1080).
        </p>
      </div>

      {/* ==================================================================== */}
      {/* 1. LINKEDIN & FACEBOOK POST BANNER (1200 x 630)                      */}
      {/* ==================================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-2">
          <span>1. LinkedIn & Facebook Card (1200x630)</span>
          <span className="text-[#38bdf8]">#social-card-landscape</span>
        </div>

        <div
          id="social-card-landscape"
          style={{ width: '1200px', height: '630px' }}
          className="relative bg-[#09090b] rounded-3xl p-14 border border-white/[0.12] overflow-hidden flex flex-col justify-between shadow-2xl select-none"
        >
          {/* Luminous Ambient Background Glows */}
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#38bdf8]/15 rounded-full blur-[120px] pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20" />
          
          {/* Subtle Grid Matrix Background */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Top Row: Logo Lockup & Launch Tag */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <StrixLogo className="h-12 w-auto" />
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
              <span>Official Release · Launching This Friday</span>
            </div>
          </div>

          {/* Middle Main Content */}
          <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
            {/* Left 7 Cols: Typography & Value Proposition */}
            <div className="col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Hostage Guarantee · 100% Free Forever</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
                The 14-Day QR Code <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-[#38bdf8]">
                  Trial Trap Is Over.
                </span>
              </h2>

              <p className="text-base text-zinc-300 leading-relaxed max-w-xl">
                Generate custom, non-expiring QR codes with instant vector SVG and 300 DPI print-ready PDFs. Encoded directly in your browser with zero middleman redirect servers.
              </p>

              {/* 4 Feature Pills */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-xs font-semibold text-zinc-200">
                  <Check className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span>Scalable Vector SVG & PDF</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-xs font-semibold text-zinc-200">
                  <Check className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span>Never-Expiring Static Matrix</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-xs font-semibold text-zinc-200">
                  <Check className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span>Bulk 1,000+ Codes via CSV</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-xs font-semibold text-zinc-200">
                  <Check className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span>Zero Server Surveillance</span>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Visual 2D Matrix Preview Card */}
            <div className="col-span-5 flex justify-center">
              <div className="relative p-6 rounded-3xl bg-zinc-900/90 border border-white/[0.15] shadow-2xl shadow-black/80 backdrop-blur-2xl">
                {/* Corner reticle brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#38bdf8]" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#38bdf8]" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#38bdf8]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#38bdf8]" />

                {/* QR Visual */}
                <div className="bg-white p-5 rounded-2xl shadow-inner">
                  {/* Clean SVG Matrix graphic */}
                  <svg viewBox="0 0 100 100" className="w-48 h-48">
                    {/* Top Left Eye */}
                    <rect x="5" y="5" width="28" height="28" rx="6" fill="#09090b" />
                    <rect x="9" y="9" width="20" height="20" rx="4" fill="#ffffff" />
                    <rect x="13" y="13" width="12" height="12" rx="3" fill="#38bdf8" />

                    {/* Top Right Eye */}
                    <rect x="67" y="5" width="28" height="28" rx="6" fill="#09090b" />
                    <rect x="71" y="9" width="20" height="20" rx="4" fill="#ffffff" />
                    <rect x="75" y="13" width="12" height="12" rx="3" fill="#38bdf8" />

                    {/* Bottom Left Eye */}
                    <rect x="5" y="67" width="28" height="28" rx="6" fill="#09090b" />
                    <rect x="9" y="71" width="20" height="20" rx="4" fill="#ffffff" />
                    <rect x="13" y="75" width="12" height="12" rx="3" fill="#38bdf8" />

                    {/* Matrix Dots */}
                    <rect x="38" y="8" width="8" height="8" rx="2" fill="#09090b" />
                    <rect x="50" y="8" width="8" height="8" rx="2" fill="#38bdf8" />
                    <rect x="38" y="20" width="8" height="8" rx="2" fill="#09090b" />
                    <rect x="8" y="38" width="8" height="8" rx="2" fill="#38bdf8" />
                    <rect x="20" y="38" width="8" height="8" rx="2" fill="#09090b" />
                    <rect x="38" y="38" width="24" height="24" rx="4" fill="#09090b" />
                    <rect x="67" y="38" width="8" height="8" rx="2" fill="#38bdf8" />
                    <rect x="84" y="38" width="8" height="8" rx="2" fill="#09090b" />
                    <rect x="38" y="67" width="8" height="8" rx="2" fill="#38bdf8" />
                    <rect x="50" y="67" width="8" height="8" rx="2" fill="#09090b" />
                    <rect x="67" y="67" width="8" height="8" rx="2" fill="#09090b" />
                    <rect x="84" y="67" width="8" height="8" rx="2" fill="#38bdf8" />
                    <rect x="38" y="84" width="8" height="8" rx="2" fill="#09090b" />
                    <rect x="50" y="84" width="8" height="8" rx="2" fill="#38bdf8" />
                    <rect x="67" y="84" width="8" height="8" rx="2" fill="#09090b" />
                    <rect x="84" y="84" width="8" height="8" rx="2" fill="#38bdf8" />
                  </svg>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                    Print Ready · Level H Redundancy
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Link & Engineering Attribution */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] relative z-10 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold tracking-tight">qr.strixdevs.com</span>
              <span>— Free Forever, No Signup Needed</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-zinc-500">
              <span>Engineered by</span>
              <strong className="text-zinc-300">StrixDevs</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. INSTAGRAM SQUARE POST BANNER (1080 x 1080)                         */}
      {/* ==================================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-2">
          <span>2. Instagram Square Post (1080x1080)</span>
          <span className="text-[#38bdf8]">#social-card-square</span>
        </div>

        <div
          id="social-card-square"
          style={{ width: '1080px', height: '1080px' }}
          className="relative bg-[#09090b] rounded-3xl p-16 border border-white/[0.12] overflow-hidden flex flex-col justify-between shadow-2xl select-none"
        >
          {/* Luminous Glows */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#38bdf8]/15 rounded-full blur-[140px] pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none -ml-20 -mb-20" />

          {/* Top Logo */}
          <div className="flex items-center justify-between relative z-10">
            <StrixLogo className="h-14 w-auto" />
            <div className="px-4 py-2 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-mono font-bold uppercase tracking-wider">
              Launching This Friday
            </div>
          </div>

          {/* Central Hero Block */}
          <div className="space-y-6 text-center relative z-10 my-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 mx-auto">
              <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              <span>Say Goodbye to Expiring QR Codes</span>
            </div>

            <h2 className="text-6xl font-black text-white tracking-tight leading-[1.1]">
              The 14-Day QR Code <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-[#38bdf8]">
                Trap Is Over.
              </span>
            </h2>

            <p className="text-lg text-zinc-300 max-w-xl mx-auto leading-relaxed">
              Never pay $35/month to keep your printed restaurant menus, packaging, or business cards alive.
            </p>

            {/* Comparison Side-by-Side */}
            <div className="grid grid-cols-2 gap-5 max-w-2xl mx-auto pt-4 text-left">
              {/* Other Generators */}
              <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>❌</span> Other QR Generators
                </div>
                <ul className="text-xs text-zinc-300 space-y-1.5">
                  <li>• Codes deactivate after 14 days</li>
                  <li>• Demand $350+/year subscription</li>
                  <li>• Low-resolution blurry PNG exports</li>
                  <li>• Creepy user tracking & redirects</li>
                </ul>
              </div>

              {/* Strix QR */}
              <div className="p-5 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 space-y-2">
                <div className="text-[#38bdf8] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>✅</span> Strix QR
                </div>
                <ul className="text-xs text-white space-y-1.5 font-medium">
                  <li>• 100% Free Forever & Never Expire</li>
                  <li>• Scalable Vector SVG & 300 DPI PDF</li>
                  <li>• Custom Brand Logos & Gradients</li>
                  <li>• 100% Client-Side Privacy</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="relative z-10 pt-6 border-t border-white/[0.08] flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-white tracking-tight block">qr.strixdevs.com</span>
              <span className="text-xs text-zinc-400">Launch Day: This Friday · Free Forever</span>
            </div>

            <div className="px-6 py-3 rounded-2xl bg-[#38bdf8] text-[#09090b] font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#38bdf8]/25">
              <span>Try The Engine</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
