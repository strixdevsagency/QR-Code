import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="text-center max-w-3xl mx-auto my-6 sm:my-8">
      {/* Top micro-tag for local market authority */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
        <span>Built by StrixDevs • Serving Chicago, New York & Canada</span>
      </div>

      {/* Main Semantic Heading */}
      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
        100% Free Lifetime <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300">
          QR Code Generator & Scanner
        </span>
      </h1>

      {/* Psychology-Driven Value Subtitle */}
      <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Never worry about your QR codes expiring after a 14-day trial. Direct static encoding ensures your business cards, menus, and stickers work permanently with zero monthly fees.
      </p>

      {/* Core Trust Indicators */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
        <span className="text-emerald-400 font-medium">✓ Direct Static Codes</span>
        <span>•</span>
        <span className="text-emerald-400 font-medium">✓ High-DPI Vector Print Exports</span>
        <span>•</span>
        <span className="text-emerald-400 font-medium">✓ No Credit Card Required</span>
      </div>
    </section>
  );
};

