import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="text-center max-w-3xl mx-auto pt-6 pb-4 sm:pt-10 sm:pb-6 relative">
      {/* Ambient background radiant aura in logo cyan & deep black */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[480px] sm:w-[640px] h-[280px] bg-gradient-to-tr from-[#38bdf8]/15 via-cyan-500/10 to-transparent rounded-full blur-[90px] pointer-events-none -z-10 animate-pulse-glow" />

      {/* Authority Status Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-white/[0.1] text-zinc-300 text-xs font-medium mb-5 shadow-lg shadow-black/40 relative overflow-hidden group cursor-default transition-all hover:border-[#38bdf8]/40">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#38bdf8]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse shrink-0" aria-hidden="true" />
        <span>Precision Vector Studio • 100% Client-Side</span>
      </div>

      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent leading-[1.12] drop-shadow-sm text-balance">
        Production-Ready QR Codes <br className="hidden sm:inline" />
        for Modern Products
      </h1>

      <p className="mt-3.5 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed text-balance">
        Generate custom, non-expiring QR codes with instant vector SVG and 300 DPI PDF exports. Encoded directly in your browser with zero middleman redirects and zero tracking.
      </p>

      {/* Semantic Keyword Pillars */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-zinc-400">
        <span className="px-3 py-1 rounded-lg bg-zinc-900/70 border border-white/[0.08] text-zinc-300 font-medium">
          Direct Matrix Encoding
        </span>
        <span className="px-3 py-1 rounded-lg bg-zinc-900/70 border border-white/[0.08] text-zinc-300 font-medium">
          Print-Ready Vector SVG & PDF
        </span>
        <span className="px-3 py-1 rounded-lg bg-zinc-900/70 border border-white/[0.08] text-zinc-300 font-medium">
          Zero Server Latency
        </span>
      </div>
    </section>
  );
};
